export const GAME_RULES = Object.freeze({
  racing: { metric: "duration", min: 20_000, max: 900_000 },
  spider: { metric: "duration", min: 20_000, max: 86_400_000 },
  minesweeper: { metric: "duration", min: 1_000, max: 3_600_000 },
  "2048": { metric: "score", min: 2, max: 100_000_000 },
});

const MODE_PATTERN = /^[a-z0-9][a-z0-9:_-]{0,63}$/i;
const RUN_PATTERN = /^[a-z0-9][a-z0-9._:-]{5,95}$/i;

export function normalizeNickname(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16);
}

export function validateScorePayload(payload) {
  const gameId = String(payload?.gameId ?? "").toLowerCase();
  const rule = GAME_RULES[gameId];
  if (!rule) throw new Error("不支持这个游戏");

  const mode = String(payload?.mode ?? "").toLowerCase();
  if (!MODE_PATTERN.test(mode)) throw new Error("排行榜模式无效");

  const runId = String(payload?.runId ?? "");
  if (!RUN_PATTERN.test(runId)) throw new Error("对局编号无效");

  const score = Math.round(Number(payload?.score) || 0);
  const durationMs = Math.round(Number(payload?.durationMs) || 0);
  const value = rule.metric === "score" ? score : durationMs;
  if (!Number.isFinite(value) || value < rule.min || value > rule.max) {
    throw new Error("成绩超出合理范围");
  }

  const metadata = sanitizeMetadata(payload?.metadata);
  return { gameId, mode, runId, score, durationMs, value, metric: rule.metric, metadata };
}

export function sanitizeMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const safe = {};
  for (const [key, raw] of Object.entries(value).slice(0, 12)) {
    if (!/^[a-z][a-z0-9_]{0,31}$/i.test(key)) continue;
    if (typeof raw === "string") safe[key] = raw.slice(0, 80);
    else if (typeof raw === "number" && Number.isFinite(raw)) safe[key] = raw;
    else if (typeof raw === "boolean") safe[key] = raw;
  }
  return safe;
}

export function isBetter(metric, candidate, current) {
  if (current == null) return true;
  return metric === "score" ? candidate > current : candidate < current;
}
