import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../flicker-fix.css", import.meta.url), "utf8");
const values = [2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536];

test("every 2048 level has a distinct background colour", () => {
  const colours = values.map(value => {
    const rule = new RegExp(`\\.tile\\[data-v="${value}"\\]\\s*\\{[^}]*background:\\s*(#[0-9a-f]{6})`, "i").exec(css);
    assert.ok(rule, `missing colour for ${value}`);
    return rule[1].toLowerCase();
  });
  assert.equal(new Set(colours).size, values.length);
});
