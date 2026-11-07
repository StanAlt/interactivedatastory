// scripts/check-feature.mjs against a generated mini site: the clean site passes, and each injected fault fails
// exactly the checks it should.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { SKILL } from "./helpers/paths.mjs";
import { buildMiniSite, SLUG } from "./helpers/mini-site.mjs";
import { checkFeature } from "../skills/interactive-blog/scripts/check-feature.mjs";

const CLI = path.join(SKILL, "scripts/check-feature.mjs");
const failing = (results) => results.filter((r) => !r.ok).map((r) => `${r.level}:${r.id}`).sort();

test("a clean site passes every check, including the built output", async () => {
  const site = buildMiniSite();
  try {
    const results = await checkFeature({ repo: site.dir, slug: SLUG, dist: true });
    assert.ok(results.length >= 38, `ran ${results.length} checks`);
    assert.deepEqual(failing(results), []);
  } finally {
    site.cleanup();
  }
});

// fault -> the checks it must fail (and nothing else)
const FAULTS = {
  missingSlug: ["error:post-found"],
  routeAfterSlug: ["error:route-before-slug"],
  noRoute: ["error:component", "error:route-before-slug", "error:route-lazy", "error:route-once"],
  notLazy: ["error:component", "error:route-lazy"],
  duplicateId: ["error:unique-ids"],
  noLlms: ["error:llms-entry"],
  noFeatured: ["warn:featured-slug"],
  noBooking: ["error:booking-embed", "error:booking-fallback"],
  noFallbackBook: ["error:fallback-booking"],
  emDashComponent: ["error:component-copy"],
  emDashShortJsx: ["error:component-copy"],
  emDashNarrative: ["error:fallback-copy", "error:research-copy"],
  bannedWord: ["error:fallback-copy", "error:research-copy"],
  unknownSource: ["error:sources-cited-exist"],
  duplicateSourceId: ["error:sources-complete"],
  unlistedSource: ["error:fallback-lists-sources"],
  noSourcesHeading: ["error:fallback-lists-sources", "error:fallback-sources-heading"],
  wrongImage: ["error:og-image-size"],
  badSvg: ["error:og-svg-valid"],
  bareAmp: ["error:og-svg-valid"],
  missingTest: ["error:data-tests"],
  noDesignDoc: ["warn:design-doc", "warn:validation-doc"],
  noValidationDoc: ["warn:validation-doc"],
  noDistOgImage: ["error:dist-og-image"],
};

for (const [fault, expected] of Object.entries(FAULTS)) {
  test(`fault "${fault}" fails exactly: ${expected.join(", ")}`, async () => {
    const site = buildMiniSite({ faults: [fault] });
    try {
      const results = await checkFeature({ repo: site.dir, slug: SLUG, dist: true });
      assert.deepEqual(failing(results), [...expected].sort());
    } finally {
      site.cleanup();
    }
  });
}

test("the CLI exits 0 when clean, 1 on an error, 0 on a warning unless --strict, and 2 on bad usage", () => {
  const run = (args) => spawnSync("node", [CLI, ...args], { encoding: "utf8" });
  const clean = buildMiniSite();
  const warn = buildMiniSite({ faults: ["noFeatured"] });
  const bad = buildMiniSite({ faults: ["noLlms"] });
  try {
    assert.equal(run(["--repo", clean.dir, "--slug", SLUG, "--dist"]).status, 0);
    assert.equal(run(["--repo", warn.dir, "--slug", SLUG]).status, 0);
    assert.equal(run(["--repo", warn.dir, "--slug", SLUG, "--strict"]).status, 1);
    const r = run(["--repo", bad.dir, "--slug", SLUG]);
    assert.equal(r.status, 1);
    assert.match(r.stdout, /FAIL\s+llms-entry/);
    assert.equal(run([]).status, 2);
    assert.equal(run(["--repo", "/definitely/not/here", "--slug", SLUG]).status, 2);
    const json = JSON.parse(run(["--repo", clean.dir, "--slug", SLUG, "--json"]).stdout);
    assert.ok(Array.isArray(json) && json.every((c) => "id" in c && "ok" in c && "level" in c));
  } finally {
    clean.cleanup();
    warn.cleanup();
    bad.cleanup();
  }
});
