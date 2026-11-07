// The skill preaches source integrity, so its own bundled data modules are held to it.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { SKILL, sread } from "./helpers/paths.mjs";
import { lintFile } from "../skills/interactive-blog/scripts/check-copy.mjs";

const MODULES = [
  ["assets/reference-data.js", "aiJobsPost"],
  ["assets/reference-seat-data.js", "seatPricingPost"],
  ["assets/reference-scrolly-data.js", "midtermPost"],
];

for (const [file, postName] of MODULES) {
  test(`${file}: source ledger is complete and every citation resolves`, async () => {
    const mod = await import(pathToFileURL(path.join(SKILL, file)).href);
    const { sources } = mod;
    assert.ok(Array.isArray(sources) && sources.length > 10);
    const ids = sources.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, "unique source ids");
    for (const s of sources) {
      assert.match(s.url, /^https:\/\//, `${s.id} url`);
      for (const k of ["publisher", "title", "date", "note"]) assert.ok(s[k] && String(s[k]).trim(), `${s.id}.${k}`);
    }
    const cited = [...sread(file).matchAll(/\bsources?\s*:\s*\[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/["']([\w-]+)["']/g)].map((x) => x[1]));
    const known = new Set(ids);
    assert.deepEqual([...new Set(cited.filter((id) => !known.has(id)))], [], "cited ids exist in the ledger");
  });

  test(`${file}: the post object has the fields and fallback the build checklist requires`, async () => {
    const mod = await import(pathToFileURL(path.join(SKILL, file)).href);
    const post = mod[postName];
    assert.ok(post, `exports ${postName}`);
    assert.ok(Number.isInteger(post.id));
    assert.match(post.slug, /^[a-z0-9-]+$/);
    assert.match(post.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(post.tags.includes("Interactive"));
    assert.match(post.content, /^## Sources/m);
    assert.match(post.content, /\(\/book\)/, "the fallback links to /book");
    for (const s of mod.sources) assert.ok(post.content.includes(s.url), `fallback lists ${s.id}`);
  });
}

test("the layout helpers used by the scrolling reference behave", async () => {
  const { largestRemainder, hemicycle, block, clusterLayout } = await import(pathToFileURL(path.join(SKILL, "assets/reference-scrolly-layout.js")).href);
  assert.deepEqual(largestRemainder([39, 32, 14, 8, 7], 100), [39, 32, 14, 8, 7]);
  assert.equal(largestRemainder([1, 1, 1], 100).reduce((a, b) => a + b, 0), 100);
  assert.deepEqual(largestRemainder([0, 0], 100), [0, 0]);
  for (const n of [435, 100, 50]) {
    const seats = hemicycle(n, n === 435 ? { cx: 487.5, cy: 575, inner: 130, outer: 400, rows: 10 } : { cx: 300, cy: 300, inner: 120, outer: 285, rows: 6 });
    assert.equal(seats.length, n);
  }
  const b = block(25, { cols: 5, gap: 10 });
  assert.equal(b.length, 25);
  assert.deepEqual(b[5], { x: 0, y: 10 });
  const c = clusterLayout([{ key: "a", count: 60, d: 20 }, { key: "b", count: 40, d: 30 }]);
  assert.equal(c.positions.length, 100);
  assert.equal(c.totalD, 50);
});

// The bundled features are what Claude copies from, so they must not model the mistakes the linter exists to catch.
// Each feature is linted as a unit: the limit of one "actually" applies to the component and its data module together.
const FEATURES = [
  ["AI jobs", ["assets/reference-feature.jsx", "assets/reference-data.js"]],
  ["agents and seat pricing", ["assets/reference-seat-feature.jsx", "assets/reference-seat-data.js"]],
  ["midterms scrolling map", ["assets/reference-scrolly-feature.jsx", "assets/reference-scrolly-data.js", "assets/reference-scrolly-layout.js"]],
];
for (const [label, files] of FEATURES) {
  test(`the bundled ${label} reference passes the copy linter with no errors`, async () => {
    const { lintFiles } = await import("../skills/interactive-blog/scripts/check-copy.mjs");
    const errors = lintFiles(files.map((f) => path.join(SKILL, f))).filter((f) => f.level === "error");
    assert.deepEqual(errors.map((e) => `${path.basename(e.file)}:${e.line} ${e.rule}`), []);
  });
}
