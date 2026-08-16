import { GAME_RULES, isBetter, normalizeNickname, validateFeedbackPayload, validateScorePayload } from "./rules.js";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
let schemaReady;

function ensureSchema(env) {
  if (!schemaReady) schemaReady = env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, nickname TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS leaderboard_entries (player_id TEXT NOT NULL, game_id TEXT NOT NULL, mode TEXT NOT NULL, metric TEXT NOT NULL CHECK(metric IN ('score','duration')), value INTEGER NOT NULL, score INTEGER NOT NULL DEFAULT 0, duration_ms INTEGER NOT NULL DEFAULT 0, metadata TEXT NOT NULL DEFAULT '{}', run_id TEXT NOT NULL, achieved_at INTEGER NOT NULL, PRIMARY KEY (player_id, game_id, mode), FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_leaderboard_lookup ON leaderboard_entries(game_id, mode, value, achieved_at)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS score_submissions (id TEXT PRIMARY KEY, player_id TEXT NOT NULL, game_id TEXT NOT NULL, mode TEXT NOT NULL, run_id TEXT NOT NULL, value INTEGER NOT NULL, score INTEGER NOT NULL DEFAULT 0, duration_ms INTEGER NOT NULL DEFAULT 0, metadata TEXT NOT NULL DEFAULT '{}', submitted_at INTEGER NOT NULL, accepted INTEGER NOT NULL DEFAULT 0, FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_submissions_player_time ON score_submissions(player_id, submitted_at DESC)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS feedback_messages (id TEXT PRIMARY KEY, category TEXT NOT NULL, message TEXT NOT NULL, contact TEXT NOT NULL DEFAULT '', locale TEXT NOT NULL, page TEXT NOT NULL, fingerprint_hash TEXT NOT NULL, created_at INTEGER NOT NULL)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_messages(created_at DESC)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_feedback_rate ON feedback_messages(fingerprint_hash, created_at DESC)`),
  ]).catch(error => { schemaReady = undefined; throw error; });
  return schemaReady;
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extraHeaders } });
}

function randomToken(bytes = 24) {
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...data)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function hashToken(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
}

async function clientFingerprint(request) {
  const source = `${request.headers.get("CF-Connecting-IP") || "unknown"}|${request.headers.get("user-agent") || "unknown"}`;
  return (await hashToken(source)).slice(0, 32);
}

async function readJson(request) {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new Error("请求格式必须是JSON");
  const text = await request.text();
  if (text.length > 8_192) throw new Error("请求内容过大");
  return JSON.parse(text || "{}");
}

async function authenticate(request, env) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+([A-Za-z0-9_-]{24,128})$/);
  if (!match) return null;
  const tokenHash = await hashToken(match[1]);
  return env.DB.prepare("SELECT id, nickname FROM players WHERE token_hash = ?1").bind(tokenHash).first();
}

async function verifyTurnstile(request, env, token) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET);
  form.set("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const result = await response.json();
  return result.success === true;
}

async function createPlayer(request, env) {
  const body = await readJson(request);
  const nickname = normalizeNickname(body.nickname);
  if (nickname.length < 2) return json({ error: "昵称至少需要2个字符" }, 400);
  if (!(await verifyTurnstile(request, env, body.turnstileToken))) return json({ error: "人机验证失败，请重试" }, 403);

  const id = crypto.randomUUID();
  const token = randomToken(32);
  const tokenHash = await hashToken(token);
  const now = Date.now();
  await env.DB.prepare("INSERT INTO players (id, nickname, token_hash, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)")
    .bind(id, nickname, tokenHash, now).run();
  return json({ player: { id, nickname }, token }, 201);
}

async function updatePlayer(request, env, player) {
  const body = await readJson(request);
  const nickname = normalizeNickname(body.nickname);
  if (nickname.length < 2) return json({ error: "昵称至少需要2个字符" }, 400);
  await env.DB.prepare("UPDATE players SET nickname = ?1, updated_at = ?2 WHERE id = ?3")
    .bind(nickname, Date.now(), player.id).run();
  return json({ player: { id: player.id, nickname } });
}

async function submitFeedback(request, env) {
  let entry;
  try { entry = validateFeedbackPayload(await readJson(request)); }
  catch (error) { return json({ error: error.message || "意见内容无效" }, 400); }
  if (entry.website) return json({ accepted: true }, 201);

  const now = Date.now();
  const fingerprint = await clientFingerprint(request);
  const rate = await env.DB.prepare(`SELECT COUNT(*) AS total, MAX(created_at) AS latest FROM feedback_messages
    WHERE fingerprint_hash = ?1 AND created_at > ?2`).bind(fingerprint, now - 3_600_000).first();
  if (Number(rate?.total || 0) >= 5 || (rate?.latest && now - Number(rate.latest) < 30_000)) {
    return json({ error: "提交过于频繁，请稍后再试" }, 429);
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO feedback_messages
    (id, category, message, contact, locale, page, fingerprint_hash, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`)
    .bind(id, entry.category, entry.message, entry.contact, entry.locale, entry.page, fingerprint, now).run();
  return json({ accepted: true, id }, 201);
}

async function submitScore(request, env, player) {
  let entry;
  try { entry = validateScorePayload(await readJson(request)); }
  catch (error) { return json({ error: error.message || "成绩无效" }, 400); }

  const now = Date.now();
  const recent = await env.DB.prepare("SELECT submitted_at FROM score_submissions WHERE player_id = ?1 ORDER BY submitted_at DESC LIMIT 1")
    .bind(player.id).first();
  if (recent && now - recent.submitted_at < 750) return json({ error: "提交过于频繁，请稍后再试" }, 429);

  const existing = await env.DB.prepare("SELECT value FROM leaderboard_entries WHERE player_id = ?1 AND game_id = ?2 AND mode = ?3")
    .bind(player.id, entry.gameId, entry.mode).first();
  const accepted = isBetter(entry.metric, entry.value, existing?.value);

  await env.DB.prepare(`INSERT INTO score_submissions
      (id, player_id, game_id, mode, run_id, value, score, duration_ms, metadata, submitted_at, accepted)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`)
    .bind(crypto.randomUUID(), player.id, entry.gameId, entry.mode, entry.runId, entry.value, entry.score,
      entry.durationMs, JSON.stringify(entry.metadata), now, accepted ? 1 : 0).run();

  if (accepted) {
    await env.DB.prepare(`INSERT INTO leaderboard_entries
        (player_id, game_id, mode, metric, value, score, duration_ms, metadata, run_id, achieved_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
        ON CONFLICT(player_id, game_id, mode) DO UPDATE SET
          metric=excluded.metric, value=excluded.value, score=excluded.score,
          duration_ms=excluded.duration_ms, metadata=excluded.metadata,
          run_id=excluded.run_id, achieved_at=excluded.achieved_at`)
      .bind(player.id, entry.gameId, entry.mode, entry.metric, entry.value, entry.score, entry.durationMs,
        JSON.stringify(entry.metadata), entry.runId, now).run();
  }

  const operator = entry.metric === "score" ? ">" : "<";
  const rankRow = await env.DB.prepare(`SELECT 1 + COUNT(*) AS rank FROM leaderboard_entries
    WHERE game_id = ?1 AND mode = ?2 AND value ${operator} ?3`)
    .bind(entry.gameId, entry.mode, accepted ? entry.value : existing.value).first();
  return json({ accepted, personalBest: accepted, rank: Number(rankRow?.rank || 1) });
}

async function getLeaderboard(url, env) {
  const gameId = String(url.searchParams.get("game") || "").toLowerCase();
  const mode = String(url.searchParams.get("mode") || "").toLowerCase();
  const rule = GAME_RULES[gameId];
  if (!rule || !/^[a-z0-9][a-z0-9:_-]{0,63}$/i.test(mode)) return json({ error: "排行榜参数无效" }, 400);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const order = rule.metric === "score" ? "DESC" : "ASC";
  const result = await env.DB.prepare(`SELECT p.id AS player_id, p.nickname, e.value, e.score,
      e.duration_ms, e.metadata, e.achieved_at
    FROM leaderboard_entries e JOIN players p ON p.id = e.player_id
    WHERE e.game_id = ?1 AND e.mode = ?2
    ORDER BY e.value ${order}, e.achieved_at ASC LIMIT ?3`)
    .bind(gameId, mode, limit).run();
  return json({ gameId, mode, metric: rule.metric, entries: result.results.map((row, index) => ({
    rank: index + 1,
    playerId: row.player_id,
    nickname: row.nickname,
    value: row.value,
    score: row.score,
    durationMs: row.duration_ms,
    metadata: JSON.parse(row.metadata || "{}"),
    achievedAt: row.achieved_at,
  })) }, 200, { "cache-control": "public, max-age=15" });
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/api/health") return json({ ok: true, version: 2 });
  if (request.method === "GET" && url.pathname === "/api/leaderboard") return getLeaderboard(url, env);
  if (request.method === "POST" && url.pathname === "/api/players") return createPlayer(request, env);
  if (request.method === "POST" && url.pathname === "/api/feedback") return submitFeedback(request, env);

  const player = await authenticate(request, env);
  if (!player) return json({ error: "玩家身份无效，请重新设置昵称" }, 401);
  if (request.method === "PATCH" && url.pathname === "/api/players/me") return updatePlayer(request, env, player);
  if (request.method === "GET" && url.pathname === "/api/players/me") return json({ player });
  if (request.method === "POST" && url.pathname === "/api/scores") return submitScore(request, env, player);
  return json({ error: "接口不存在" }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (!env.DB) return json({ error: "排行榜数据库尚未配置" }, 503);
    try { await ensureSchema(env); return await handleApi(request, env); }
    catch (error) {
      console.error(error);
      return json({ error: "服务器暂时无法处理请求" }, 500);
    }
  },
};
