export const SUITS = {
  spades: { symbol: "♠", color: "black" },
  hearts: { symbol: "♥", color: "red" },
  diamonds: { symbol: "♦", color: "red" },
  clubs: { symbol: "♣", color: "black" },
};

export const LEVELS = {
  easy: { label: "简单", detail: "单花色", suits: ["spades"] },
  medium: { label: "中等", detail: "双花色", suits: ["spades", "hearts"] },
  hard: { label: "困难", detail: "四花色", suits: ["spades", "hearts", "diamonds", "clubs"] },
};

export const rankLabel = (rank) => ({ 1: "A", 11: "J", 12: "Q", 13: "K" }[rank] || String(rank));

export function createDeck(level = "easy") {
  const suits = LEVELS[level]?.suits || LEVELS.easy.suits;
  const copies = 8 / suits.length;
  const deck = [];
  let id = 0;
  for (const suit of suits) {
    for (let copy = 0; copy < copies; copy += 1) {
      for (let rank = 1; rank <= 13; rank += 1) {
        deck.push({ id: `${level}-${id++}`, suit, rank, faceUp: false });
      }
    }
  }
  return deck;
}

export function shuffle(cards, random = Math.random) {
  const result = cards.map((card) => ({ ...card }));
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function isSameSuitRun(cards) {
  if (!cards.length || cards.some((card) => !card.faceUp)) return false;
  return cards.every((card, index) => index === 0 || (
    cards[index - 1].suit === card.suit && cards[index - 1].rank === card.rank + 1
  ));
}

export function isCompleteRun(cards) {
  return cards.length === 13 && cards[0].rank === 13 && cards[12].rank === 1 && isSameSuitRun(cards);
}

export class SpiderGame {
  constructor(level = "easy", random = Math.random) {
    this.random = random;
    this.start(level);
  }

  start(level = this.level || "easy") {
    this.level = LEVELS[level] ? level : "easy";
    const deck = shuffle(createDeck(this.level), this.random);
    this.columns = Array.from({ length: 10 }, () => []);
    for (let index = 0; index < 54; index += 1) {
      const card = deck[index];
      const columnIndex = index % 10;
      card.faceUp = index >= 44;
      this.columns[columnIndex].push(card);
    }
    this.stock = [];
    for (let index = 54; index < 104; index += 10) this.stock.push(deck.slice(index, index + 10));
    this.completed = [];
    this.moves = 0;
    this.won = false;
  }

  canSelect(columnIndex, cardIndex) {
    const column = this.columns[columnIndex];
    if (!column || !column[cardIndex]?.faceUp) return false;
    return isSameSuitRun(column.slice(cardIndex));
  }

  canPlace(cards, targetIndex) {
    const target = this.columns[targetIndex];
    if (!cards.length || !target) return false;
    if (!target.length) return true;
    return target[target.length - 1].rank === cards[0].rank + 1;
  }

  move(fromColumn, cardIndex, toColumn) {
    if (fromColumn === toColumn || !this.canSelect(fromColumn, cardIndex)) return false;
    const moving = this.columns[fromColumn].slice(cardIndex);
    if (!this.canPlace(moving, toColumn)) return false;
    this.columns[fromColumn].splice(cardIndex);
    this.columns[toColumn].push(...moving);
    this.flipExposed(fromColumn);
    this.moves += 1;
    this.collectRuns(toColumn);
    return true;
  }

  flipExposed(columnIndex) {
    const column = this.columns[columnIndex];
    if (column.length && !column[column.length - 1].faceUp) column[column.length - 1].faceUp = true;
  }

  collectRuns(columnIndex) {
    const column = this.columns[columnIndex];
    if (column.length < 13) return false;
    const run = column.slice(-13);
    if (!isCompleteRun(run)) return false;
    column.splice(-13);
    this.completed.push(run[0].suit);
    this.flipExposed(columnIndex);
    this.won = this.completed.length === 8;
    return true;
  }

  canDeal() {
    return this.stock.length > 0 && this.columns.every((column) => column.length > 0);
  }

  deal() {
    if (!this.canDeal()) return false;
    const row = this.stock.shift();
    row.forEach((card, index) => {
      card.faceUp = true;
      this.columns[index].push(card);
    });
    this.moves += 1;
    this.columns.forEach((_, index) => this.collectRuns(index));
    return true;
  }

  snapshot() {
    return structuredClone({
      level: this.level,
      columns: this.columns,
      stock: this.stock,
      completed: this.completed,
      moves: this.moves,
      won: this.won,
    });
  }

  restore(snapshot) {
    if (!snapshot) return false;
    const state = structuredClone(snapshot);
    this.level = state.level;
    this.columns = state.columns;
    this.stock = state.stock;
    this.completed = state.completed;
    this.moves = state.moves;
    this.won = state.won;
    return true;
  }

  hints() {
    const hints = [];
    this.columns.forEach((column, from) => {
      column.forEach((card, cardIndex) => {
        if (!this.canSelect(from, cardIndex)) return;
        const revealsCard = cardIndex > 0 && !column[cardIndex - 1].faceUp;
        this.columns.forEach((target, to) => {
          if (from === to || !this.canPlace(column.slice(cardIndex), to)) return;
          const targetCard = target[target.length - 1];
          const sameSuit = Boolean(targetCard && targetCard.suit === card.suit);
          const score = (revealsCard ? 100 : 0) + (sameSuit ? 40 : 0) + (!target.length ? -10 : 0) + column.slice(cardIndex).length;
          hints.push({ type: "move", from, cardIndex, to, score, revealsCard, sameSuit });
        });
      });
    });
    return hints.sort((a, b) => b.score - a.score);
  }
}
