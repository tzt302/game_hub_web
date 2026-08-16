const { chromium } = require("playwright");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ headless:true, executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  const page = await browser.newPage({ viewport:{ width:390, height:844 }, isMobile:true, hasTouch:true });
  let createdNickname = "";
  await page.route("**/api/leaderboard**", route => route.fulfill({ json:{ metric:"score", entries:[] } }));
  await page.route("**/api/players", async route => {
    createdNickname = JSON.parse(route.request().postData()).nickname;
    await route.fulfill({ json:{ token:"test-token", player:{ id:"test-player", nickname:createdNickname } } });
  });
  await page.route("**/api/scores", route => route.fulfill({ json:{ accepted:true, personalBest:true, rank:1 } }));

  await page.goto("http://127.0.0.1:8766/games/2048/");
  await page.evaluate(() => localStorage.removeItem("tzt-global-player-v1"));
  await page.reload();
  assert.equal(await page.locator("main > header + .global-leaderboard-prominent").count(), 1);
  assert.ok(await page.locator(".global-leaderboard-prominent").boundingBox().then(box => box.y < 200));

  for (const key of ["ArrowLeft","ArrowDown","ArrowRight","ArrowUp","ArrowLeft","ArrowDown","ArrowRight","ArrowUp","ArrowLeft","ArrowDown","ArrowRight","ArrowUp"]) {
    await page.keyboard.press(key);
    await page.waitForTimeout(240);
    if (Number(await page.locator("#score").textContent()) > 0) break;
  }
  assert.ok(Number(await page.locator("#score").textContent()) > 0, "test run should produce a merge");
  await page.waitForTimeout(2100);
  assert.match(createdNickname, /^匿名用户\d{5}$/);
  assert.equal(await page.locator(".global-player-dialog").count(), 0);
  assert.equal(await page.locator(".global-player-name").textContent(), createdNickname);
  await browser.close();
  console.log("leaderboard is prominent and first score creates an anonymous profile");
})().catch(error => { console.error(error); process.exit(1); });
