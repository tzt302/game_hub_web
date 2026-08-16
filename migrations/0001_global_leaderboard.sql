CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  player_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  metric TEXT NOT NULL CHECK(metric IN ('score', 'duration')),
  value INTEGER NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  metadata TEXT NOT NULL DEFAULT '{}',
  run_id TEXT NOT NULL,
  achieved_at INTEGER NOT NULL,
  PRIMARY KEY (player_id, game_id, mode),
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_lookup
  ON leaderboard_entries(game_id, mode, value, achieved_at);

CREATE TABLE IF NOT EXISTS score_submissions (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  run_id TEXT NOT NULL,
  value INTEGER NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  metadata TEXT NOT NULL DEFAULT '{}',
  submitted_at INTEGER NOT NULL,
  accepted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_submissions_player_time
  ON score_submissions(player_id, submitted_at DESC);
