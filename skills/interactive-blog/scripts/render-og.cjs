// Render a 1200x630 social SVG to PNG in real Archivo.
// Usage (from the repo root, after npm ci):
//   node .claude/skills/interactive-blog/scripts/render-og.cjs public/img/x.svg public/img/x.png
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd()] }));
const fs = require('fs');
const [svgPath, pngPath] = process.argv.slice(2);
if (!svgPath || !pngPath) { console.error('usage: render-og.cjs <in.svg> <out.png>'); process.exit(1); }
(async () => {
  const svg = fs.readFileSync(svgPath, 'utf8');
  // Use the preinstalled browser; never run `playwright install` in the sandbox.
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(`<html><head><link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;750&display=block" rel="stylesheet"><style>body{margin:0}</style></head><body>${svg}</body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const ok = await page.evaluate(() => document.fonts.check('700 72px Archivo'));
  console.log('Archivo loaded:', ok, ok ? '' : '(fell back to Arial: check network to fonts.googleapis.com)');
  await page.locator('svg').first().screenshot({ path: pngPath });
  await browser.close();
  console.log('wrote', pngPath);
})().catch((e) => { console.error(e.message); process.exit(1); });
