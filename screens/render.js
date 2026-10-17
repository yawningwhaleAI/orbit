const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.goto('file://' + __dirname + '/screens.html', { waitUntil: 'networkidle' });
  try { await page.evaluate(() => document.fonts.ready); } catch(e){}
  await page.waitForTimeout(600);
  const ids = ['s1','s2','s3','s4','s5'];
  const names = {
    s1:'01-onboarding', s2:'02-weekly-intros', s3:'03-intro-detail',
    s4:'04-coffee-booked', s5:'05-operator-dashboard'
  };
  for (const id of ids) {
    const el = await page.$('#' + id);
    await el.screenshot({ path: names[id] + '.png' });
    console.log('saved ' + names[id] + '.png');
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
