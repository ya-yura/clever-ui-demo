# Analytics Tracking Server

Minimal Node.js/Express server for receiving and storing analytics events from PWA applications.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Run

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server will start on **http://localhost:9001**

## 📋 Configuration

Create `.env` file in this directory:

```bash
# Server port
PORT=9001

# SQLite database path
DB_PATH=./analytics.db

# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:9000

# Fallback to JSONL if SQLite fails
JSONL_FALLBACK=false
```

## 📊 API Endpoints

### POST `/track`
Receive analytics events from clients.

**Request:**
```json
{
  "events": [
    {
      "event": "screen_view",
      "userId": "...",
      "sessionId": "...",
      "timestamp": "2025-11-12T10:00:00.000Z",
      "properties": { ... },
      "context": { ... }
    }
  ]
}
```

**Response:**
```json
{
  "received": 1,
  "stored": 1,
  "timestamp": "2025-11-12T10:00:00.500Z"
}
```

### GET `/stats?days=7`
Get aggregated statistics.

### GET `/events?limit=100&event_name=scan.success`
View recent events (for debugging).

### GET `/users`
Get user list with activity.

### GET `/funnel?events=screen_view,scan.attempt,scan.success`
Analyze conversion funnel.

### GET `/export?format=csv`
Export all events (CSV or JSON).

### GET `/health`
Health check endpoint.

## 💾 Database

Uses **SQLite** with WAL mode for better concurrent access.

### Tables

#### `events`
Main events storage.

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  properties TEXT,
  context TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `event_stats`
Aggregated statistics (for quick queries).

### Query Database

```bash
sqlite3 analytics.db
```

```sql
-- Top events today
SELECT event_name, COUNT(*) as count 
FROM events 
WHERE DATE(timestamp) = DATE('now')
GROUP BY event_name 
ORDER BY count DESC;
```

See more queries in `queries.sql`.

## 🔧 Troubleshooting

### SQLite errors

If SQLite fails to initialize, server will fall back to JSONL file storage (if `JSONL_FALLBACK=true`).

### CORS errors

Make sure your client origin is in `CORS_ORIGINS`:

```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:9000,https://your-domain.com
```

### Port already in use

Change port in `.env`:

```bash
PORT=9002
```

## 📈 Monitoring

### View real-time stats

```bash
# Get stats for last 7 days
curl http://localhost:9001/stats?days=7

# Get recent events
curl http://localhost:9001/events?limit=20

# Get user list
curl http://localhost:9001/users
```

### Export data

```bash
# Export as CSV
curl http://localhost:9001/export?format=csv > events.csv

# Export as JSON
curl http://localhost:9001/export?format=json > events.json
```

## 🐳 Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 9001

CMD ["node", "track-server.js"]
```

Build and run:

```bash
docker build -t analytics-server .
docker run -d -p 9001:9001 -v $(pwd)/data:/app/data analytics-server
```

## 🔐 Security

### Production Checklist

- [ ] Change default `CORS_ORIGINS` to your domain only
- [ ] Use HTTPS (reverse proxy with nginx/traefik)
- [ ] Add authentication if needed (API keys, JWT)
- [ ] Limit request size (`express.json({ limit: '10mb' })`)
- [ ] Add rate limiting (e.g., `express-rate-limit`)
- [ ] Regular database backups
- [ ] Monitor disk space

## 📝 License

MIT




