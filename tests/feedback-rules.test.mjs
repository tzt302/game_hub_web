import assert from "node:assert/strict";
import test from "node:test";
import { validateFeedbackPayload } from "../worker/rules.js";

test("normalizes a valid multilingual feedback message", () => {
  assert.deepEqual(validateFeedbackPayload({
    category:"bug", message:"  麻将在手机上显示不完整。  ", contact:"test@example.com", locale:"zh-CN", page:"/games/mahjong/",
  }), {
    category:"bug", message:"麻将在手机上显示不完整。", contact:"test@example.com", locale:"zh-CN", page:"/games/mahjong/", website:"",
  });
});

test("rejects short feedback and sanitizes untrusted fields", () => {
  assert.throws(() => validateFeedbackPayload({ message:"bad" }), /至少需要5个字符/);
  const value = validateFeedbackPayload({ message:"A useful suggestion", category:"invalid", contact:"<script>", locale:"xx", page:"https://evil.test/" });
  assert.equal(value.category, "other");
  assert.equal(value.contact, "script");
  assert.equal(value.locale, "en");
  assert.equal(value.page, "/");
});
