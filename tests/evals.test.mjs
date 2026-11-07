// The eval files themselves: case folders follow the layout `claude plugin eval` reads, the trigger set is balanced,
// and the golden runner catches regressions and improvements.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, SKILL, read, list, exists, frontmatter } from "./helpers/paths.mjs";
import { buildMiniSite, SLUG } from "./helpers/mini-site.mjs";
import { runGolden } from "../evals/run-golden.mjs";

const RESERVED = new Set(["results", "mocks", "node_modules", "files", "true", "false", "null"]);
const cases = list("evals").filter((n) => fs.statSync(path.join(ROOT, "evals", n)).isDirectory());

test("the eval suite has the cases the skill's behavior needs", () => {
  assert.ok(cases.length >= 6, `${cases.length} cases`);
  for (const needed of ["brief-and-plan-from-a-vague-request", "copy-pass-removes-banned-patterns", "blocked-fetch-and-stale-number", "ship-without-merging-to-main", "social-image-follows-svg-rules", "scrolling-map-plan-colors-only-sourced-facts"]) {
    assert.ok(cases.includes(needed), `case ${needed}`);
  }
});

for (const name of cases) {
  test(`case ${name} follows the claude plugin eval layout`, () => {
    assert.match(name, /^[a-z][a-z0-9-]*$/, "lowercase letters, digits and hyphens, starting with a letter");
    assert.ok(!RESERVED.has(name), "not a reserved name");
    const dir = `evals/${name}`;

    // prompt.md: a settings block with only the known keys, then the prompt as the user would type it.
    const prompt = frontmatter(read(`${dir}/prompt.md`));
    assert.ok(prompt, "prompt.md has a settings block");
    const keys = Object.keys(prompt.data);
    for (const k of keys) assert.ok(["tags", "max_turns", "timeout_seconds", "allowed_tools"].includes(k), `unknown setting ${k}`);
    assert.ok(Number(prompt.data.max_turns) > 0 && Number(prompt.data.timeout_seconds) > 0);
    assert.match(prompt.data.tags, /interactive-blog/);
    assert.ok(prompt.body.trim().length > 60, "the prompt is realistic, not a stub");
    assert.ok(!/^---$/m.test(prompt.body), "no stray --- that would end the settings block early");
    assert.match(prompt.body, /interactive blog/i, "the prompt names the skill so it is exercised");

    // case.yaml: quoted version, the name matching the folder, an expected outcome.
    const yaml = read(`${dir}/case.yaml`);
    assert.match(yaml, /^schema_version: "1\.1"$/m);
    assert.match(yaml, new RegExp(`^name: ${name}$`, "m"));
    assert.match(yaml, /^expected_outcome: \|\n {2}\S/m);

    // graders: numbered, typed, one statement each.
    const graders = list(`${dir}/graders`);
    assert.ok(graders.length >= 6, `${graders.length} graders`);
    graders.forEach((g, i) => {
      assert.match(g, new RegExp(`^${String(i + 1).padStart(2, "0")}-[a-z0-9-]+\\.md$`), `grader ${g} is numbered in order`);
      const fm = frontmatter(read(`${dir}/graders/${g}`));
      assert.deepEqual(fm.data, { type: "llm", focus: "trace", weight: "1" }, `${g} settings`);
      const statement = fm.body.trim();
      assert.ok(statement.length > 30 && !statement.includes("\n"), `${g} is one statement`);
      assert.ok(!/placeholder|TODO/i.test(statement), `${g} is a real assertion`);
    });

    // input files: listed in the prompt, shipped in files/, copied by the scaffold script named in case.yaml.
    const hasFiles = exists(`${dir}/files`);
    assert.equal(/^Input files: /m.test(prompt.body), hasFiles, "an Input files line exactly when there is a files/ folder");
    assert.equal(/scaffold_script: place-files\.sh/.test(yaml), hasFiles);
    if (hasFiles) {
      const listed = prompt.body.match(/^Input files: (.+)$/m)[1].split(/,\s*/);
      assert.deepEqual(listed.sort(), list(`${dir}/files`).sort());
      assert.ok(fs.statSync(path.join(ROOT, dir, "place-files.sh")).mode & 0o100, "place-files.sh is executable");
      assert.match(read(`${dir}/place-files.sh`), /cp -R "\$\(dirname "\$0"\)\/files\/\." \./);
    }
  });
}

test("the copy-pass input actually contains every pattern the graders look for", () => {
  const draft = read("evals/copy-pass-removes-banned-patterns/files/section-draft.md");
  assert.ok(draft.includes("—"), "em dash");
  for (const w of ["quietly", "Honestly", "the truth is", "Make no mistake", "the reality is"]) assert.ok(draft.includes(w), w);
  assert.match(draft, /It's not a cost story\. It's a strategic pivot\./);
  assert.ok((draft.match(/\bactually\b/gi) || []).length >= 2, "two uses of actually");
  for (const n of ["30,000", "350,000", "9%", "60,000", "27%", "$4.2 billion", "October 2026", "October 26"]) assert.ok(draft.includes(n), n);
  // and the linter agrees the draft is dirty, so the case can fail
  const r = spawnSync("node", [path.join(SKILL, "scripts/check-copy.mjs"), path.join(ROOT, "evals/copy-pass-removes-banned-patterns/files/section-draft.md")], { encoding: "utf8" });
  assert.equal(r.status, 1);
  for (const rule of ["em-dash", "banned", "reframe", "staccato", "actually"]) assert.match(r.stdout, new RegExp(rule));
});

test("the post-ids fixture makes 87 the answer, and the highest id is not first or last", () => {
  const ids = read("evals/brief-and-plan-from-a-vague-request/files/post-ids.txt").match(/\d+/g).map(Number);
  assert.equal(Math.max(...ids) + 1, 87);
  assert.notEqual(ids[0], Math.max(...ids));
  assert.notEqual(ids.at(-1), Math.max(...ids));
});

test("trigger queries are balanced, realistic and unique", () => {
  const q = JSON.parse(read("evals/trigger-queries.json"));
  assert.ok(Array.isArray(q) && q.length >= 20);
  const yes = q.filter((x) => x.should_trigger);
  const no = q.filter((x) => !x.should_trigger);
  assert.ok(yes.length >= 8 && no.length >= 8, `${yes.length} should trigger, ${no.length} should not`);
  assert.equal(new Set(q.map((x) => x.query)).size, q.length, "no duplicate queries");
  for (const x of q) {
    assert.equal(typeof x.should_trigger, "boolean");
    assert.ok(x.query.length >= 60, `realistic detail: ${x.query.slice(0, 40)}`);
  }
  // Near misses: the negatives name things the skill is close to (blog, chart, midterms, interactive page) so they are not trivial.
  const near = no.filter((x) => /blog|chart|midterms|interactive|scrollytelling|post/i.test(x.query));
  assert.ok(near.length >= 6, "most should-not queries are near misses, not unrelated requests");
});

test("golden features file is consistent", () => {
  const g = JSON.parse(read("evals/golden-features.json"));
  const slugs = g.features.map((f) => f.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(slugs.length >= 5);
  for (const f of g.features) {
    assert.match(f.slug, /^[a-z0-9-]+$/);
    assert.ok(Array.isArray(f.expectFail));
  }
});

test("the golden runner passes when results match, flags a regression, and flags an unrecorded improvement", async () => {
  const dir = fs.mkdtempSync(path.join(fs.realpathSync(process.env.TMPDIR || "/tmp"), "golden-"));
  const clean = buildMiniSite();
  const regressed = buildMiniSite({ faults: ["noLlms"] });
  try {
    const file = (expectFail) => {
      const f = path.join(dir, `f-${expectFail.join("-") || "none"}.json`);
      fs.writeFileSync(f, JSON.stringify({ features: [{ slug: SLUG, label: "mini", expectFail }] }));
      return f;
    };
    const match = await runGolden({ repo: clean.dir, featuresFile: file([]), dist: true });
    assert.ok(match[0].ok);
    const known = await runGolden({ repo: regressed.dir, featuresFile: file(["llms-entry"]), dist: true });
    assert.ok(known[0].ok, "a recorded failure is not a regression");
    const regression = await runGolden({ repo: regressed.dir, featuresFile: file([]), dist: true });
    assert.deepEqual(regression[0].regressions, ["llms-entry"]);
    assert.ok(!regression[0].ok);
    const improved = await runGolden({ repo: clean.dir, featuresFile: file(["llms-entry"]), dist: true });
    assert.deepEqual(improved[0].improved, ["llms-entry"]);
    assert.ok(!improved[0].ok);
    // and the CLI turns that into exit codes
    const run = (repo, f) => spawnSync("node", [path.join(ROOT, "evals/run-golden.mjs"), "--repo", repo, "--dist", "--features", f], { encoding: "utf8" });
    assert.equal(run(clean.dir, file([])).status, 0);
    assert.equal(run(regressed.dir, file([])).status, 1);
    assert.match(run(regressed.dir, file([])).stdout, /REGRESSION: llms-entry/);
    assert.equal(spawnSync("node", [path.join(ROOT, "evals/run-golden.mjs")], { encoding: "utf8" }).status, 2);
  } finally {
    clean.cleanup();
    regressed.cleanup();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
