const PROFILE_KEY = "tzt-global-player-v1";

const TEXT = {
  "zh": { global:"全球排行榜", empty:"还没有成绩，来拿下第一名吧", player:"玩家昵称", save:"保存昵称", cancel:"取消", rename:"设置昵称", loading:"正在读取全球排名…", offline:"全球榜暂时无法连接，本地记录不受影响", best:"新个人最佳！全球第 {rank} 名", kept:"成绩已提交，个人最佳仍是第 {rank} 名", submit:"提交成绩失败" },
  "zh-hant": { global:"全球排行榜", empty:"還沒有成績，來拿下第一名吧", player:"玩家暱稱", save:"儲存暱稱", cancel:"取消", rename:"設定暱稱", loading:"正在讀取全球排名…", offline:"全球榜暫時無法連線，本機紀錄不受影響", best:"新個人最佳！全球第 {rank} 名", kept:"成績已提交，個人最佳仍是第 {rank} 名", submit:"提交成績失敗" },
  "en": { global:"Global leaderboard", empty:"No scores yet — take the first place", player:"Player name", save:"Save name", cancel:"Cancel", rename:"Set name", loading:"Loading global rankings…", offline:"Global rankings are offline; local records are safe", best:"New personal best! Global rank #{rank}", kept:"Submitted. Your best remains #{rank}", submit:"Could not submit score" },
};

function language() {
  const raw = (document.documentElement.lang || navigator.language || "en").toLowerCase();
  if (raw.startsWith("zh-tw") || raw.startsWith("zh-hk") || raw.includes("hant")) return "zh-hant";
  if (raw.startsWith("zh")) return "zh";
  return "en";
}

function t(key, values = {}) {
  let result = (TEXT[language()] || TEXT.en)[key] || TEXT.en[key] || key;
  for (const [name, value] of Object.entries(values)) result = result.replace(`{${name}}`, value);
  return result;
}

function readProfile() {
  try {
    const value = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    return value?.token && value?.player?.id ? value : null;
  } catch { return null; }
}

export function hasGlobalPlayer() {
  return Boolean(readProfile());
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[character]);
}

function defaultValue(value, metric) {
  if (metric === "score") return Number(value || 0).toLocaleString();
  const milliseconds = Math.max(0, Number(value || 0));
  const minutes = Math.floor(milliseconds / 60_000);
  const seconds = Math.floor(milliseconds % 60_000 / 1_000);
  const millis = Math.floor(milliseconds % 1_000);
  return minutes ? `${minutes}:${String(seconds).padStart(2,"0")}.${String(millis).padStart(3,"0")}` : `${seconds}.${String(millis).padStart(3,"0")}s`;
}

async function api(path, options = {}) {
  const profile = readProfile();
  const headers = { ...(options.body ? { "content-type":"application/json" } : {}), ...options.headers };
  if (profile?.token) headers.authorization = `Bearer ${profile.token}`;
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function askNickname(current = "") {
  return new Promise(resolve => {
    const overlay = document.createElement("div");
    overlay.className = "global-player-dialog";
    overlay.innerHTML = `<form><small>TZT PLAYER</small><h2>${t("player")}</h2><input maxlength="16" minlength="2" autocomplete="nickname" value="${escapeHtml(current)}" required><p>2–16 个字符；排行榜只公开昵称。</p><div><button type="button" data-cancel>${t("cancel")}</button><button type="submit">${t("save")}</button></div></form>`;
    document.body.append(overlay);
    const input = overlay.querySelector("input");
    input.focus(); input.select();
    const close = value => { overlay.remove(); resolve(value); };
    overlay.querySelector("[data-cancel]").addEventListener("click", () => close(null));
    overlay.addEventListener("click", event => { if (event.target === overlay) close(null); });
    overlay.querySelector("form").addEventListener("submit", event => {
      event.preventDefault();
      const value = input.value.trim();
      if (value.length >= 2) close(value);
    });
  });
}

async function ensureProfile(forceRename = false) {
  let profile = readProfile();
  if (profile && !forceRename) return profile;
  const nickname = await askNickname(profile?.player?.nickname || "");
  if (!nickname) return null;
  if (profile) {
    try {
      const result = await api("/api/players/me", { method:"PATCH", body:JSON.stringify({ nickname }) });
      profile.player = result.player;
      return saveProfile(profile);
    } catch (error) {
      if (error.status !== 401) throw error;
      localStorage.removeItem(PROFILE_KEY);
    }
  }
  const result = await api("/api/players", { method:"POST", body:JSON.stringify({ nickname }) });
  return saveProfile(result);
}

export function initGlobalLeaderboard({ gameId, mode = "classic", title = "", formatValue = defaultValue, mount } = {}) {
  let currentMode = typeof mode === "function" ? mode() : mode;
  const host = document.createElement("section");
  host.className = "global-leaderboard";
  host.innerHTML = `<header><div><small>WORLD RANKING</small><h2>${escapeHtml(title || t("global"))}</h2></div><button type="button" class="global-player-name">${escapeHtml(readProfile()?.player?.nickname || t("rename"))}</button></header><p class="global-board-status">${t("loading")}</p><ol class="global-board-list"></ol>`;
  const target = mount ? document.querySelector(mount) : document.querySelector("main");
  target?.append(host);
  const list = host.querySelector("ol");
  const status = host.querySelector(".global-board-status");
  const nameButton = host.querySelector(".global-player-name");

  async function refresh(nextMode) {
    currentMode = String(nextMode || (typeof mode === "function" ? mode() : currentMode));
    status.textContent = t("loading");
    try {
      const data = await api(`/api/leaderboard?game=${encodeURIComponent(gameId)}&mode=${encodeURIComponent(currentMode)}&limit=20`);
      status.textContent = data.entries.length ? `${data.entries.length} PLAYERS · ${currentMode}` : t("empty");
      const myId = readProfile()?.player?.id;
      list.innerHTML = data.entries.map(entry => `<li class="${entry.playerId === myId ? "is-me" : ""}"><i>${entry.rank}</i><strong>${escapeHtml(entry.nickname)}</strong><time>${escapeHtml(formatValue(entry.value, data.metric, entry))}</time></li>`).join("");
    } catch {
      status.textContent = t("offline");
      list.innerHTML = "";
    }
  }

  nameButton.addEventListener("click", async () => {
    try {
      const profile = await ensureProfile(true);
      if (profile) { nameButton.textContent = profile.player.nickname; refresh(); }
    } catch { status.textContent = t("offline"); }
  });

  async function submit({ score = 0, durationMs = 0, metadata = {}, runId, mode: scoreMode } = {}) {
    const profile = await ensureProfile();
    if (!profile) return { accepted:false, cancelled:true };
    nameButton.textContent = profile.player.nickname;
    const submittedMode = String(scoreMode || currentMode);
    try {
      const result = await api("/api/scores", { method:"POST", body:JSON.stringify({ gameId, mode:submittedMode, score, durationMs, metadata, runId }) });
      status.textContent = result.personalBest ? t("best", { rank:result.rank }) : t("kept", { rank:result.rank });
      if (submittedMode === currentMode) await refresh();
      return result;
    } catch (error) {
      if (error.status === 401) localStorage.removeItem(PROFILE_KEY);
      status.textContent = `${t("submit")} · ${error.message}`;
      return { accepted:false, error };
    }
  }

  refresh();
  return { element:host, refresh, submit, setMode:refresh };
}
