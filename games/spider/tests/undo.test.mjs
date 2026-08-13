import test from 'node:test';
import assert from 'node:assert/strict';
import { SpiderGame } from '../src/engine.js';

test('snapshot and restore return the exact playable state',()=>{
  const game=new SpiderGame('easy',()=>0.42);const before=game.snapshot();
  game.deal();assert.equal(game.moves,1);assert.equal(game.restore(before),true);
  assert.equal(game.moves,0);assert.equal(game.stock.length,5);assert.deepEqual(game.columns,before.columns);
});
