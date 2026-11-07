// Browser QA for a scrolling story served by `npx vite preview --port 4173`.
//
//   node scripts/qa-scrolly.cjs <slug> [--width 1440] [--height 1000] [--tag desk] [--out qa] [--port 4173]
//        [--stages ".mw-scrolly"] [--steps ".mw-step"] [--figures ".mw-chambers,.mw-trails,.mw-shiftmap"]
//
// 1. Scrolls every step of every stage to the middle of the viewport, waits for the transition, and screenshots it.
// 2. Scrolls each figure into view and screenshots it.
// 3. Prints horizontal overflow and console errors, and exits 2 if either is non-zero.
// Run it at 1440 x 1000, 390 x 844 and 320 x 780, then read every screenshot. Playwright must be installed in the
// folder you run it from; use the preinstalled browser (executablePath), never `playwright install`.
// To exercise buttons and sliders, add click steps in the INTERACTIONS block (see qa.cjs for the pattern).
const fs = require('fs');

const argv = process.argv.slice(2);
const slug = argv[0];
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i > 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
if (!slug || slug.startsWith('--')) {
  console.error('usage: node scripts/qa-scrolly.cjs <slug> [--width 1440] [--height 1000] [--tag desk] [--out qa] [--port 4173] [--stages sel] [--steps sel] [--figures sel,sel]');
  process.exit(2);
}
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] })); // after usage, so --help works without it
const W = +opt('width', 1440);
const H = +opt('height', 1000);
const tag = opt('tag', 'desk');
const out = opt('out', 'qa');
const port = opt('port', '4173');
const stages = opt('stages', '.mw-scrolly').split(',');
const stepSel = opt('steps', '.mw-step');
const figures = opt('figures', '').split(',').filter(Boolean);

// INTERACTIONS: [{ before: '<figure selector>', click: { css: '.segments button', text: 'Senate' } }, ...]
const INTERACTIONS = [];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  await page.goto(`http://localhost:${port}/blog/${slug}`, { waitUntil: 'networkidle' });
  const decline = page.getByRole('button', { name: 'Decline' });
  if (await decline.count()) await decline.first().click(); // cookie banner
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2600); // the title step animates in

  let shots = 0;
  for (const [si, stage] of stages.entries()) {
    const n = await page.locator(`${stage} ${stepSel}`).count();
    for (let i = 0; i < n; i++) {
      await page.evaluate(([stage, stepSel, i]) => {
        const el = document.querySelectorAll(`${stage} ${stepSel}`)[i];
        const r = el.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + r.top + r.height / 2 - window.innerHeight / 2);
      }, [stage, stepSel, i]);
      await page.waitForTimeout(2300);
      await page.screenshot({ path: `${out}/${tag}-stage${si}-step${i}.png` });
      shots++;
    }
  }
  await page.addStyleTag({ content: '.sp-chapters{position:static!important}' }); // keep the sticky nav out of element shots
  for (const sel of figures) {
    for (const it of INTERACTIONS.filter((x) => x.before === sel)) {
      await page.locator(it.click.css, { hasText: it.click.text }).first().click();
      await page.waitForTimeout(600);
    }
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await el.screenshot({ path: `${out}/${tag}-${sel.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}.png` });
    shots++;
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(tag, `${shots} screenshots | horizontal overflow px: ${overflow} | console errors:`, errors.length ? errors : 'none');
  await browser.close();
  if (overflow > 0 || errors.length) process.exit(2);
})().catch((e) => {
  console.error('QA FAILED', e.message);
  process.exit(1);
});
