// scripts/check-copy.mjs: each rule fires on a bad sample, stays quiet on a good one, and the CLI exits correctly.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { SKILL } from "./helpers/paths.mjs";
import { lintString, lintFile, extractProse, actuallyFindings } from "../skills/interactive-blog/scripts/check-copy.mjs";

const CLI = path.join(SKILL, "scripts/check-copy.mjs");
const rules = (text) => [...new Set(lintString(text).map((f) => f.rule))].sort();
const errors = (text) => lintString(text).filter((f) => f.level === "error");

test("em dashes are errors, middle dots and hyphens are fine", () => {
  assert.deepEqual(rules("Amazon cut 30,000 roles — about 9% of corporate staff."), ["em-dash"]);
  assert.deepEqual(rules("Source · Reuters · October 2026. A well-known, long-run trend."), []);
});

test("each banned word and phrase is caught, in any case", () => {
  for (const bad of ["Firms quietly cut hiring.", "Honestly, this matters.", "The truth is hiring fell.", "The reality is simple.", "Make no mistake about it.", "Let's be clear about this.", "Let’s be clear about this.", "Here's the thing about prices.", "This is game-changing for banks.", "It was a transformative year.", "Incredibly, rates fell.", "Remarkably, hiring held up.", "He is not a doomer.", "Let that sink in."]) {
    assert.ok(rules(bad).includes("banned"), `should flag: ${bad}`);
  }
  for (const ok of ["The agency reported 7.5% of firms.", "Honesty in reporting is covered by the filings.", "Rates fell in March."]) assert.ok(!rules(ok).includes("banned"), `should not flag: ${ok}`);
});

test("dramatic reframes are caught and plain negation is not", () => {
  for (const bad of ["It's not a layoff. It's a strategic pivot.", "They're not doing X, they're doing Y.", "This isn't about cost. It's about control.", "This isn't about cost.", "Is it growth? No. It is a reallocation.", "It’s not a trend. It’s a shift."]) {
    assert.ok(rules(bad).includes("reframe"), `should flag: ${bad}`);
  }
  for (const ok of ["It is not clear whether prices will fall, so the model covers both cases.", "The share is not 9%. It is 8.6% of corporate staff.", "Prices did not fall in March."]) assert.ok(!rules(ok).includes("reframe"), `should not flag: ${ok}`);
});

test("three short sentences in a row are staccato; two, long ones, headlines, lists and abbreviations are not", () => {
  assert.ok(rules("Speed matters. Accuracy matters more. Scale matters most.").includes("staccato"));
  assert.ok(rules("The data is clear. Hiring is up. Budgets are expanding. The trend is accelerating.").includes("staccato"));
  assert.ok(!rules("Speed matters. Accuracy matters more. Scale is what separates the winners from everyone else in this market.").includes("staccato"));
  assert.ok(!rules("Fewer Hires. More Output. Where Did the Jobs Go?").includes("staccato"), "Title Case headline");
  assert.ok(!rules("- One short item.\n- Another short item.\n- A third short item.").includes("staccato"), "list items");
  assert.ok(!rules("Sen. Dan Sullivan led by 626 votes. Gov. Greg Abbott conceded on election night. Lt. Gov. Dan Patrick said little in response.").includes("staccato"), "abbreviations do not end sentences");
  assert.ok(!rules("## Short. Heading. Stack.\n\nThis paragraph is a single long sentence that explains the finding and its denominator in full.").includes("staccato"));
});

test("filler words are warnings, and a second 'actually' is an error across files", () => {
  const warn = lintString("It is really quite simply basically essentially dramatic.");
  assert.ok(warn.length >= 4 && warn.every((f) => f.level === "warn"));
  assert.deepEqual(actuallyFindings([{ file: "a", text: "It actually works." }]), []);
  const two = actuallyFindings([{ file: "a", text: "It actually works." }, { file: "b", text: "It actually matters." }]);
  assert.equal(two.length, 1);
  assert.equal(two[0].file, "b");
  assert.equal(two[0].level, "error");
});

test("code files are linted by their strings and JSX text, not by their code", () => {
  const src = `// a comment with — an em dash is ignored
const label = "Firms quietly cut hiring.";
const ok = (a, b) => a - b; // arithmetic, not prose
export const View = () => <p>Hiring fell — a lot. {count} firms reported it in the survey.</p>;
const fmt = \`\${n} seats, \${m} votes\`;
`;
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cc-")), "x.jsx");
  fs.writeFileSync(file, src);
  const f = lintFile(file);
  assert.ok(f.some((x) => x.rule === "banned" && x.line === 2), "string literal flagged on its line");
  assert.ok(f.some((x) => x.rule === "em-dash" && x.line === 4), "JSX text flagged");
  assert.ok(!f.some((x) => x.line === 1), "comments are skipped");
  assert.ok(!f.some((x) => x.line === 3 || x.line === 5), "code and template expressions are skipped");
  const prose = extractProse("const a = `${n} firms cut hiring`;", { jsx: false });
  assert.equal(prose[0].text, "0 firms cut hiring", "template expressions stand in as a number");
});

test("an em dash is flagged in any JSX text node, however short, including the entity forms", () => {
  const src = `// a comment \u2014 with a dash is ignored
export const A = ({ s }) => <a href={s.url}>{s.publisher} \u2014 {s.title} \u2197</a>;
export const B = () => <span className="empty">\u2014</span>;
export const C = () => <span>Name&mdash;value</span>;
export const D = () => <span className="empty">\u2013</span>; // an en dash is a different character and passes
export const E = () => <p>{/* a JSX comment \u2014 is ignored */}Plain text.</p>;
`;
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cc-")), "short.jsx");
  fs.writeFileSync(file, src);
  const lines = lintFile(file).filter((x) => x.rule === "em-dash" && x.level === "error").map((x) => x.line);
  assert.deepEqual(lines, [2, 3, 4], "the short text node, the lone dash and the entity are flagged; the comments and the en dash are not");
  const plain = path.join(path.dirname(file), "plain.js");
  fs.writeFileSync(plain, "export const a = 1; // \u2014 only a comment\n");
  assert.deepEqual(lintFile(plain), [], "a .js file has no JSX text to flag");
});

test("copy-ok skips a line, and a cited title may keep a banned word", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cc-"));
  const file = path.join(dir, "data.js");
  fs.writeFileSync(file, `export const a = "Firms quietly cut hiring."; // copy-ok\nexport const s = { title: "The white-collar bloodbath is overstated", note: "A bloodbath of cuts." };\n`);
  const f = lintFile(file);
  assert.ok(!f.some((x) => x.line === 1), "copy-ok line skipped");
  assert.ok(!f.some((x) => x.line === 2), "title lines may contain banned words");
});

test("the CLI exits 0 clean, 1 on errors, 0 on warnings unless --strict, 2 on usage; --json is parseable", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cc-"));
  const w = (n, t) => (fs.writeFileSync(path.join(dir, n), t), path.join(dir, n));
  const clean = w("clean.md", "Firms cut hiring in 2026, and the agency release counts 7.5% of 1,200 firms.\n");
  const bad = w("bad.md", "Firms quietly cut hiring.\n");
  const warn = w("warn.md", "The survey is really about hiring in the whole economy last year.\n");
  const run = (...a) => spawnSync("node", [CLI, ...a], { encoding: "utf8" });
  assert.equal(run(clean).status, 0);
  assert.match(run(clean).stdout, /clean/);
  assert.equal(run(bad).status, 1);
  assert.match(run(bad).stdout, /banned/);
  assert.equal(run(warn).status, 0);
  assert.equal(run("--strict", warn).status, 1);
  assert.equal(run().status, 2);
  assert.equal(run("/no/such/file.md").status, 2);
  const json = JSON.parse(run("--json", bad).stdout);
  assert.equal(json[0].rule, "banned");
  assert.equal(json[0].line, 1);
});
