-- ================================================
-- Analytics SQL Queries
-- Useful queries for analyzing collected events
-- ================================================

-- Connect to database:
-- sqlite3 analytics.db

-- ================================================
-- OVERVIEW STATISTICS
-- ================================================

-- Total events and users
SELECT 
  COUNT(*) as total_events,
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT DATE(timestamp)) as active_days
FROM events;

-- Events breakdown by type
SELECT 
  event_name,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM events), 2) as percentage
FROM events
GROUP BY event_name
ORDER BY count DESC;

-- ================================================
-- TIME-BASED ANALYSIS
-- ================================================

-- Events by hour (today)
SELECT 
  strftime('%H:00', timestamp) as hour,
  COUNT(*) as events,
  COUNT(DISTINCT user_id) as unique_users
FROM events
WHERE DATE(timestamp) = DATE('now')
GROUP BY strftime('%H', timestamp)
ORDER BY hour;

-- Events by day (last 30 days)
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as events,
  COUNT(DISTINCT user_id) as unique_users
FROM events
WHERE timestamp >= datetime('now', '-30 days')
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Events by day of week
SELECT 
  CASE CAST(strftime('%w', timestamp) AS INTEGER)
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END as day_of_week,
  COUNT(*) as events
FROM events
WHERE timestamp >= datetime('now', '-30 days')
GROUP BY strftime('%w', timestamp)
ORDER BY CAST(strftime('%w', timestamp) AS INTEGER);

-- ================================================
-- USER ANALYSIS
-- ================================================

-- Most active users
SELECT 
  user_id,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as sessions,
  MIN(timestamp) as first_seen,
  MAX(timestamp) as last_seen,
  COUNT(DISTINCT DATE(timestamp)) as active_days
FROM events
GROUP BY user_id
ORDER BY event_count DESC
LIMIT 20;

-- New users by day (last 30 days)
SELECT 
  DATE(first_seen) as date,
  COUNT(*) as new_users
FROM (
  SELECT 
    user_id,
    MIN(timestamp) as first_seen
  FROM events
  GROUP BY user_id
)
WHERE first_seen >= datetime('now', '-30 days')
GROUP BY DATE(first_seen)
ORDER BY date DESC;

-- User retention (users active N days ago who returned)
SELECT 
  days_ago,
  users_active as initial_users,
  users_returned,
  ROUND(100.0 * users_returned / users_active, 2) as retention_rate
FROM (
  SELECT 
    7 as days_ago,
    (SELECT COUNT(DISTINCT user_id) FROM events WHERE DATE(timestamp) = DATE('now', '-7 days')) as users_active,
    (SELECT COUNT(DISTINCT user_id) FROM events WHERE user_id IN (
      SELECT DISTINCT user_id FROM events WHERE DATE(timestamp) = DATE('now', '-7 days')
    ) AND DATE(timestamp) > DATE('now', '-7 days')) as users_returned
  UNION ALL
  SELECT 
    14 as days_ago,
    (SELECT COUNT(DISTINCT user_id) FROM events WHERE DATE(timestamp) = DATE('now', '-14 days')) as users_active,
    (SELECT COUNT(DISTINCT user_id) FROM events WHERE user_id IN (
      SELECT DISTINCT user_id FROM events WHERE DATE(timestamp) = DATE('now', '-14 days')
    ) AND DATE(timestamp) > DATE('now', '-14 days')) as users_returned
  UNION ALL
  SELECT 
    30 as days_ago,
    (SELECT COUNT(DISTINCT user_id) FROM events WHERE DATE(timestamp) = DATE('now', '-30 days')) as users_active,
    (SELECT COUNT(DISTINCT user_id) FROM events WHERE user_id IN (
      SELECT DISTINCT user_id FROM events WHERE DATE(timestamp) = DATE('now', '-30 days')
    ) AND DATE(timestamp) > DATE('now', '-30 days')) as users_returned
);

-- ================================================
-- SESSION ANALYSIS
-- ================================================

-- Session details for a specific user
-- Replace 'USER_ID_HERE' with actual user_id
SELECT 
  session_id,
  COUNT(*) as events,
  MIN(timestamp) as session_start,
  MAX(timestamp) as session_end,
  ROUND(
    (julianday(MAX(timestamp)) - julianday(MIN(timestamp))) * 24 * 60,
    1
  ) as duration_minutes
FROM events
WHERE user_id = 'USER_ID_HERE'
GROUP BY session_id
ORDER BY session_start DESC;

-- Average session duration
SELECT 
  ROUND(AVG(duration_minutes), 2) as avg_session_duration_minutes,
  ROUND(AVG(event_count), 2) as avg_events_per_session
FROM (
  SELECT 
    session_id,
    COUNT(*) as event_count,
    (julianday(MAX(timestamp)) - julianday(MIN(timestamp))) * 24 * 60 as duration_minutes
  FROM events
  GROUP BY session_id
  HAVING duration_minutes > 0
);

-- ================================================
-- SCANNING ANALYSIS
-- ================================================

-- Scan conversion funnel
SELECT 
  'Attempts' as step,
  (SELECT COUNT(*) FROM events WHERE event_name = 'scan.attempt') as count,
  100.0 as conversion_rate
UNION ALL
SELECT 
  'Success' as step,
  (SELECT COUNT(*) FROM events WHERE event_name = 'scan.success') as count,
  ROUND(100.0 * (SELECT COUNT(*) FROM events WHERE event_name = 'scan.success') / 
    NULLIF((SELECT COUNT(*) FROM events WHERE event_name = 'scan.attempt'), 0), 2) as conversion_rate
UNION ALL
SELECT 
  'Failed' as step,
  (SELECT COUNT(*) FROM events WHERE event_name = 'scan.fail') as count,
  ROUND(100.0 * (SELECT COUNT(*) FROM events WHERE event_name = 'scan.fail') / 
    NULLIF((SELECT COUNT(*) FROM events WHERE event_name = 'scan.attempt'), 0), 2) as conversion_rate;

-- Scan success rate by method
SELECT 
  json_extract(properties, '$.method') as scan_method,
  COUNT(*) as attempts,
  SUM(CASE WHEN event_name = 'scan.success' THEN 1 ELSE 0 END) as success,
  ROUND(100.0 * SUM(CASE WHEN event_name = 'scan.success' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM events
WHERE event_name IN ('scan.attempt', 'scan.success', 'scan.fail')
  AND properties IS NOT NULL
GROUP BY scan_method
ORDER BY success_rate DESC;

-- Average scan duration
SELECT 
  json_extract(properties, '$.method') as scan_method,
  COUNT(*) as scans,
  ROUND(AVG(json_extract(properties, '$.duration_ms')), 0) as avg_duration_ms
FROM events
WHERE event_name = 'scan.success'
  AND json_extract(properties, '$.duration_ms') IS NOT NULL
GROUP BY scan_method;

-- ================================================
-- DOCUMENT ANALYSIS
-- ================================================

-- Document lifecycle funnel
SELECT 
  'Opened' as step,
  (SELECT COUNT(*) FROM events WHERE event_name = 'document.opened') as count,
  100.0 as conversion_rate
UNION ALL
SELECT 
  'Saved' as step,
  (SELECT COUNT(*) FROM events WHERE event_name = 'document.saved') as count,
  ROUND(100.0 * (SELECT COUNT(*) FROM events WHERE event_name = 'document.saved') / 
    NULLIF((SELECT COUNT(*) FROM events WHERE event_name = 'document.opened'), 0), 2) as conversion_rate
UNION ALL
SELECT 
  'Completed' as step,
  (SELECT COUNT(*) FROM events WHERE event_name = 'document.completed') as count,
  ROUND(100.0 * (SELECT COUNT(*) FROM events WHERE event_name = 'document.completed') / 
    NULLIF((SELECT COUNT(*) FROM events WHERE event_name = 'document.opened'), 0), 2) as conversion_rate
UNION ALL
SELECT 
  'Cancelled' as step,
  (SELECT COUNT(*) FROM events WHERE event_name = 'document.cancelled') as count,
  ROUND(100.0 * (SELECT COUNT(*) FROM events WHERE event_name = 'document.cancelled') / 
    NULLIF((SELECT COUNT(*) FROM events WHERE event_name = 'document.opened'), 0), 2) as conversion_rate;

-- Documents by type
SELECT 
  json_extract(properties, '$.document_type') as doc_type,
  COUNT(*) as documents,
  COUNT(DISTINCT user_id) as unique_users
FROM events
WHERE event_name = 'document.opened'
  AND properties IS NOT NULL
GROUP BY doc_type
ORDER BY documents DESC;

-- Average document completion time
SELECT 
  json_extract(properties, '$.document_type') as doc_type,
  COUNT(*) as completed,
  ROUND(AVG(json_extract(properties, '$.duration_seconds') / 60.0), 1) as avg_duration_minutes
FROM events
WHERE event_name = 'document.completed'
  AND json_extract(properties, '$.duration_seconds') IS NOT NULL
GROUP BY doc_type;

-- ================================================
-- PERFORMANCE ANALYSIS
-- ================================================

-- Screen load times
SELECT 
  json_extract(properties, '$.screen') as screen,
  COUNT(*) as measurements,
  ROUND(AVG(json_extract(properties, '$.load_time_ms')), 0) as avg_load_ms,
  ROUND(MIN(json_extract(properties, '$.load_time_ms')), 0) as min_load_ms,
  ROUND(MAX(json_extract(properties, '$.load_time_ms')), 0) as max_load_ms
FROM events
WHERE event_name = 'screen.load_time'
  AND json_extract(properties, '$.load_time_ms') IS NOT NULL
GROUP BY screen
ORDER BY avg_load_ms DESC;

-- Page performance metrics
SELECT 
  COUNT(*) as measurements,
  ROUND(AVG(json_extract(properties, '$.dns_time')), 0) as avg_dns_ms,
  ROUND(AVG(json_extract(properties, '$.connect_time')), 0) as avg_connect_ms,
  ROUND(AVG(json_extract(properties, '$.response_time')), 0) as avg_response_ms,
  ROUND(AVG(json_extract(properties, '$.dom_load_time')), 0) as avg_dom_load_ms,
  ROUND(AVG(json_extract(properties, '$.total_load_time')), 0) as avg_total_load_ms
FROM events
WHERE event_name = 'page.performance';

-- ================================================
-- ERROR ANALYSIS
-- ================================================

-- Top errors
SELECT 
  json_extract(properties, '$.message') as error_message,
  json_extract(properties, '$.component') as component,
  COUNT(*) as occurrences,
  COUNT(DISTINCT user_id) as affected_users,
  MAX(timestamp) as last_seen
FROM events
WHERE event_name = 'error'
  AND properties IS NOT NULL
GROUP BY error_message, component
ORDER BY occurrences DESC
LIMIT 20;

-- Errors by day
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as errors,
  COUNT(DISTINCT user_id) as affected_users
FROM events
WHERE event_name = 'error'
  AND timestamp >= datetime('now', '-30 days')
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Error rate
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as total_events,
  SUM(CASE WHEN event_name = 'error' THEN 1 ELSE 0 END) as errors,
  ROUND(100.0 * SUM(CASE WHEN event_name = 'error' THEN 1 ELSE 0 END) / COUNT(*), 2) as error_rate
FROM events
WHERE timestamp >= datetime('now', '-30 days')
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- ================================================
-- DEVICE & BROWSER ANALYSIS
-- ================================================

-- Events by device
SELECT 
  json_extract(context, '$.device') as device,
  COUNT(*) as events,
  COUNT(DISTINCT user_id) as users
FROM events
WHERE context IS NOT NULL
GROUP BY device
ORDER BY events DESC;

-- Events by browser
SELECT 
  json_extract(context, '$.browser') as browser,
  COUNT(*) as events,
  COUNT(DISTINCT user_id) as users
FROM events
WHERE context IS NOT NULL
GROUP BY browser
ORDER BY events DESC;

-- Online vs offline events
SELECT 
  json_extract(context, '$.networkStatus') as network_status,
  COUNT(*) as events,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM events), 2) as percentage
FROM events
WHERE context IS NOT NULL
GROUP BY network_status;

-- ================================================
-- CUSTOM FUNNEL ANALYSIS
-- ================================================

-- Custom funnel: Screen View → Scan → Confirm
-- Shows drop-off at each step
WITH funnel_users AS (
  SELECT DISTINCT user_id FROM events WHERE event_name = 'screen_view'
),
scan_users AS (
  SELECT DISTINCT user_id FROM events WHERE event_name = 'scan.success'
),
confirm_users AS (
  SELECT DISTINCT user_id FROM events WHERE event_name = 'confirm'
)
SELECT 
  'Step 1: View Screen' as step,
  (SELECT COUNT(*) FROM funnel_users) as users,
  100.0 as conversion
UNION ALL
SELECT 
  'Step 2: Scan' as step,
  (SELECT COUNT(*) FROM scan_users) as users,
  ROUND(100.0 * (SELECT COUNT(*) FROM scan_users) / (SELECT COUNT(*) FROM funnel_users), 2) as conversion
UNION ALL
SELECT 
  'Step 3: Confirm' as step,
  (SELECT COUNT(*) FROM confirm_users) as users,
  ROUND(100.0 * (SELECT COUNT(*) FROM confirm_users) / (SELECT COUNT(*) FROM funnel_users), 2) as conversion;

-- ================================================
-- CUSTOM INTERFACES ANALYSIS
-- ================================================

-- Распределение событий по типу интерфейса
SELECT 
  json_extract(context, '$.interfaceType') as interface_type,
  COUNT(*) as events,
  COUNT(DISTINCT user_id) as users,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM events), 2) as percentage
FROM events
WHERE context IS NOT NULL
GROUP BY interface_type
ORDER BY events DESC;

-- Популярные кастомные конфигурации
SELECT 
  json_extract(context, '$.interfaceConfigId') as config_id,
  json_extract(context, '$.interfaceConfigVersion') as config_version,
  COUNT(*) as events,
  COUNT(DISTINCT user_id) as users,
  MIN(timestamp) as first_used,
  MAX(timestamp) as last_used
FROM events
WHERE json_extract(context, '$.interfaceType') = 'custom'
  AND json_extract(context, '$.interfaceConfigId') IS NOT NULL
GROUP BY config_id, config_version
ORDER BY events DESC;

-- Популярность кнопок в кастомных интерфейсах
SELECT 
  json_extract(context, '$.interfaceConfigId') as config_id,
  json_extract(properties, '$.button_label') as button_label,
  json_extract(properties, '$.button_action') as button_action,
  COUNT(*) as clicks,
  COUNT(DISTINCT user_id) as users
FROM events
WHERE event_name = 'custom_interface.button_click'
GROUP BY config_id, button_label, button_action
ORDER BY clicks DESC
LIMIT 20;

-- Тепловая карта позиций кнопок
SELECT 
  json_extract(properties, '$.button_position.row') as row,
  json_extract(properties, '$.button_position.col') as col,
  COUNT(*) as clicks,
  GROUP_CONCAT(DISTINCT json_extract(properties, '$.button_label')) as labels
FROM events
WHERE event_name = 'custom_interface.button_click'
GROUP BY row, col
ORDER BY row, col;

-- Загрузки конфигураций
SELECT 
  json_extract(properties, '$.schema_id') as schema_id,
  json_extract(properties, '$.load_source') as load_source,
  COUNT(*) as loads,
  COUNT(DISTINCT user_id) as users,
  DATE(timestamp) as date
FROM events
WHERE event_name = 'custom_interface.loaded'
GROUP BY schema_id, load_source, date
ORDER BY date DESC, loads DESC;

-- Успешность сканирования QR-кодов
SELECT 
  json_extract(properties, '$.success') as success,
  json_extract(properties, '$.error') as error,
  COUNT(*) as scans,
  COUNT(DISTINCT user_id) as users
FROM events
WHERE event_name = 'custom_interface.qr_scan'
GROUP BY success, error
ORDER BY scans DESC;

-- Сравнение эффективности интерфейсов
SELECT 
  json_extract(context, '$.interfaceType') as interface_type,
  AVG(json_extract(properties, '$.duration_seconds')) as avg_duration_seconds,
  COUNT(*) as completed_docs
FROM events
WHERE event_name = 'document.completed'
GROUP BY interface_type;

-- Переход со стандартного на кастомный интерфейс
SELECT 
  user_id,
  MIN(CASE WHEN json_extract(context, '$.interfaceType') = 'standard' THEN timestamp END) as first_standard,
  MIN(CASE WHEN json_extract(context, '$.interfaceType') = 'custom' THEN timestamp END) as first_custom
FROM events
GROUP BY user_id
HAVING first_standard IS NOT NULL AND first_custom IS NOT NULL
  AND first_custom > first_standard;

-- ================================================
-- EXPORT QUERIES
-- ================================================

-- Export all events as CSV (for Excel/Tableau)
-- Run: sqlite3 -header -csv analytics.db < export.sql > events.csv
.mode csv
.headers on
.output events.csv
SELECT 
  id,
  event_name,
  user_id,
  session_id,
  timestamp,
  properties,
  context,
  created_at
FROM events
ORDER BY created_at DESC;
.output stdout


