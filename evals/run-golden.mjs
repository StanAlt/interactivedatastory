#!/usr/bin/env node
// Golden regression: run scripts/check-feature.mjs on the features listed in evals/golden-features.json and compare
// the checks each fails with the recorded expectation.
//
//   node evals/run-golden.mjs --repo <site checkout> [--dist] [--features <file>]
//
// Exit codes: 0 every feature matches its recorded result, 1 a regression or an unrecorded improvement, 2 usage error.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkFeature } from "../skills/interactive-blog/scripts/check-feature.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (name) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : undefined);

export async function runGolden({ repo, featuresFile, dist }) {
  const { features } = JSON.parse(fs.readFileSync(featuresFile, "utf8"));
  const rows = [];
  for (const f of features) {
    const results = await checkFeature({ repo, slug: f.slug, dist });
    const failed = results.filter((r) => !r.ok && r.level === "error").map((r) => r.id).sort();
    const expected = [...f.expectFail].sort();
    const regressions = failed.filter((id) => !expected.includes(id));
    const improved = expected.filter((id) => !failed.includes(id));
    rows.push({ ...f, passed: results.filter((r) => r.ok).length, total: results.length, failed, regressions, improved, ok: !regressions.length && !improved.length });
  }
  return rows;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const repo = opt("repo");
  if (!repo || !fs.existsSync(repo)) {
    console.error("usage: node evals/run-golden.mjs --repo <site checkout> [--dist] [--features <file>]");
    process.exit(2);
  }
  const rows = await runGolden({ repo: path.resolve(repo), featuresFile: opt("features") ?? path.join(HERE, "golden-features.json"), dist: argv.includes("--dist") });
  for (const r of rows) {
    const note = r.regressions.length ? `REGRESSION: ${r.regressions.join(", ")}` : r.improved.length ? `IMPROVED (update golden-features.json): ${r.improved.join(", ")}` : r.failed.length ? `as recorded, known findings: ${r.failed.join(", ")}` : "clean";
    console.log(`${r.ok ? "ok  " : "FAIL"}  ${r.label.padEnd(32)} ${r.passed}/${r.total}  ${note}`);
  }
  process.exit(rows.every((r) => r.ok) ? 0 : 1);
}
