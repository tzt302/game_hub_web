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

function rotate(grid) { return grid[0].map((_, column) => grid.map(row => row[column]).reverse()); }
function rotateTimes(grid, times) { let result = grid.map(row => [...row]); for (let i = 0; i < times; i += 1) result = rotate(result); return result; }

export function moveGrid(grid, direction) {
  const turns = { left: 0, down: 1, right: 2, up: 3 }[direction];
  if (turns === undefined) return { grid, moved: false, gained: 0 };
  const oriented = rotateTimes(grid, turns);
  let gained = 0;
  const movedGrid = oriented.map(row => { const moved = slideLine(row); gained += moved.gained; return moved.line; });
  const result = rotateTimes(movedGrid, (4 - turns) % 4);
  return { grid: result, gained, moved: JSON.stringify(result) !== JSON.stringify(grid) };
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
