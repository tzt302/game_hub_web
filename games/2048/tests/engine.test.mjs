import test from 'node:test';
import assert from 'node:assert/strict';
import { addRandomTile, canMove, emptyGrid, moveGrid, slideLine } from '../engine.js';

test('merges each pair only once per move',()=>{
  assert.deepEqual(slideLine([2,2,2,2]),{line:[4,4,0,0],gained:8});
  assert.deepEqual(slideLine([4,4,8,0]),{line:[8,8,0,0],gained:8});
});
test('moves in all four directions',()=>{
  const grid=[[2,0,0,2],[0,0,0,0],[0,0,0,0],[2,0,0,0]];
  assert.deepEqual(moveGrid(grid,'left').grid[0],[4,0,0,0]);
  assert.deepEqual(moveGrid(grid,'right').grid[0],[0,0,0,4]);
  assert.equal(moveGrid(grid,'up').grid[0][0],4);
  assert.equal(moveGrid(grid,'down').grid[3][0],4);
});
test('adds one tile and detects a locked board',()=>{
  assert.equal(addRandomTile(emptyGrid(),()=>0).flat().filter(Boolean).length,1);
  assert.equal(canMove([[2,4,2,4],[4,2,4,2],[2,4,2,4],[4,2,4,2]]),false);
});
