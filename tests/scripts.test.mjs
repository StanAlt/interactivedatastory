// The bundled scripts: syntax, SVG validator behavior, and the social-image generator end to end.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { SKILL, slist, sread } from "./helpers/paths.mjs";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "ib-"));
const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: "utf8", ...opts });

test("every script and the test template parses", () => {
  for (const f of [...slist("scripts").filter((f) => /\.(cjs|mjs)$/.test(f)).map((f) => `scripts/${f}`), "assets/test-template.mjs"]) {
    const r = sh("node", ["--check", path.join(SKILL, f)]);
    assert.equal(r.status, 0, `${f}: ${r.stderr}`);
  }
  // Compile to a temp file so no __pycache__ is left inside the skill.
  const compiled = path.join(tmp(), "og.pyc");
  const py = sh("python3", ["-c", "import py_compile,sys; py_compile.compile(sys.argv[1], cfile=sys.argv[2], doraise=True)", path.join(SKILL, "assets/og-image-template.py"), compiled]);
  assert.equal(py.status, 0, py.stderr);
  assert.equal(sh("bash", ["-n", path.join(SKILL, "scripts/validate-svg.sh")]).status, 0);
});

test("scripts that need a browser or packages print usage instead of crashing", () => {
  for (const [f, args] of [["scripts/qa-scrolly.cjs", []], ["scripts/probe-status-outlines.cjs", []], ["scripts/build-geo.cjs", []]]) {
    const r = sh("node", [path.join(SKILL, f), ...args], { cwd: tmp() });
    assert.equal(r.status, 2, `${f} exits 2 without arguments`);
    assert.match(r.stderr, /usage/i, `${f} prints usage`);
  }
});

const SVG = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${inner}</svg>`;
const validate = (svg) => {
  const f = path.join(tmp(), "t.svg");
  fs.writeFileSync(f, svg);
  return sh("bash", [path.join(SKILL, "scripts/validate-svg.sh"), f]);
};

test("validate-svg.sh accepts a clean SVG and rejects each rule violation", () => {
  const ok = validate(SVG('<rect fill="#fff" fill-opacity="0.05" stroke="#000" stroke-opacity="0.3"/><text>P&amp;L</text>'));
  assert.equal(ok.status, 0, ok.stdout);
  assert.match(ok.stdout, /duplicate opacity: 0 \| unescaped &: 0 \| valid XML: yes/);

  const dup = validate(SVG('<rect fill="#fff" opacity="0.05" stroke="#000" opacity="0.3"/>'));
  assert.notEqual(dup.status, 0);
  assert.match(dup.stdout, /duplicate opacity: 1/);

  const amp = validate(SVG("<text>P&L</text>"));
  assert.notEqual(amp.status, 0);
  assert.match(amp.stdout, /unescaped &: [1-9]/);

  const broken = validate("<svg><rect></svg>");
  assert.notEqual(broken.status, 0);
  assert.match(broken.stdout, /valid XML: no/);

  assert.equal(sh("bash", [path.join(SKILL, "scripts/validate-svg.sh")]).status, 1, "usage when no file is given");
});

test("og-image-template.py writes a valid 1200 x 630 SVG with the logo, headline and statistic", () => {
  const cwd = tmp();
  fs.mkdirSync(path.join(cwd, "public/img"), { recursive: true });
  const r = sh("python3", [path.join(SKILL, "assets/og-image-template.py")], { cwd });
  assert.equal(r.status, 0, r.stderr);
  const out = path.join(cwd, "public/img/example-research.svg");
  const svg = fs.readFileSync(out, "utf8");
  assert.match(svg, /viewBox="0 0 1200 630"/);
  for (const line of ["Fewer hires.", "More output.", "Where did", "the jobs go?"]) assert.ok(svg.includes(line), line);
  assert.ok(svg.includes("acadia.im") && svg.includes("ACADIA INTERACTIVE RESEARCH"));
  assert.ok(svg.includes("<g transform="), "the vector logo group is embedded");
  const v = sh("bash", [path.join(SKILL, "scripts/validate-svg.sh"), out]);
  assert.equal(v.status, 0, v.stdout);
  const font = [...svg.matchAll(/font-size="(\d+)"/g)].map((m) => Number(m[1]));
  assert.ok(Math.min(...font) >= 15, `smallest text is ${Math.min(...font)}px (floor 15)`);
});

test("the shared stylesheets have balanced braces", () => {
  for (const f of ["assets/base.css", "assets/charts.css", "assets/scrolly.css"]) {
    const css = sread(f).replace(/\/\*[\s\S]*?\*\//g, "");
    assert.equal(css.split("{").length, css.split("}").length, `${f} braces balance`);
  }
});
