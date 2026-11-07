// Assert that a status style survives selection. In the midterms Senate map, Texas (selected by default) lost its amber
// "changed hands" outline because the selection style replaced it. Screenshots looked fine; this probe would have failed.
//
//   node scripts/probe-status-outlines.cjs <slug> [--width 1440] [--height 1000] [--port 4173]
//
// It reads the computed stroke of each flagged item's status outline before and after selecting every flagged item, and
// exits 1 if any is not the status color. Edit CONFIG for your figure: the selector of the figure, the selector of the
// control that selects an item, and how to find an item's status outline. Playwright must be installed in the folder you
// run it from.
const CONFIG = {
  figure: '.mw-shiftmap',
  // The control that selects an item (a list row). `text` is the item id shown on it.
  selectControl: (id) => ({ css: '.mw-race-row', text: id }),
  // Items that carry the status and the status outline element for each (null if it is missing).
  items: { IA: 'Iowa', KS: 'Kansas', ME: 'Maine', NC: 'North Carolina', OH: 'Ohio', SC: 'South Carolina', TX: 'Texas' },
  outline: (id) => `${'.mw-shiftmap'} path.mw-sm-flip[data-st="${id}"]`,
  statusStroke: 'rgb(242, 163, 60)', // the amber that means "changed hands"
};

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i > 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const slug = argv[0];
if (!slug || slug.startsWith('--')) {
  console.error('usage: node scripts/probe-status-outlines.cjs <slug> [--width 1440] [--height 1000] [--port 4173]');
  process.exit(2);
}

const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] })); // after usage, so it fails with usage, not a stack trace

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: +opt('width', 1440), height: +opt('height', 1000) } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`http://localhost:${opt('port', '4173')}/blog/${slug}`, { waitUntil: 'networkidle' });
  const decline = page.getByRole('button', { name: 'Decline' });
  if (await decline.count()) await decline.first().click();
  await page.addStyleTag({ content: '.sp-chapters{position:static!important}' });
  await page.locator(CONFIG.figure).scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);

  const strokeOf = (id) =>
    page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).stroke : null;
    }, CONFIG.outline(id));

  const bad = [];
  for (const id of Object.keys(CONFIG.items)) {
    const s = await strokeOf(id);
    if (s !== CONFIG.statusStroke) bad.push(`${id} initial: ${s}`);
  }
  for (const id of Object.keys(CONFIG.items)) {
    const c = CONFIG.selectControl(id);
    await page.locator(c.css, { hasText: c.text }).first().click();
    await page.waitForTimeout(250);
    for (const other of Object.keys(CONFIG.items)) {
      const s = await strokeOf(other);
      if (s !== CONFIG.statusStroke) bad.push(`${other} while ${id} is selected: ${s}`);
    }
  }
  console.log(bad.length ? `PROBLEMS:\n  ${bad.join('\n  ')}` : `all ${Object.keys(CONFIG.items).length} status outlines keep ${CONFIG.statusStroke}, selected or not`, '| page errors:', errors.length ? errors : 'none');
  await browser.close();
  process.exit(bad.length || errors.length ? 1 : 0);
})().catch((e) => {
  console.error('PROBE FAILED', e.message);
  process.exit(2);
});
