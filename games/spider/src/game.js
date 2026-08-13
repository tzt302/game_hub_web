import { LEVELS, SUITS, SpiderGame, rankLabel } from "./engine.js";
import { dailyDateKey, hashSeed, loadDailyRecords, recordDailyCompletion, saveDailyRecords, seededRandom } from "./daily.js";

const table = document.querySelector("#tableau");
const levelButtons = [...document.querySelectorAll(".level")];
const message = document.querySelector("#message");
const moveCount = document.querySelector("#moveCount");
const completedCount = document.querySelector("#completedCount");
const completedRuns = document.querySelector("#completedRuns");
const difficultyLabel = document.querySelector("#difficultyLabel");
const stockButton = document.querySelector("#stockButton");
const stockCount = document.querySelector("#stockCount");
const dialog = document.querySelector("#dialog");
const winSummary = document.querySelector("#winSummary");
const elapsedTime = document.querySelector("#elapsedTime");
const dailyButton = document.querySelector("#dailyButton");
const dailyStatus = document.querySelector("#dailyStatus");
const dailyRecordsHost = document.querySelector("#dailyRecords");
const undoButton = document.querySelector("#undoButton");

let game = new SpiderGame("easy");
let selected = null;
let hintIndex = 0;
let hintTimer = null;
let dailyMode = false;
let challengeStartedAt = performance.now();
let elapsedSeconds = 0;
let timerId = null;
let dailyRecords = loadDailyRecords();
let pointerDrag = null;
let suppressClickUntil = 0;
let history = [];

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(seconds / 60)).padStart(2,"0")}:${String(seconds % 60).padStart(2,"0")}`;
}

function startClock() {
  clearInterval(timerId);
  challengeStartedAt = performance.now();
  elapsedSeconds = 0;
  elapsedTime.textContent = "00:00";
  timerId = setInterval(() => {
    elapsedSeconds = Math.floor((performance.now() - challengeStartedAt) / 1000);
    elapsedTime.textContent = formatDuration(elapsedSeconds);
  }, 500);
}

function renderDailyRecords() {
  const today = dailyDateKey();
  const todayRecord = dailyRecords.find(record => record.date === today);
  dailyStatus.textContent = todayRecord ? `今日最佳 ${formatDuration(todayRecord.seconds)}` : "今日尚未完成";
  if (!dailyRecords.length) {
    dailyRecordsHost.innerHTML = '<li class="empty-daily">完成每日挑战后，这里会记录你的完成速度</li>';
    return;
  }
  dailyRecordsHost.innerHTML = dailyRecords.map((record,index) => `<li><i>${index+1}</i><div><strong>${record.date}</strong><small>${record.moves} 步完成</small></div><time>${formatDuration(record.seconds)}</time></li>`).join("");
}

function cardTop(column, index) {
  let top = 0;
  for (let i = 0; i < index; i += 1) top += column[i].faceUp ? 30 : 16;
  return top;
}

function clearHighlights() {
  document.querySelectorAll(".hint-source,.hint-target").forEach((element) => element.classList.remove("hint-source", "hint-target"));
}

function cardRects() {
  return new Map([...table.querySelectorAll(".card[data-card-id]")].map((card) => [card.dataset.cardId, card.getBoundingClientRect()]));
}

function animateLayout(before) {
  if (!before.size || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  requestAnimationFrame(() => {
    table.querySelectorAll(".card[data-card-id]").forEach((card) => {
      const old = before.get(card.dataset.cardId);
      if (!old) return;
      const next = card.getBoundingClientRect();
      const dx = old.left - next.left;
      const dy = old.top - next.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      card.animate([
        { transform: `translate(calc(-50% + ${dx}px), ${dy}px)`, zIndex: 80 },
        { transform: "translate(-50%, 0)", zIndex: card.style.zIndex },
      ], { duration: 210, easing: "cubic-bezier(.2,.8,.2,1)" });
    });
  });
}

function refreshSelection() {
  table.querySelectorAll(".card.selected").forEach((card) => card.classList.remove("selected"));
  if (!selected) return;
  table.querySelectorAll(`.card[data-column="${selected.column}"]`).forEach((card) => {
    if (Number(card.dataset.index) >= selected.index) card.classList.add("selected");
  });
}

function render({ animate = false } = {}) {
  const before = animate ? cardRects() : new Map();
  table.replaceChildren();
  game.columns.forEach((column, columnIndex) => {
    const columnElement = document.createElement("div");
    columnElement.className = "column";
    columnElement.dataset.column = columnIndex;
    columnElement.setAttribute("aria-label", `第 ${columnIndex + 1} 列，共 ${column.length} 张牌`);
    column.forEach((card, cardIndex) => {
      const cardElement = document.createElement("button");
      cardElement.type = "button";
      cardElement.className = `card ${card.faceUp ? `face ${SUITS[card.suit].color}` : "back"}`;
      cardElement.dataset.column = columnIndex;
      cardElement.dataset.index = cardIndex;
      cardElement.dataset.cardId = card.id;
      cardElement.style.setProperty("--top", `${cardTop(column, cardIndex)}px`);
      cardElement.style.zIndex = cardIndex + 1;
      if (selected?.column === columnIndex && cardIndex >= selected.index) cardElement.classList.add("selected");
      if (card.faceUp) {
        const label = rankLabel(card.rank);
        const suit = SUITS[card.suit].symbol;
        cardElement.innerHTML = `<span class="corner"><b>${label}</b><i>${suit}</i></span><em>${suit}</em>`;
        cardElement.setAttribute("aria-label", `${label}${suit}`);
        cardElement.draggable = game.canSelect(columnIndex, cardIndex);
      } else {
        cardElement.innerHTML = "<span>♠</span>";
        cardElement.setAttribute("aria-label", "背面牌");
      }
      columnElement.append(cardElement);
    });
    if (!column.length) columnElement.innerHTML = '<span class="empty-column">K</span>';
    table.append(columnElement);
  });

  moveCount.textContent = game.moves;
  completedCount.textContent = game.completed.length;
  stockCount.textContent = game.stock.length;
  stockButton.disabled = game.stock.length === 0;
  stockButton.classList.toggle("empty", game.stock.length === 0);
  undoButton.disabled = history.length === 0;
  const level = LEVELS[game.level];
  difficultyLabel.textContent = dailyMode ? `每日挑战 · ${level.detail}` : `${level.label} · ${level.detail}`;
  completedRuns.innerHTML = game.completed.map((suit) => `<span>${SUITS[suit].symbol}<i>K—A</i></span>`).join("");
  animateLayout(before);
}

function setMessage(text, tone = "normal") {
  message.textContent = text;
  message.dataset.tone = tone;
}

function chooseCard(column, index) {
  clearHighlights();
  if (!game.canSelect(column, index)) {
    setMessage("只有同花色、连续递减的亮牌可以整体移动", "warn");
    return;
  }
  selected = { column, index };
  setMessage("已选中牌组，请点击目标列", "active");
  refreshSelection();
}

function tryMove(targetColumn) {
  if (!selected) return false;
  const beforeMove = game.snapshot();
  const moved = game.move(selected.column, selected.index, targetColumn);
  selected = null;
  if (!moved) setMessage("目标牌必须比移动牌大一点，空列则可以放任意牌", "warn");
  else {
    history.push(beforeMove);
    setMessage(game.won ? "八组牌全部完成！" : "移动成功", "success");
  }
  render({ animate: moved });
  if (game.won) {
    elapsedSeconds = Math.max(1, Math.floor((performance.now() - challengeStartedAt) / 1000));
    clearInterval(timerId);
    elapsedTime.textContent = formatDuration(elapsedSeconds);
    if (dailyMode) {
      dailyRecords = recordDailyCompletion(dailyRecords, { date:dailyDateKey(), seconds:elapsedSeconds, moves:game.moves });
      dailyRecords = saveDailyRecords(dailyRecords);
      renderDailyRecords();
    }
    winSummary.textContent = `${dailyMode ? "每日挑战" : `${LEVELS[game.level].label}难度`} · ${game.moves} 步 · ${formatDuration(elapsedSeconds)}`;
    dialog.hidden = false;
  }
  return moved;
}

table.addEventListener("click", (event) => {
  if (performance.now() < suppressClickUntil) return;
  const columnElement = event.target.closest(".column");
  const cardElement = event.target.closest(".card");
  if (!columnElement) return;
  const column = Number(columnElement.dataset.column);
  if (selected && (selected.column !== column || !cardElement || Number(cardElement.dataset.index) < selected.index)) {
    tryMove(column);
    return;
  }
  if (cardElement) chooseCard(column, Number(cardElement.dataset.index));
});

function removeDragGhost() {
  document.querySelector(".drag-stack")?.remove();
  table.querySelectorAll(".drag-over").forEach((column) => column.classList.remove("drag-over"));
}

table.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  const card = event.target.closest(".card.face");
  if (!card) return;
  const column = Number(card.dataset.column);
  const index = Number(card.dataset.index);
  if (!game.canSelect(column, index)) return;
  pointerDrag = { pointerId: event.pointerId, column, index, x: event.clientX, y: event.clientY, active: false };
  card.setPointerCapture?.(event.pointerId);
});

table.addEventListener("pointermove", (event) => {
  if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
  const distance = Math.hypot(event.clientX - pointerDrag.x, event.clientY - pointerDrag.y);
  if (!pointerDrag.active && distance < 7) return;
  if (!pointerDrag.active) {
    pointerDrag.active = true;
    selected = { column: pointerDrag.column, index: pointerDrag.index };
    refreshSelection();
    const ghost = document.createElement("div");
    ghost.className = "drag-stack";
    ghost.innerHTML = `<strong>${game.columns[pointerDrag.column].length - pointerDrag.index}</strong><span>张</span>`;
    document.body.append(ghost);
  }
  event.preventDefault();
  const ghost = document.querySelector(".drag-stack");
  if (ghost) ghost.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
  table.querySelectorAll(".drag-over").forEach((column) => column.classList.remove("drag-over"));
  document.elementFromPoint(event.clientX, event.clientY)?.closest(".column")?.classList.add("drag-over");
});

function finishPointerDrag(event) {
  if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
  const wasActive = pointerDrag.active;
  pointerDrag = null;
  if (!wasActive) return;
  event.preventDefault();
  suppressClickUntil = performance.now() + 350;
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".column");
  removeDragGhost();
  if (target) tryMove(Number(target.dataset.column));
  else { selected = null; refreshSelection(); setMessage("把牌拖到目标列即可移动", "active"); }
}

table.addEventListener("pointerup", finishPointerDrag);
table.addEventListener("pointercancel", (event) => {
  if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
  pointerDrag = null; selected = null; removeDragGhost(); refreshSelection();
});

table.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".card.face");
  if (!card) return;
  const column = Number(card.dataset.column);
  const index = Number(card.dataset.index);
  if (!game.canSelect(column, index)) return event.preventDefault();
  selected = { column, index };
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", `${column}:${index}`);
  card.classList.add("selected");
});

table.addEventListener("dragover", (event) => {
  if (event.target.closest(".column")) event.preventDefault();
});

table.addEventListener("drop", (event) => {
  event.preventDefault();
  const target = event.target.closest(".column");
  if (target) tryMove(Number(target.dataset.column));
});

stockButton.addEventListener("click", () => {
  selected = null;
  if (!game.stock.length) return setMessage("牌已经全部发完了", "warn");
  if (!game.canDeal()) return setMessage("补牌前，每一列都必须至少有一张牌", "warn");
  history.push(game.snapshot());
  game.deal();
  setMessage("已向每列补发一张牌", "success");
  render({ animate: true });
});

undoButton.addEventListener("click", () => {
  const previous = history.pop();
  if (!previous) return;
  game.restore(previous);
  selected = null;
  dialog.hidden = true;
  setMessage("已撤销上一步", "active");
  render({ animate: true });
});

document.querySelector("#hintButton").addEventListener("click", () => {
  clearTimeout(hintTimer);
  clearHighlights();
  const hints = game.hints();
  if (!hints.length) {
    if (game.stock.length && game.canDeal()) {
      stockButton.classList.add("hint-target");
      setMessage("当前没有合适移动，试试发下一排牌", "active");
      hintTimer = setTimeout(clearHighlights, 2200);
    } else if (game.stock.length) setMessage("先把空列补上牌，才能继续发牌", "warn");
    else setMessage("暂时没有可用移动，可以重新开一局", "warn");
    return;
  }
  const hint = hints[hintIndex % hints.length];
  hintIndex += 1;
  const source = table.querySelector(`.card[data-column="${hint.from}"][data-index="${hint.cardIndex}"]`);
  const target = table.querySelector(`.column[data-column="${hint.to}"]`);
  source?.classList.add("hint-source");
  target?.classList.add("hint-target");
  const reason = hint.revealsCard ? "，这一步能翻开暗牌" : hint.sameSuit ? "，可以接成同花序列" : "";
  setMessage(`提示：把第 ${hint.from + 1} 列移到第 ${hint.to + 1} 列${reason}`, "active");
  hintTimer = setTimeout(clearHighlights, 2600);
});

function start(level, options = {}) {
  clearTimeout(hintTimer);
  clearHighlights();
  dailyMode = Boolean(options.daily);
  game = new SpiderGame(level, options.random || Math.random);
  selected = null;
  hintIndex = 0;
  history = [];
  dialog.hidden = true;
  dailyButton.classList.toggle("active", dailyMode);
  levelButtons.forEach(button => { button.disabled = dailyMode; });
  levelButtons.forEach((button) => button.classList.toggle("active", button.dataset.level === level));
  setMessage(dailyMode ? "今日固定牌局 · 按完成速度进入排行榜" : "把同花色的 K 到 A 连成完整序列");
  startClock();
  render();
}

function startDaily() {
  const date = dailyDateKey();
  start("medium", { daily:true, random:seededRandom(hashSeed(`spider-${date}`)) });
}

levelButtons.forEach((button) => button.addEventListener("click", () => start(button.dataset.level)));
dailyButton.addEventListener("click", startDaily);
document.querySelector("#newGame").addEventListener("click", () => dailyMode ? startDaily() : start(game.level));
document.querySelector("#playAgain").addEventListener("click", () => dailyMode ? startDaily() : start(game.level));

renderDailyRecords();
startClock();
render();
