import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoard, isWon, placeMines, reveal, toggleFlag } from '../engine.js';

test('first cell and its neighbours are safe',()=>{
  const board=createBoard(9,9);placeMines(board,10,4,4,()=>0);
  for(let r=3;r<=5;r+=1)for(let c=3;c<=5;c+=1)assert.equal(board[r][c].mine,false);
  assert.equal(board.flat().filter(cell=>cell.mine).length,10);
});
test('flags block reveal and can be removed',()=>{
  const board=createBoard(3,3);toggleFlag(board,1,1);
  assert.equal(reveal(board,1,1).changed,false);toggleFlag(board,1,1);assert.equal(board[1][1].flagged,false);
});
test('empty region expands and win detection ignores mines',()=>{
  const board=createBoard(3,3);board[2][2].mine=true;board[1][1].adjacent=1;board[1][2].adjacent=1;board[2][1].adjacent=1;
  reveal(board,0,0);assert.equal(board[0][2].revealed,true);board.flat().filter(cell=>!cell.mine).forEach(cell=>cell.revealed=true);assert.equal(isWon(board),true);
});
