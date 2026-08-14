import test from "node:test";
import assert from "node:assert/strict";
import { isBetter, normalizeNickname, validateScorePayload } from "../worker/rules.js";

test("normalizes nicknames and strips markup", () => {
  assert.equal(normalizeNickname("  小 <玩> 家  "), "小 玩 家");
});

test("accepts supported score and duration records", () => {
  assert.equal(validateScorePayload({ gameId:"2048", mode:"classic", runId:"run-123456", score:8192 }).value, 8192);
  assert.equal(validateScorePayload({ gameId:"racing", mode:"time:monza", runId:"lap-123456", durationMs:81234 }).value, 81234);
});

test("rejects impossible records", () => {
  assert.throws(() => validateScorePayload({ gameId:"minesweeper", mode:"hard", runId:"run-123456", durationMs:200 }));
});

test("compares score and time metrics in the correct direction", () => {
  assert.equal(isBetter("score", 200, 100), true);
  assert.equal(isBetter("duration", 20_000, 30_000), true);
});
