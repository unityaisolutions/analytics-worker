CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    event_type TEXT,
    page_url TEXT,
    user_agent TEXT,
    ip_address TEXT,
    country TEXT,
    city TEXT,
    device_type TEXT,
    extra_data TEXT, -- JSON string for custom interaction data (e.g., clicks, time spent)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);