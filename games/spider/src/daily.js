export const SPIDER_DAILY_KEY = 'tzt-spider-daily-v1';

export function dailyDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function hashSeed(text) {
  let hash = 2166136261;
  for (const char of text) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}

export function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let result = value;
    result = Math.imul(result ^ result >>> 15, result | 1);
    result ^= result + Math.imul(result ^ result >>> 7, result | 61);
    return ((result ^ result >>> 14) >>> 0) / 4294967296;
  };
}

export function normalizeDailyRecords(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(record => record && /^\d{4}-\d{2}-\d{2}$/.test(record.date) && Number(record.seconds) > 0)
    .map(record => ({ date: record.date, seconds: Math.round(Number(record.seconds)), moves: Math.max(1, Math.round(Number(record.moves) || 1)) }))
    .sort((a, b) => a.seconds - b.seconds).slice(0, 10);
}

export function recordDailyCompletion(records, completion) {
  const withoutSameDay = normalizeDailyRecords(records).filter(record => record.date !== completion.date || record.seconds <= completion.seconds);
  if (withoutSameDay.some(record => record.date === completion.date)) return withoutSameDay;
  return normalizeDailyRecords([...withoutSameDay, completion]);
}

export function loadDailyRecords(storage = globalThis.localStorage) {
  try { return normalizeDailyRecords(JSON.parse(storage?.getItem(SPIDER_DAILY_KEY) || '[]')); }
  catch { return []; }
}

export function saveDailyRecords(records, storage = globalThis.localStorage) {
  const normalized = normalizeDailyRecords(records);
  storage?.setItem(SPIDER_DAILY_KEY, JSON.stringify(normalized));
  return normalized;
}
