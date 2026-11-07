// Structure of the skill itself: frontmatter, phases, bundled files, manifests, repo hygiene.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { ROOT, read, exists, sread, sexists, slist, textFiles, frontmatter } from "./helpers/paths.mjs";
import fs from "node:fs";

const skill = frontmatter(sread("SKILL.md"));
const plugin = JSON.parse(read(".claude-plugin/plugin.json"));
const market = JSON.parse(read(".claude-plugin/marketplace.json"));
const pkg = JSON.parse(read("package.json"));

test("SKILL.md has valid frontmatter whose name matches the plugin", () => {
  assert.ok(skill, "frontmatter block");
  assert.equal(skill.data.name, "interactive-blog");
  assert.equal(skill.data.name, plugin.name);
  const d = skill.data.description;
  assert.ok(d.length >= 300 && d.length <= 1024, `description is ${d.length} characters (limit 1024)`);
  assert.ok(!d.includes("—"), "no em dash in the description");
  for (const phrase of ["interactive blog", "data story", "scrollytelling", "deep research", "upgrade"]) assert.ok(d.toLowerCase().includes(phrase), `description should mention "${phrase}" so the skill triggers`);
});

test("SKILL.md body stays under 500 lines and keeps the nine phases in order", () => {
  assert.ok(skill.body.split("\n").length < 500);
  const phases = [...skill.body.matchAll(/^## Phase (\d) · (.+)$/gm)].map((m) => [Number(m[1]), m[2]]);
  assert.deepEqual(phases.map((p) => p[0]), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(phases.map((p) => p[1]), ["Brief", "Deep research", "Analysis", "Narrative and copy", "Visualization design", "Build", "Social image", "Test and QA", "Ship"]);
  assert.match(skill.body, /^## Bundled files/m);
  assert.match(skill.body, /^## Delivery summary checklist/m);
});

test("every bundled path mentioned in the docs exists", () => {
  const ignore = new Set(["scripts/inject-og-meta.js"]); // lives in the site repo, not here
  const docs = ["SKILL.md", ...slist("references").map((f) => `references/${f}`)];
  const missing = [];
  for (const doc of docs) {
    for (const m of sread(doc).matchAll(/`((?:references|assets|scripts)\/[A-Za-z0-9_.-]+)`/g)) {
      if (!ignore.has(m[1]) && !sexists(m[1])) missing.push(`${doc}: ${m[1]}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("every bundled file is described in SKILL.md or a reference", () => {
  const docs = [sread("SKILL.md"), ...slist("references").map((f) => sread(`references/${f}`))].join("\n");
  const orphans = [];
  for (const dir of ["references", "assets", "scripts"]) for (const f of slist(dir)) if (!docs.includes(f)) orphans.push(`${dir}/${f}`);
  assert.deepEqual(orphans, []);
});

test("the references we point to for each phase exist and have the sections the skill names", () => {
  assert.match(sread("references/research-protocol.md"), /## 6\. Analysis/);
  assert.match(sread("references/research-protocol.md"), /## 8\. What to exclude/);
  assert.match(sread("references/copy-rules.md"), /## Banned/);
  assert.match(sread("references/scrollytelling.md"), /## 10\. QA for scroll stories/);
  assert.match(sread("references/build-checklist.md"), /check-feature\.mjs/);
  assert.match(sread("references/build-checklist.md"), /check-copy\.mjs/);
});

test("plugin, marketplace and package manifests agree", () => {
  assert.match(plugin.version, /^\d+\.\d+\.\d+$/);
  assert.equal(plugin.version, pkg.version);
  assert.equal(plugin.license, "MIT");
  assert.deepEqual(plugin.skills, ["./skills"], "narrow, so evals/ does not overlap the skills path");
  assert.ok(sexists("SKILL.md"), "the skill lives at skills/interactive-blog");
  assert.ok(plugin.author?.name);
  assert.equal(market.plugins.length, 1);
  assert.equal(market.plugins[0].name, plugin.name);
  assert.equal(market.plugins[0].source, "./");
  assert.equal(market.plugins[0].version, plugin.version);
  assert.ok(market.name && market.description);
  assert.ok(pkg.scripts.test && pkg.scripts["eval:golden"]);
});

test("the repo has the files a shared skill needs", () => {
  for (const f of ["README.md", "LICENSE", "NOTICE.md", ".gitignore", ".github/workflows/ci.yml", "evals/README.md"]) assert.ok(exists(f), `${f} exists`);
  const readme = read("README.md");
  assert.ok(readme.split(/\s+/).length >= 200, "README explains the skill");
  for (const needle of ["npm test", "claude plugin eval", "/plugin marketplace add", "Rebrand", "interactive-blog"]) assert.ok(readme.includes(needle), `README mentions ${needle}`);
  assert.match(read("LICENSE"), /^MIT License/);
  assert.match(read(".github/workflows/ci.yml"), /npm test/);
});

test("no credentials, session links or local paths are committed", () => {
  const patterns = [
    [/ghp_[A-Za-z0-9]{20,}/, "GitHub token"],
    [/github_pat_[A-Za-z0-9_]{20,}/, "GitHub fine-grained token"],
    [/AKIA[0-9A-Z]{16}/, "AWS key"],
    [/sk-[A-Za-z0-9]{32,}/, "API key"],
    [/xox[bpa]-[A-Za-z0-9-]{10,}/, "Slack token"],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
    [/claude\.ai\/code\/session_/, "Claude session link"],
    [/\/tmp\/claude-0\//, "local scratch path"],
    [/\/root\/\.claude/, "local home path"],
  ];
  const hits = [];
  for (const file of textFiles()) {
    if (file.endsWith(path.join("tests", "skill.test.mjs"))) continue; // this file names the patterns
    const text = fs.readFileSync(file, "utf8");
    for (const [re, label] of patterns) if (re.test(text)) hits.push(`${path.relative(ROOT, file)}: ${label}`);
  }
  assert.deepEqual(hits, []);
});
