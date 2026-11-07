// Browser QA for an Interactive Blog feature served by `npx vite preview --port 4173`.
// Usage: node qa.cjs <slug> <width> <height> <tag> <outdir>
// Edit STEPS below to exercise every control in the new feature.
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
const fs = require('fs');
const [slug, W, H, tag, out] = [process.argv[2], +process.argv[3] || 1440, +process.argv[4] || 1000, process.argv[5] || 'desk', process.argv[6] || 'qa'];

// Each step: { click: {role, name} | {css, text}, fill: {css, value}, shot: selector, name }
const STEPS = [
  { wait: 6500 },
  { shot: '.sp-hero', name: 'hero' },
  { shot: '#the-forecasts', name: 'chapter-2' },
  // Examples from the AI jobs feature:
  // { click: { css: '.aj-atlas-row', text: 'Amazon' } },
  // { click: { role: 'button', name: 'Whole company' } },
  // { shot: '.aj-atlas', name: 'atlas-amazon' },
  // { fill: { css: '#aj-hours', value: '12' } },
  { shot: '#study-sources', name: 'sources' },
];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  await page.goto(`http://localhost:4173/blog/${slug}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.seat-study');
  const decline = page.getByRole('button', { name: 'Decline' });
  if (await decline.count()) await decline.first().click(); // cookie banner
  await page.evaluate(() => document.fonts.ready);
  // Static chapter nav so it does not cover element screenshots. Do not hide <header>: the hero is one.
  await page.addStyleTag({ content: '.sp-chapters{position:static!important}' });
  for (const s of STEPS) {
    if (s.wait) await page.waitForTimeout(s.wait);
    if (s.click?.role) await page.getByRole(s.click.role, { name: s.click.name }).first().click();
    if (s.click?.css) await page.locator(s.click.css, { hasText: s.click.text }).first().click();
    if (s.fill) await page.locator(s.fill.css).fill(s.fill.value);
    if (s.shot) {
      const el = page.locator(s.shot).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      await el.screenshot({ path: `${out}/${tag}-${s.name}.png` });
    }
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(tag, 'horizontal overflow px:', overflow, '| console errors:', errors.length ? errors : 'none');
  await browser.close();
  if (overflow > 0 || errors.length) process.exit(2);
})().catch((e) => { console.error('QA FAILED', e.message); process.exit(1); });
