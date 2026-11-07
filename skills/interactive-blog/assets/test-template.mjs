// TEMPLATE: copy to research/<topic>.test.mjs and point the imports at the new data module.
// Keep the categories of checks; replace the expected values with the new feature's reconciled numbers.
import test from "node:test";
import assert from "node:assert/strict";
import {
  sources,
  forecasts,
  companies,
  linkTypes,
  challengerYears,
  cumulative,
  ladderReleases,
  industries,
  contentFormats,
  piecesPerMonth,
  shareOf,
  companyShare,
  displayShare,
  aiJobsPost,
} from "../src/data/aiJobsResearch.js";
import { blogPosts } from "../src/data/blogPosts.js";

const sourceIds = new Set(sources.map((s) => s.id));

test("every claim points at a source in the ledger", () => {
  const cited = [
    ...companies.flatMap((c) => c.sources),
    ...forecasts.cost.map((f) => f.source),
    ...forecasts.create.map((f) => f.source),
    ...challengerYears.map((d) => d.source),
    ...industries.flatMap((i) => i.sources),
  ];
  for (const id of cited) assert.ok(sourceIds.has(id), `missing source ${id}`);
  assert.equal(sourceIds.size, sources.length, "duplicate source ids");
  for (const s of sources) assert.match(s.url, /^https:\/\//);
});

test("cumulative AI-cited cuts reconcile with Challenger's published total", () => {
  // Challenger reported 71,825 cumulative AI-cited cuts from 2023 through 2025.
  const total = cumulative();
  assert.equal(total[2].value, 71825);
  assert.equal(total[3].value, 71825 + 120136);
  // 2026 through September exceeds 2023 to 2025 combined, as the text claims.
  assert.ok(challengerYears[3].value > total[2].value);
  // 2026 YTD = 112,713 through July + 3,462 (Aug) + 3,961 (Sep).
  assert.equal(112713 + 3462 + 3961, challengerYears[3].value);
});

test("company shares match the stated denominators", () => {
  const by = Object.fromEntries(companies.map((c) => [c.id, c]));
  assert.equal(displayShare(companyShare(by.microsoft)), 27); // 60,000 / 223,000
  assert.equal(companyShare(by.amazon), 8.6); // 30,000 / 350,000 corporate
  assert.equal(companyShare(by.amazon, by.amazon.altBase), 1.9); // of 1.56M total
  assert.equal(displayShare(companyShare(by.salesforce)), 44); // 4,000 / 9,000
  assert.equal(companyShare(by.accenture), 1.4); // 11,000 / 791,000
  assert.equal(companyShare(by.dropbox), 9); // reported in the filing
  assert.equal(companyShare(by.meta), 10); // reported
  assert.equal(companyShare(by.ibm), null);
  assert.equal(shareOf(0, 100), null);
  for (const c of companies) {
    assert.ok(linkTypes[c.link], `unknown link type for ${c.id}`);
    const s = companyShare(c);
    if (s != null) assert.ok(s > 0 && s <= 100, `${c.id} share out of range`);
  }
});

test("the ladder gap widens across releases and stays plausible", () => {
  const gaps = ladderReleases.map((r) => r.gap);
  assert.deepEqual(gaps, [0, 13, 16, 19]);
  for (let i = 1; i < gaps.length; i++) assert.ok(gaps[i] >= gaps[i - 1]);
});

test("publishing model rounds down and handles boundaries", () => {
  assert.equal(piecesPerMonth(6, 10), 2);
  assert.equal(piecesPerMonth(6, 3), 8);
  assert.equal(piecesPerMonth(0, 3), 0);
  assert.equal(piecesPerMonth(5, 0), 0);
  for (const f of contentFormats) {
    assert.ok(f.after < f.before, `${f.id}: AI hours should be lower`);
    for (let h = 2; h <= 20; h++) {
      const before = piecesPerMonth(h, f.before);
      const after = piecesPerMonth(h, f.after);
      assert.ok(after >= before);
      assert.ok(Number.isInteger(after) && after >= 0);
      if (h > 2) assert.ok(after >= piecesPerMonth(h - 1, f.after), "monotonic");
    }
  }
});

test("post is registered once with a dedicated route and readable fallback", () => {
  const matches = blogPosts.filter((p) => p.slug === aiJobsPost.slug);
  assert.equal(matches.length, 1);
  const ids = blogPosts.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate post ids");
  assert.match(aiJobsPost.content, /## Sources/);
  assert.match(aiJobsPost.content, /\(\/book\)/);
  assert.ok(!aiJobsPost.content.includes("—"), "no em dashes in fallback prose");
  assert.ok(!/quietly|honest/i.test(aiJobsPost.content));
});
