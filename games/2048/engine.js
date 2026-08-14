export function emptyGrid() { return Array.from({ length: 4 }, () => Array(4).fill(0)); }

export function slideLine(line) {
  const values = line.filter(Boolean);
  const result = [];
  let gained = 0;
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) {
      const value = values[index] * 2;
      result.push(value);
      gained += value;
      index += 1;
    } else result.push(values[index]);
  }
  while (result.length < 4) result.push(0);
  return { line: result, gained };
}

export function moveGrid(grid, direction) {
  const result = moveGridWithMotion(grid, direction);
  return { grid: result.grid, gained: result.gained, moved: result.moved };
}

export function moveGridWithMotion(grid, direction) {
  if (!["left","right","up","down"].includes(direction)) return { grid, moved: false, gained: 0, motions: [], merges: [] };
  const lines = Array.from({ length: 4 }, (_, line) => Array.from({ length: 4 }, (_, offset) => {
    if (direction === "left") return [line, offset];
    if (direction === "right") return [line, 3 - offset];
    if (direction === "up") return [offset, line];
    return [3 - offset, line];
  }));
  const result = emptyGrid();
  const motions = [];
  const merges = [];
  let gained = 0;
  lines.forEach((coordinates) => {
    const occupied = coordinates.filter(([row, col]) => grid[row][col]).map(([row, col]) => ({ row, col, value: grid[row][col] }));
    let destination = 0;
    for (let index = 0; index < occupied.length; index += 1) {
      const first = occupied[index];
      const second = occupied[index + 1];
      const [toRow, toCol] = coordinates[destination];
      if (second && first.value === second.value) {
        result[toRow][toCol] = first.value * 2;
        motions.push({ from:[first.row,first.col], to:[toRow,toCol], value:first.value, merge:true }, { from:[second.row,second.col], to:[toRow,toCol], value:second.value, merge:true });
        merges.push([toRow,toCol]); gained += first.value * 2; index += 1;
      } else {
        result[toRow][toCol] = first.value;
        motions.push({ from:[first.row,first.col], to:[toRow,toCol], value:first.value, merge:false });
      }
      destination += 1;
    }
  });
  return { grid: result, gained, motions, merges, moved: JSON.stringify(result) !== JSON.stringify(grid) };
}

export function addRandomTile(grid, random = Math.random) {
  const result = grid.map(row => [...row]);
  const empty = [];
  result.forEach((row, r) => row.forEach((value, c) => { if (!value) empty.push([r, c]); }));
  if (!empty.length) return result;
  const [r, c] = empty[Math.floor(random() * empty.length)];
  result[r][c] = random() < .9 ? 2 : 4;
  return result;
}

export function canMove(grid) {
  if (grid.some(row => row.some(value => !value))) return true;
  return ["left", "right", "up", "down"].some(direction => moveGrid(grid, direction).moved);
}
