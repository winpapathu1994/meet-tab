import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTM1NzAyMTJkYTkzMGM2Y2NlMTViNTYiLCJpYXQiOjE3ODIyNzQzODAsImV4cCI6MTc4Mjg3OTE4MH0.ZQUKYoLuqovXkEhnqJWipDIa0HETJF7iWruhhFJK3cE';

// Helper to click a button by text
async function clickButton(page, text) {
  await page.evaluate((t) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes(t));
    if (btn) btn.click();
  }, text);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // ── Auth context (reused for authenticated pages) ──
  const authCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  await authCtx.addCookies([{
    name: 'token',
    value: TOKEN,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure: false,
  }]);

  // ── 01 — Login Page (no auth) ──
  const loginCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const loginPage = await loginCtx.newPage();
  await loginPage.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 15000 });
  await loginPage.waitForTimeout(1500);
  await loginPage.screenshot({ path: 'public/screenshots/01.png' });
  console.log('✓ 01.png — Login Page');
  await loginCtx.close();

  // ── 02 — Meeting Setup (authenticated, using share link with static roles) ──
  const meetPage = await authCtx.newPage();
  // Use static role IDs (junior, senior, manager) that work without API
  await meetPage.goto(
    `${BASE}/meet?r=junior:2,senior:1,manager:1&n=Alice,Bob,Charlie&name=Sprint+Planning`,
    { waitUntil: 'networkidle', timeout: 15000 }
  );
  await meetPage.waitForTimeout(2000);

  // Dismiss any toast notifications
  const toast = meetPage.locator('button:has-text("Issue")');
  if (await toast.isVisible({ timeout: 2000 }).catch(() => false)) {
    await clickButton(meetPage, 'Issue');
    await meetPage.waitForTimeout(500);
  }

  await meetPage.screenshot({ path: 'public/screenshots/02.png' });
  console.log('✓ 02.png — Meeting Setup');

  // ── 03 — Live Timer (start the meeting) ──
  const startBtn = meetPage.locator('button:has-text("Start Meeting")');
  if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await clickButton(meetPage, 'Start Meeting');
    await meetPage.waitForTimeout(5000); // let timer tick for a few seconds
  }
  await meetPage.screenshot({ path: 'public/screenshots/03.png' });
  console.log('✓ 03.png — Live Timer');
  await meetPage.close();

  // ── 04 — Role Management ──
  const rolesPage = await authCtx.newPage();
  await rolesPage.goto(`${BASE}/roles`, { waitUntil: 'networkidle', timeout: 15000 });
  await rolesPage.waitForTimeout(1500);
  await rolesPage.screenshot({ path: 'public/screenshots/04.png' });
  console.log('✓ 04.png — Role Management');
  await rolesPage.close();

  // ── 05 — Preset Sessions ──
  const presetsPage = await authCtx.newPage();
  await presetsPage.goto(`${BASE}/presets`, { waitUntil: 'networkidle', timeout: 15000 });
  await presetsPage.waitForTimeout(1500);
  await presetsPage.screenshot({ path: 'public/screenshots/05.png' });
  console.log('✓ 05.png — Preset Sessions');
  await presetsPage.close();

  // ── 06 — Session History ──
  const historyPage = await authCtx.newPage();
  await historyPage.goto(`${BASE}/history`, { waitUntil: 'networkidle', timeout: 15000 });
  await historyPage.waitForTimeout(1500);
  await historyPage.screenshot({ path: 'public/screenshots/06.png' });
  console.log('✓ 06.png — Session History');
  await historyPage.close();

  // ── 07 — Shared Link (no auth, view-only mode) ──
  const shareCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const sharePage = await shareCtx.newPage();
  await sharePage.goto(
    `${BASE}/meet?r=junior:2,senior:1,manager:1&n=Alice,Bob,Charlie&name=Sprint+Planning`,
    { waitUntil: 'networkidle', timeout: 15000 }
  );
  await sharePage.waitForTimeout(2000);
  await sharePage.screenshot({ path: 'public/screenshots/07.png' });
  console.log('✓ 07.png — Shared Link');
  await shareCtx.close();

  await authCtx.close();
  await browser.close();
  console.log('\n✅ Done — 7 screenshots saved to public/screenshots/');
}

main();
