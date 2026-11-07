#!/usr/bin/env node
// Lint prose against the Interactive Blog copy rules (references/copy-rules.md).
//
//   node scripts/check-copy.mjs [--json] [--strict] <file...>
//
// Markdown and text files are linted whole. Code files (.js .jsx .mjs .cjs .ts .tsx) are linted by their
// string literals and JSX text only, so code is never flagged. Add `copy-ok` in a comment on the same line to
// skip a line, for example a cited source title that contains a banned word.
//
// Exit codes: 0 clean (warnings allowed), 1 errors (or any finding with --strict), 2 usage error.
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const BANNED = [
  ["quietly", /\bquietly\b/i],
  ["honest", /\bhonest(?:ly)?\b/i],
  ["the truth is", /\bthe truth is\b/i],
  ["the reality is", /\bthe reality is\b/i],
  ["make no mistake", /\bmake no mistake\b/i],
  ["let's be clear", /\blet['’]?s be clear\b/i],
  ["here's the thing", /\bhere['’]?s the thing\b/i],
  ["let that sink in", /\blet that sink in\b/i],
  ["game-changing", /\bgame[- ]?chang\w*/i],
  ["transformative", /\btransformative\b/i],
  ["incredibly", /\bincredibl\w*/i],
  ["remarkably", /\bremarkabl\w*/i],
  ["doomer", /\bdoomer\b/i],
  ["bloodbath", /\bbloodbath\b/i],
];

// Words that read as filler. Reported as warnings; "actually" is an error above one use per feature.
export const CRUTCH = [
  ["really", /\breally\b/i],
  ["simply", /\bsimply\b/i],
  ["basically", /\bbasically\b/i],
  ["essentially", /\bessentially\b/i],
  ["dramatic", /\bdramatic(?:ally)?\b/i],
];

// "It's not X, it's Y" and its relatives.
export const REFRAMES = [
  /\b(?:it|this|that|they|he|she|we)(?:['’]s|['’]re| is| are)\s+not\b[^.!?\n]{1,100}[.,;:]\s*(?:it|this|that|they|he|she|we)(?:['’]s|['’]re| is| are)\b/i,
  /\b(?:isn['’]t|aren['’]t|wasn['’]t|weren['’]t)\s+(?:just|only|about|merely)\b[^.!?\n]{1,100}[.!?]\s*(?:it|this|that|they)(?:['’]s|['’]re| is| are)\b/i,
  /\?\s+No\.\s+[A-Z]/,
  /\bthis isn['’]t about\b/i,
  /\bforget\s+\w+[^.!?\n]{0,60}\.\s+(?:this|it)\s+(?:is|['’]s)\b/i,
];

const CODE = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);

// Strings and JSX text of a code file, with the 1-based line each starts on.
export function extractProse(src, { jsx = true } = {}) {
  const out = [];
  const lineAt = (i) => src.slice(0, i).split("\n").length;
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== "\n") i++;
    } else if (c === "/" && n === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end < 0 ? src.length : end + 2;
    } else if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      const start = i;
      let j = i + 1;
      let depth = 0;
      let text = "";
      while (j < src.length) {
        const d = src[j];
        if (d === "\\") {
          if (depth === 0) text += src[j + 1] === "n" ? "\n" : src[j + 1];
          j += 2;
        } else if (quote === "`" && d === "$" && src[j + 1] === "{") {
          if (depth === 0) text += "0"; // an expression stands in for a number
          depth++;
          j += 2;
        } else if (quote === "`" && depth > 0 && d === "{") {
          depth++;
          j++;
        } else if (quote === "`" && depth > 0 && d === "}") {
          depth--;
          j++;
        } else if (depth === 0 && d === quote) break;
        else if (quote !== "`" && d === "\n") break;
        else {
          if (depth === 0) text += d;
          j++;
        }
      }
      out.push({ text, line: lineAt(start), at: start });
      i = j + 1;
    } else if (jsx && (c === "\u2014" || /^&(?:mdash|#8212|#x2014);/i.test(src.slice(i, i + 8)))) {
      // Outside every comment and string, an em dash can only be JSX text, however short the text node is.
      // The 15-character rule below would miss {publisher} \u2014 {title} and a lone \u2014 in a table cell.
      const around = src.slice(Math.max(0, i - 24), i + 24).replace(/&(?:mdash|#8212|#x2014);/gi, "\u2014").replace(/\s+/g, " ");
      out.push({ text: around, line: lineAt(i), at: i });
      i += c === "&" ? src.indexOf(";", i) - i + 1 : 1;
    } else i++;
  }
  // JSX text runs between a tag or expression and the next tag or expression: >Some sentence {value} more text<
  if (jsx) {
    const run = /[>}]([^<>{}]{15,})(?=[<{])/g;
    let m;
    while ((m = run.exec(src))) {
      const t = m[1];
      const prose = /\s/.test(t) && /[A-Za-z]{3}/.test(t) && !/[=;`]|\w\.\w|\w\(/.test(t);
      if (prose) out.push({ text: t.replace(/\s+/g, " ").trim(), line: lineAt(m.index + 1), at: m.index });
    }
  }
  return out;
}

// Title Case text ("House Flipped. Senate Flipped. Why Was 2026 a Blue Tsunami?") is a headline, not prose.
const isHeadline = (t) => {
  const w = t.split(/\s+/).filter((x) => /^[A-Za-z]/.test(x));
  return w.length > 0 && w.filter((x) => /^[A-Z]/.test(x)).length / w.length >= 0.7 && t.length < 90;
};

const ABBREV = /\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Gov|Sen|Rep|Lt|Gen|Col|Capt|Sgt|vs|No|Inc|Co|Corp|Ltd|approx|etc|Fig)\./g;
const INITIAL = /\b([A-Z])\.(?=[A-Z]\.|\s+[A-Z][a-z])/g;

function sentences(paragraph) {
  return paragraph
    .replace(ABBREV, (m) => m.slice(0, -1) + "\u0001")
    .replace(INITIAL, "$1\u0001")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“(\[])/)
    .map((s) => s.trim())
    .filter(Boolean);
}
const words = (s) => s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;

// Findings for one block of prose. `line0` is the line the block starts on.
export function lintProse(text, { file = "<text>", line0 = 1, skipLines = new Set() } = {}) {
  const findings = [];
  const add = (level, rule, message, offset, snippet) => {
    const line = line0 + text.slice(0, offset).split("\n").length - 1;
    if (skipLines.has(line)) return;
    findings.push({ file, line, level, rule, message, snippet: snippet.replace(/\s+/g, " ").slice(0, 90) });
  };
  for (const m of text.matchAll(/—/g)) add("error", "em-dash", "Em dash. Use a period, comma or colon.", m.index, text.slice(Math.max(0, m.index - 30), m.index + 30));
  for (const [name, re] of BANNED) {
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    for (const m of text.matchAll(g)) add("error", "banned", `Banned: ${name}.`, m.index, m[0]);
  }
  for (const [name, re] of CRUTCH) {
    const g = new RegExp(re.source, "gi");
    for (const m of text.matchAll(g)) add("warn", "crutch", `Filler word: ${name}.`, m.index, text.slice(Math.max(0, m.index - 25), m.index + 35));
  }
  for (const re of REFRAMES) {
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    for (const m of text.matchAll(g)) add("error", "reframe", 'Dramatic reframe ("It\'s not X, it\'s Y"). Say what it is.', m.index, m[0]);
  }
  // Staccato: three or more consecutive sentences under eight words. Lists, tables, headings and code are skipped.
  let offset = 0;
  for (const block of text.split(/\n\s*\n/)) {
    const start = text.indexOf(block, offset);
    offset = start + block.length;
    const prose = block
      .split("\n")
      .filter((l) => !/^\s*(#|\||[-*]\s|\d+[.)]\s|>|```|<)/.test(l))
      .join(" ")
      .trim();
    if (isHeadline(prose)) continue; // headlines such as "Fewer Hires. More Output." are short by design
    let run = 0;
    let runStart = "";
    for (const s of sentences(prose)) {
      const alpha = s.split(/\s+/).filter((w) => /[A-Za-z]{2}/.test(w)).length;
      if (alpha < 2) run = 0; // numbers and fragments are not sentences
      else if (words(s) < 8) {
        if (run === 0) runStart = s;
        run++;
        if (run === 3) add("error", "staccato", "Three or more consecutive sentences under eight words. Combine them.", start, runStart);
      } else run = 0;
    }
  }
  return findings;
}

export function lintFile(file) {
  const src = readFileSync(file, "utf8");
  const ext = path.extname(file).toLowerCase();
  const skip = new Set();
  src.split("\n").forEach((l, i) => /copy-ok/.test(l) && skip.add(i + 1));
  if (!CODE.has(ext)) return lintProse(src, { file, skipLines: skip });
  // A cited source title may keep a banned word ("white-collar bloodbath"), so `title:` lines skip that rule.
  const titleLines = new Set();
  src.split("\n").forEach((l, i) => /\btitle\s*:/.test(l) && titleLines.add(i + 1));
  const findings = [];
  for (const p of extractProse(src, { jsx: /\.(jsx|tsx)$/i.test(file) })) {
    for (const f of lintProse(p.text, { file, line0: p.line, skipLines: skip })) {
      if (f.rule === "banned" && titleLines.has(f.line)) continue;
      if (f.rule === "staccato" && p.text.length < 90) f.level = "warn"; // UI microcopy: warn, do not fail
      findings.push(f);
    }
  }
  return dedupe(findings);
}

export function lintString(text, file = "<string>") {
  return lintProse(text, { file });
}

const dedupe = (fs) => {
  const seen = new Set();
  return fs.filter((f) => {
    const k = `${f.file}:${f.line}:${f.rule}:${f.snippet}`;
    return seen.has(k) ? false : (seen.add(k), true);
  });
};

// "actually" is allowed once in the whole feature.
export function actuallyFindings(findingsByFile) {
  const all = findingsByFile.flatMap(({ file, text }) => [...text.matchAll(/\bactually\b/gi)].map((m) => ({ file, at: m.index, text })));
  if (all.length <= 1) return [];
  return all.slice(1).map((a) => ({
    file: a.file,
    line: a.text.slice(0, a.at).split("\n").length,
    level: "error",
    rule: "actually",
    message: `"actually" appears ${all.length} times in the feature; the limit is one.`,
    snippet: a.text.slice(Math.max(0, a.at - 25), a.at + 35).replace(/\s+/g, " "),
  }));
}

// Lint several files as one feature: each file by its own rules, then the one-"actually" limit across all of them.
export function lintFiles(files) {
  const findings = [];
  const prose = [];
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    findings.push(...lintFile(f));
    const ext = path.extname(f).toLowerCase();
    prose.push({ file: f, text: CODE.has(ext) ? extractProse(src, { jsx: /\.(jsx|tsx)$/i.test(f) }).map((p) => p.text).join("\n") : src });
  }
  return [...findings, ...actuallyFindings(prose)];
}

function main(argv) {
  const json = argv.includes("--json");
  const strict = argv.includes("--strict");
  const files = argv.filter((a) => !a.startsWith("--"));
  if (!files.length) {
    console.error("usage: node scripts/check-copy.mjs [--json] [--strict] <file...>");
    return 2;
  }
  let findings;
  try {
    findings = lintFiles(files);
  } catch (e) {
    console.error(`cannot read ${e.path ?? files.join(", ")}: ${e.message}`);
    return 2;
  }
  if (json) console.log(JSON.stringify(findings, null, 2));
  else if (!findings.length) console.log(`copy check: clean (${files.length} file${files.length > 1 ? "s" : ""})`);
  else {
    for (const f of findings) console.log(`${f.file}:${f.line}  ${f.level.padEnd(5)}  ${f.rule.padEnd(8)}  ${f.message}  "${f.snippet}"`);
    const errors = findings.filter((f) => f.level === "error").length;
    console.log(`\n${errors} error${errors === 1 ? "" : "s"}, ${findings.length - errors} warning${findings.length - errors === 1 ? "" : "s"}`);
  }
  const errors = findings.filter((f) => f.level === "error").length;
  return errors || (strict && findings.length) ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) process.exit(main(process.argv.slice(2)));
