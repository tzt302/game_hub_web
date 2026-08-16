const { chromium } = require("playwright");
const assert = require("node:assert/strict");

(async () => {
  const browser = await chromium.launch({ headless:true, executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  const page = await browser.newPage({ viewport:{ width:390, height:844 }, isMobile:true, hasTouch:true });
  let submitted;
  await page.route("**/api/feedback", async route => {
    submitted = JSON.parse(route.request().postData());
    await route.fulfill({ status:201, contentType:"application/json", body:JSON.stringify({ accepted:true, id:"feedback-test" }) });
  });

  const labels = {
    en:"Feedback", ja:"ご意見箱", fr:"Avis", es:"Opiniones", ru:"Отзыв", it:"Feedback",
    ar:"ملاحظات", ko:"의견함", "zh-CN":"意见箱", "zh-TW":"意見箱", pt:"Opinião",
  };
  await page.goto("http://127.0.0.1:8766/");
  await page.waitForSelector(".tzt-feedback-trigger");
  for (const [locale, label] of Object.entries(labels)) {
    await page.evaluate(value => window.TZT_I18N.applyLanguage(value), locale);
    assert.equal(await page.locator(".tzt-feedback-trigger b").textContent(), label);
  }

  await page.locator(".tzt-feedback-trigger").click();
  assert.equal(await page.locator(".tzt-feedback-overlay").isVisible(), true);
  await page.locator('[name="category"]').selectOption("bug");
  await page.locator('[name="message"]').fill("The mobile layout needs a little more spacing.");
  await page.locator('[name="contact"]').fill("player@example.com");
  await page.locator(".tzt-feedback-actions [type=submit]").click();
  await page.waitForFunction(() => document.querySelector(".tzt-feedback-status")?.dataset.tone === "success");
  assert.equal(submitted.category, "bug");
  assert.equal(submitted.locale, "pt");
  assert.equal(submitted.page, "/");
  assert.equal(submitted.contact, "player@example.com");

  await page.goto("http://127.0.0.1:8766/games/2048/?lang=ja");
  await page.waitForSelector(".tzt-feedback-trigger");
  assert.equal(await page.locator(".tzt-feedback-trigger b").textContent(), "ご意見箱");
  assert.equal(await page.locator('link[data-tzt-feedback-style]').count(), 1);
  await browser.close();
  console.log("feedback box supports all 11 languages and game pages");
})().catch(error => { console.error(error); process.exit(1); });
