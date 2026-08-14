const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:8766/');
  assert.equal(await page.locator('.game-live').count(),6);assert.equal(await page.locator('.reserved').count(),6);
  await page.goto('http://127.0.0.1:8766/games/2048/');
  await page.evaluate(()=>localStorage.setItem('tzt-2048-scores-v1',JSON.stringify([{id:'test',score:2048,maxTile:128,achievedAt:''}])));await page.reload();assert.equal(await page.locator('#scoreRecords li').count(),1);assert.match(await page.locator('#scoreRecords').textContent(),/2,048/);
  const first=await page.locator('.tile').allTextContents();await page.locator('#board').dispatchEvent('pointerdown',{clientX:300,clientY:300,pointerId:1,pointerType:'touch'});await page.locator('#board').dispatchEvent('pointerup',{clientX:80,clientY:300,pointerId:1,pointerType:'touch'});await page.waitForTimeout(320);assert.equal(await page.locator('#undo').isEnabled(),true);assert.notDeepEqual(await page.locator('.tile').allTextContents(),[]);await page.locator('#undo').click();assert.equal(await page.locator('#message').textContent(),'已撤销上一步');
  await page.goto('http://127.0.0.1:8766/games/minesweeper/');
  assert.equal(await page.locator('.cell').count(),81);assert.equal(await page.locator('#dailyRecords').count(),1);await page.locator('#dailyButton').click();assert.equal(await page.locator('[data-level="easy"]').isDisabled(),true);assert.ok(await page.locator('.cell.revealed').count()>0);await page.locator('#newGame').click();await page.locator('[data-mode="flag"]').click();await page.locator('.cell').first().click();assert.equal(await page.locator('.cell.flagged').count(),1);assert.equal(await page.locator('#remaining').textContent(),'39');
  await page.setViewportSize({width:1280,height:850});await page.goto('http://127.0.0.1:8766/games/2048/');for(const key of ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown']){await page.keyboard.press(key);await page.waitForTimeout(260);if(await page.locator('#undo').isEnabled())break}assert.equal(await page.locator('#undo').isEnabled(),true);await page.locator('[data-direction="right"]').click();
  await page.goto('http://127.0.0.1:8766/games/minesweeper/');await page.locator('.cell').nth(1).click({button:'right'});assert.equal(await page.locator('.cell.flagged').count(),1);await page.locator('.cell').first().click();assert.equal(await page.locator('.cell.mine').count(),0);
  await page.goto('http://127.0.0.1:8766/games/spider/');assert.equal(await page.locator('#undoButton').isDisabled(),true);await page.locator('#stockButton').click();assert.equal(await page.locator('#undoButton').isEnabled(),true);await page.locator('#undoButton').click();assert.equal(await page.locator('#moveCount').textContent(),'0');
  assert.deepEqual(errors,[]);console.log('browser smoke: mobile/desktop interactions passed');await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
