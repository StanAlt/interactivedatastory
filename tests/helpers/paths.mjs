import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
export const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
export const list = (rel) => fs.readdirSync(path.join(ROOT, rel)).sort();

// The skill folder: skills/interactive-blog (SKILL.md, references, assets, scripts).
export const SKILL = path.join(ROOT, "skills/interactive-blog");
export const sread = (rel) => fs.readFileSync(path.join(SKILL, rel), "utf8");
export const sexists = (rel) => fs.existsSync(path.join(SKILL, rel));
export const slist = (rel) => fs.readdirSync(path.join(SKILL, rel)).sort();

// Every file in the repo that is text and not inside node_modules, .git or generated results.
export function textFiles(dir = ROOT, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "results"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) textFiles(full, out);
    else if (!/\.(png|jpg|jpeg|gif|webp|ico|pdf|skill|zip)$/i.test(e.name)) out.push(full);
  }
  return out;
}

export function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return { data, body: text.slice(m[0].length) };
}
