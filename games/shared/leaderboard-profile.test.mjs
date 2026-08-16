import assert from "node:assert/strict";
import test from "node:test";

globalThis.document = {
  querySelector: () => ({}),
};

const { generateAnonymousNickname } = await import("./leaderboard.js");

test("anonymous leaderboard names always contain exactly five digits", () => {
  assert.equal(generateAnonymousNickname(() => 0), "匿名用户10000");
  assert.equal(generateAnonymousNickname(() => .5), "匿名用户55000");
  assert.equal(generateAnonymousNickname(() => 1), "匿名用户99999");
  assert.match(generateAnonymousNickname(), /^匿名用户\d{5}$/);
});
