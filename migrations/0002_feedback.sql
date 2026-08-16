CREATE TABLE IF NOT EXISTS feedback_messages (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  locale TEXT NOT NULL,
  page TEXT NOT NULL,
  fingerprint_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_created
  ON feedback_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_rate
  ON feedback_messages(fingerprint_hash, created_at DESC);
