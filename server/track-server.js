/**
 * Analytics Tracking Server
 * 
 * Minimal Node.js/Express server for receiving and storing analytics events.
 * Stores events in SQLite database for easy querying and analysis.
 * 
 * Installation:
 *   npm install express better-sqlite3 cors
 * 
 * Run:
 *   node server/track-server.js
 * 
 * Or with Bun:
 *   bun run server/track-server.js
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// SQLite database
const Database = require('better-sqlite3');

// ==================== CONFIGURATION ====================

const CONFIG = {
  PORT: process.env.PORT || 9001,
  DB_PATH: process.env.DB_PATH || path.join(__dirname, 'analytics.db'),
  // Enable JSONL fallback if SQLite fails
  JSONL_FALLBACK: process.env.JSONL_FALLBACK === 'true',
  JSONL_PATH: path.join(__dirname, 'events.jsonl'),
  // CORS origins (comma-separated)
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:9000',
};

// ==================== DATABASE SETUP ====================

let db;
let useJsonlFallback = false;

try {
  db = new Database(CONFIG.DB_PATH);
  
  // Enable WAL mode for better concurrent access
  db.pragma('journal_mode = WAL');
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      user_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      properties TEXT,
      context TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_event_name (event_name),
      INDEX idx_user_id (user_id),
      INDEX idx_timestamp (timestamp)
    );
  `);
  
  // Create aggregated stats table (for quick queries)
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      event_name TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      unique_users INTEGER DEFAULT 0,
      UNIQUE(date, event_name)
    );
  `);
  
  console.log('✅ SQLite database initialized:', CONFIG.DB_PATH);
} catch (error) {
  console.error('❌ SQLite initialization failed:', error.message);
  
  if (CONFIG.JSONL_FALLBACK) {
    console.log('⚠️  Falling back to JSONL file storage');
    useJsonlFallback = true;
    
    // Ensure JSONL file exists
    if (!fs.existsSync(CONFIG.JSONL_PATH)) {
      fs.writeFileSync(CONFIG.JSONL_PATH, '');
    }
  } else {
    console.error('💥 Set JSONL_FALLBACK=true to use file storage');
    process.exit(1);
  }
}

// ==================== EXPRESS APP ====================

const app = express();

// Middleware
app.use(cors({
  origin: CONFIG.CORS_ORIGINS.split(','),
  methods: ['POST', 'GET'],
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    storage: useJsonlFallback ? 'jsonl' : 'sqlite',
    timestamp: new Date().toISOString(),
  });
});

// ==================== TRACKING ENDPOINT ====================

/**
 * POST /track
 * Accepts batch of analytics events
 * 
 * Body: { events: AnalyticsEvent[] }
 */
app.post('/track', async (req, res) => {
  try {
    const { events } = req.body;
    
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Expected { events: Array }',
      });
    }
    
    if (events.length === 0) {
      return res.status(200).json({ received: 0 });
    }
    
    // Store events
    const stored = useJsonlFallback 
      ? storeEventsJsonl(events)
      : storeEventsSqlite(events);
    
    console.log(`📊 Received ${events.length} events from user ${events[0]?.userId}`);
    
    res.status(200).json({
      received: events.length,
      stored,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error processing events:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// ==================== QUERY ENDPOINTS ====================

/**
 * GET /stats
 * Get aggregated statistics
 */
app.get('/stats', (req, res) => {
  if (useJsonlFallback) {
    return res.status(501).json({
      error: 'Not implemented for JSONL storage',
    });
  }
  
  try {
    const { days = 7 } = req.query;
    
    const stats = db.prepare(`
      SELECT 
        event_name,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM events
      WHERE timestamp >= datetime('now', '-' || ? || ' days')
      GROUP BY event_name
      ORDER BY count DESC
    `).all(days);
    
    const totalEvents = db.prepare(`
      SELECT COUNT(*) as total FROM events
      WHERE timestamp >= datetime('now', '-' || ? || ' days')
    `).get(days);
    
    const totalUsers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as total FROM events
      WHERE timestamp >= datetime('now', '-' || ? || ' days')
    `).get(days);
    
    res.json({
      period: `${days} days`,
      total_events: totalEvents.total,
      total_users: totalUsers.total,
      events: stats,
    });
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /events
 * Get recent events (for debugging)
 */
app.get('/events', (req, res) => {
  if (useJsonlFallback) {
    return res.status(501).json({
      error: 'Not implemented for JSONL storage',
    });
  }
  
  try {
    const { limit = 100, event_name, user_id } = req.query;
    
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];
    
    if (event_name) {
      query += ' AND event_name = ?';
      params.push(event_name);
    }
    
    if (user_id) {
      query += ' AND user_id = ?';
      params.push(user_id);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const events = db.prepare(query).all(...params);
    
    // Parse JSON fields
    const parsed = events.map(e => ({
      ...e,
      properties: e.properties ? JSON.parse(e.properties) : null,
      context: e.context ? JSON.parse(e.context) : null,
    }));
    
    res.json({
      count: parsed.length,
      events: parsed,
    });
  } catch (error) {
    console.error('❌ Error getting events:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /users
 * Get user list with activity
 */
app.get('/users', (req, res) => {
  if (useJsonlFallback) {
    return res.status(501).json({
      error: 'Not implemented for JSONL storage',
    });
  }
  
  try {
    const users = db.prepare(`
      SELECT 
        user_id,
        COUNT(*) as event_count,
        MIN(timestamp) as first_seen,
        MAX(timestamp) as last_seen
      FROM events
      GROUP BY user_id
      ORDER BY last_seen DESC
    `).all();
    
    res.json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('❌ Error getting users:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /funnel
 * Analyze conversion funnel
 */
app.get('/funnel', (req, res) => {
  if (useJsonlFallback) {
    return res.status(501).json({
      error: 'Not implemented for JSONL storage',
    });
  }
  
  try {
    const { events: funnelEvents = 'screen_view,scan.attempt,scan.success,confirm' } = req.query;
    const steps = funnelEvents.split(',');
    
    const funnel = steps.map((event, index) => {
      const result = db.prepare(`
        SELECT 
          COUNT(DISTINCT user_id) as users,
          COUNT(*) as events
        FROM events
        WHERE event_name = ?
      `).get(event.trim());
      
      return {
        step: index + 1,
        event: event.trim(),
        users: result.users,
        events: result.events,
      };
    });
    
    // Calculate conversion rates
    const withRates = funnel.map((step, index) => {
      if (index === 0) {
        return { ...step, conversion: 100 };
      }
      
      const prevUsers = funnel[index - 1].users;
      const conversion = prevUsers > 0 
        ? ((step.users / prevUsers) * 100).toFixed(2)
        : 0;
      
      return { ...step, conversion: parseFloat(conversion) };
    });
    
    res.json({
      funnel: withRates,
      overall_conversion: withRates[withRates.length - 1]?.conversion || 0,
    });
  } catch (error) {
    console.error('❌ Error analyzing funnel:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== STORAGE FUNCTIONS ====================

/**
 * Store events in SQLite
 */
function storeEventsSqlite(events) {
  const insert = db.prepare(`
    INSERT INTO events (event_name, user_id, session_id, timestamp, properties, context)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const insertMany = db.transaction((events) => {
    for (const event of events) {
      insert.run(
        event.event,
        event.userId,
        event.sessionId,
        event.timestamp,
        JSON.stringify(event.properties || null),
        JSON.stringify(event.context || null)
      );
    }
  });
  
  insertMany(events);
  
  return events.length;
}

/**
 * Store events in JSONL file (fallback)
 */
function storeEventsJsonl(events) {
  const lines = events.map(e => JSON.stringify(e)).join('\n') + '\n';
  fs.appendFileSync(CONFIG.JSONL_PATH, lines, 'utf8');
  return events.length;
}

// ==================== EXPORT ENDPOINT ====================

/**
 * GET /export
 * Export all events as CSV
 */
app.get('/export', (req, res) => {
  if (useJsonlFallback) {
    return res.status(501).json({
      error: 'Not implemented for JSONL storage',
    });
  }
  
  try {
    const { format = 'csv' } = req.query;
    
    const events = db.prepare(`
      SELECT * FROM events ORDER BY created_at DESC
    `).all();
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="events.json"');
      return res.json(events);
    }
    
    // CSV format
    const csv = eventsToCSV(events);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="events.csv"');
    res.send(csv);
  } catch (error) {
    console.error('❌ Error exporting:', error);
    res.status(500).json({ error: error.message });
  }
});

function eventsToCSV(events) {
  if (events.length === 0) return '';
  
  const headers = ['id', 'event_name', 'user_id', 'session_id', 'timestamp', 'properties', 'context', 'created_at'];
  const rows = events.map(e => 
    headers.map(h => {
      const val = e[h];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      return val;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

// ==================== START SERVER ====================

app.listen(CONFIG.PORT, () => {
  console.log('');
  console.log('🚀 Analytics Tracking Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Listening on port ${CONFIG.PORT}`);
  console.log(`💾 Storage: ${useJsonlFallback ? 'JSONL' : 'SQLite'}`);
  console.log(`🗄️  Database: ${CONFIG.DB_PATH}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  POST http://localhost:${CONFIG.PORT}/track     - Receive events`);
  console.log(`  GET  http://localhost:${CONFIG.PORT}/stats     - View statistics`);
  console.log(`  GET  http://localhost:${CONFIG.PORT}/events    - View recent events`);
  console.log(`  GET  http://localhost:${CONFIG.PORT}/users     - View user activity`);
  console.log(`  GET  http://localhost:${CONFIG.PORT}/funnel    - Analyze funnel`);
  console.log(`  GET  http://localhost:${CONFIG.PORT}/export    - Export data (CSV/JSON)`);
  console.log(`  GET  http://localhost:${CONFIG.PORT}/health    - Health check`);
  console.log('');
  console.log('📊 Ready to receive analytics!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  if (db) db.close();
  process.exit(0);
});



