#!/usr/bin/env node
// Check a finished Interactive Blog feature against the skill's build checklist
// (references/build-checklist.md). Run it from anywhere; point it at the site checkout.
//
//   node scripts/check-feature.mjs --repo <site checkout> --slug <post slug> [--dist] [--json] [--strict]
//
// Every check prints PASS, FAIL (an error) or WARN. Exit codes: 0 no errors, 1 errors (or warnings with --strict),
// 2 usage error. --dist also checks the built static fallback in dist/ (run `npm run build` first).
//
// Assumes the Acadia site layout: src/data/<topic>Research.js exports the post, src/data/blogPosts.js lists it,
// src/App.jsx holds a lazy route, src/components/Blog.jsx has FEATURED_SLUGS, public/llms.txt lists the URL.
// Adapt the paths in `paths` below for another site.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { lintFile, lintString, actuallyFindings } from "./check-copy.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const paths = {
  data: "src/data",
  blogPosts: "src/data/blogPosts.js",
  app: "src/App.jsx",
  blog: "src/components/Blog.jsx",
  llms: "public/llms.txt",
  research: "research",
};
const SITE = "https://www.acadia.im";
const CALENDAR = "calendar.google.com/calendar/appointments/schedules/";

function parseArgs(argv) {
  const a = { flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const k = argv[i].slice(2);
      if (["repo", "slug"].includes(k)) a[k] = argv[++i];
      else a.flags.add(k);
    }
  }
  return a;
}

export async function checkFeature({ repo, slug, dist = false }) {
  const results = [];
  const check = (id, level, ok, message) => results.push({ id, level, ok: !!ok, message });
  const abs = (rel) => path.join(repo, rel);
  const read = (rel) => (fs.existsSync(abs(rel)) ? fs.readFileSync(abs(rel), "utf8") : null);

  // 1. Find the post and its research module.
  let post, mod, modFile;
  const importErrors = [];
  const dataDir = abs(paths.data);
  if (fs.existsSync(dataDir)) {
    for (const f of fs.readdirSync(dataDir).filter((f) => f.endsWith(".js") && f !== "blogPosts.js")) {
      try {
        const m = await import(pathToFileURL(path.join(dataDir, f)).href);
        for (const v of Object.values(m)) if (v && typeof v === "object" && v.slug === slug) (post = v), (mod = m), (modFile = f);
      } catch (e) {
        importErrors.push(`${f}: ${e.message.split("\n")[0]}`);
      }
    }
  }
  check("post-found", "error", post, post ? `${paths.data}/${modFile} exports the post` : `no module in ${paths.data} exports a post with slug "${slug}"${importErrors.length ? ` (import errors: ${importErrors.join("; ")})` : ""}`);
  if (!post) return results;

  // 2. Post fields.
  const missing = [];
  if (!Number.isInteger(post.id)) missing.push("id (integer)");
  for (const k of ["title", "excerpt", "author", "readTime", "category", "image", "content"]) if (typeof post[k] !== "string" || !post[k].trim()) missing.push(k);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date ?? "")) missing.push("date (YYYY-MM-DD)");
  if (!Array.isArray(post.tags) || !post.tags.length) missing.push("tags");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) missing.push("slug (kebab-case)");
  if (typeof post.image === "string" && !post.image.startsWith("/img/")) missing.push("image (/img/...)");
  check("post-fields", "error", !missing.length, missing.length ? `missing or invalid: ${missing.join(", ")}` : "all post fields present");
  check("post-excerpt", "warn", (post.excerpt ?? "").length >= 60 && post.excerpt.length <= 320, `excerpt is ${(post.excerpt ?? "").length} characters (60 to 320 reads well in cards and search)`);

  // 3. Registered once, first, unique ids.
  try {
    const { blogPosts } = await import(pathToFileURL(abs(paths.blogPosts)).href);
    const matches = blogPosts.filter((p) => p.slug === slug);
    check("registered-once", "error", matches.length === 1, `blogPosts lists the slug ${matches.length} time(s)`);
    check("registered-first", "warn", blogPosts[0]?.slug === slug || blogPosts.slice(0, 5).some((p) => p.slug === slug), "the post is among the first five in blogPosts (newest first)");
    const ids = blogPosts.map((p) => p.id);
    const dups = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
    check("unique-ids", "error", !dups.length, dups.length ? `duplicate post ids: ${dups.join(", ")}` : `${ids.length} posts, no duplicate ids`);
  } catch (e) {
    check("registered-once", "error", false, `cannot import ${paths.blogPosts}: ${e.message.split("\n")[0]}`);
  }

  // 4. Route: once, lazy, before /blog/:slug.
  const app = read(paths.app);
  let componentRel;
  if (!app) check("route", "error", false, `${paths.app} not found`);
  else {
    const count = app.split(`/blog/${slug}"`).length - 1;
    const at = app.indexOf(`/blog/${slug}"`);
    const catchAll = app.indexOf('path="/blog/:slug"');
    check("route-once", "error", count === 1, `/blog/${slug} appears ${count} time(s) in ${paths.app}`);
    check("route-before-slug", "error", at > 0 && catchAll > 0 && at < catchAll, 'the route comes before path="/blog/:slug" (otherwise the generic post page wins)');
    const line = app.split("\n").find((l) => l.includes(`/blog/${slug}"`)) ?? "";
    const el = line.match(/<([A-Z]\w+)\s*\/>\s*<\/React\.Suspense>/)?.[1];
    const lazy = el && app.match(new RegExp(`const ${el}\\s*=\\s*React\\.lazy\\(\\(\\)\\s*=>\\s*import\\(['"]([^'"]+)['"]\\)\\)`));
    check("route-lazy", "error", !!lazy, lazy ? `${el} is lazy-loaded from ${lazy[1]}` : "the route element is not wrapped in React.Suspense with a React.lazy import");
    if (lazy) componentRel = path.join("src", lazy[1].replace(/^\.\//, "")) + ".jsx";
  }

  // 5. Featured slot and llms.txt.
  const blog = read(paths.blog);
  check("featured-slug", "warn", blog?.includes(`'${slug}'`) || blog?.includes(`"${slug}"`), "the slug is in FEATURED_SLUGS (first position is the blog spotlight)");
  const llms = read(paths.llms);
  check("llms-entry", "error", llms?.includes(`${SITE}/blog/${slug}`), `public/llms.txt lists ${SITE}/blog/${slug}`);

  // 6. Component.
  if (componentRel && fs.existsSync(abs(componentRel))) {
    const jsx = read(componentRel);
    const cssRel = componentRel.replace(/\.jsx$/, ".css");
    check("component-imports", "error", /import\s+["']\.\/SeatPricingStudy\.css["']/.test(jsx) && jsx.includes(`./${path.basename(cssRel)}`), "imports ./SeatPricingStudy.css and its own stylesheet");
    check("component-root", "error", /<main\s+className="seat-study[ "]/.test(jsx), 'root element is <main className="seat-study ...">');
    check("booking-embed", "error", jsx.includes(CALENDAR), "the Google Calendar booking iframe is present");
    check("booking-fallback", "error", /href="\/book"/.test(jsx), "the /book fallback link is present");
    check("chapter-nav", "warn", /sp-chapters/.test(jsx), "has a sticky chapter navigation (sp-chapters)");
    check("source-ledger", "warn", /id="study-sources"|study-sources/.test(jsx) && /download/i.test(jsx), "renders the source ledger with a data download");
    check("reduced-motion", "warn", /prefers-reduced-motion/.test(jsx + (read(cssRel) ?? "")), "respects prefers-reduced-motion");
    if (fs.existsSync(abs(cssRel))) {
      const css = read(cssRel);
      check("css-responsive", "warn", /@media\s*\(max-width:\s*(?:1190|1100|1099|940|680)px\)/.test(css), "has responsive blocks (1190, 940 and 680px)");
      check("css-reduced-motion", "warn", /prefers-reduced-motion/.test(css), "the stylesheet has a reduced-motion block");
      check("css-legend", "warn", /^\/\*[\s\S]{0,900}?(?:blue|coral|teal|ink|amber|color)/i.test(css.trimStart()), "the stylesheet opens with a comment stating the color meanings");
    } else check("css-file", "error", false, `${cssRel} not found`);
    const copy = lintFile(abs(componentRel)).filter((f) => f.level === "error");
    check("component-copy", "error", !copy.length, copy.length ? `${copy.length} copy-rule error(s), first: ${copy[0].rule} at line ${copy[0].line} "${copy[0].snippet}"` : "component text passes the copy rules");
  } else check("component", "error", false, componentRel ? `${componentRel} not found` : "could not find the component from the route");

  // 7. Social image.
  const imgRel = post.image ? path.join("public", post.image) : null;
  if (imgRel && fs.existsSync(abs(imgRel))) {
    const buf = fs.readFileSync(abs(imgRel));
    const isPng = buf.length > 24 && buf.toString("ascii", 1, 4) === "PNG";
    const [w, h] = isPng ? [buf.readUInt32BE(16), buf.readUInt32BE(20)] : [0, 0];
    check("og-image-size", "error", isPng && w === 1200 && h === 630, isPng ? `social image is ${w}x${h} (needs 1200x630)` : "social image is not a PNG");
  } else check("og-image-size", "error", false, `social image ${imgRel ?? "(none)"} not found`);
  const svgRel = imgRel?.replace(/\.png$/, ".svg");
  if (svgRel && fs.existsSync(abs(svgRel))) {
    const r = spawnSync("bash", [path.join(HERE, "validate-svg.sh"), abs(svgRel)], { encoding: "utf8" });
    check("og-svg-valid", "error", r.status === 0, (r.stdout || r.stderr || "").trim().split("\n").pop());
  } else check("og-svg-valid", "warn", false, "no SVG source next to the PNG to validate");

  // 8. Source ledger and fallback.
  const sources = mod.sources;
  if (!Array.isArray(sources)) check("sources", "error", false, "the research module does not export a `sources` array");
  else {
    const ids = sources.map((s) => s.id);
    const dupIds = ids.filter((x, i) => ids.indexOf(x) !== i);
    const bad = sources.filter((s) => !s.id || !s.publisher || !s.title || !s.date || !/^https:\/\//.test(s.url ?? "") || !s.note);
    check("sources-complete", "error", !bad.length && !dupIds.length, bad.length ? `${bad.length} source(s) missing id, publisher, title, date, https url or note (first: ${bad[0].id ?? bad[0].title})` : dupIds.length ? `duplicate source ids: ${dupIds.join(", ")}` : `${sources.length} sources, all complete and unique`);
    const modSrc = read(path.join(paths.data, modFile)) ?? "";
    const known = new Set(ids);
    const cited = [...modSrc.matchAll(/\bsources?\s*:\s*\[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/["']([\w-]+)["']/g)].map((x) => x[1]));
    const unknown = [...new Set(cited.filter((id) => !known.has(id)))];
    check("sources-cited-exist", "error", !unknown.length, unknown.length ? `cited but not in the ledger: ${unknown.join(", ")}` : `${cited.length} citations resolve to the ledger`);
    const listed = sources.filter((s) => !post.content?.includes(s.url));
    check("fallback-lists-sources", "error", !listed.length, listed.length ? `${listed.length} source URL(s) missing from the fallback content (first: ${listed[0].id})` : "the fallback lists every source URL");
  }
  const content = post.content ?? "";
  check("fallback-sources-heading", "error", /^## Sources/m.test(content), "the fallback has a ## Sources section");
  check("fallback-booking", "error", content.includes("(/book)"), "the fallback links to /book");
  // Cited source titles in the ## Sources list may keep a banned word; every other rule still applies there.
  const sourcesAt = content.search(/^## Sources/m);
  const fb = lintString(content, "post.content").filter((f) => !(f.rule === "banned" && sourcesAt >= 0 && f.line >= content.slice(0, sourcesAt).split("\n").length));
  const fbErrors = [...fb.filter((f) => f.level === "error"), ...actuallyFindings([{ file: "post.content", text: content }])];
  check("fallback-copy", "error", !fbErrors.length, fbErrors.length ? `${fbErrors.length} copy-rule error(s) in the fallback, first: ${fbErrors[0].rule} "${fbErrors[0].snippet}"` : "the fallback passes the copy rules");
  const dataCopy = lintFile(abs(path.join(paths.data, modFile))).filter((f) => f.level === "error");
  check("research-copy", "error", !dataCopy.length, dataCopy.length ? `${dataCopy.length} copy-rule error(s) in ${modFile}, first: ${dataCopy[0].rule} at line ${dataCopy[0].line} "${dataCopy[0].snippet}"` : `${modFile} text passes the copy rules`);

  // 9. Tests and docs.
  const tests = fs.existsSync(abs(paths.research)) ? fs.readdirSync(abs(paths.research)).filter((f) => f.endsWith(".test.mjs")) : [];
  const tested = tests.filter((f) => (read(path.join(paths.research, f)) ?? "").includes(modFile));
  check("data-tests", "error", tested.length > 0, tested.length ? `tests: ${tested.join(", ")}` : `no research/*.test.mjs imports ${modFile}`);
  const docs = fs.existsSync(abs(paths.research)) ? fs.readdirSync(abs(paths.research)).filter((f) => f.endsWith(".md")) : [];
  const mentions = (suffix) => docs.filter((f) => f.endsWith(suffix) && (read(path.join(paths.research, f)) ?? "").includes(slug));
  const designs = mentions("-design.md");
  check("design-doc", "warn", designs.length > 0, designs.length ? `design notes: research/${designs[0]}` : "no research/*-design.md mentions the slug");
  const validation = designs.map((f) => f.replace(/-design\.md$/, "-validation.md")).find((f) => fs.existsSync(abs(path.join(paths.research, f))));
  check("validation-doc", "warn", !!validation, validation ? `validation notes: research/${validation}` : "no research/<topic>-validation.md next to the design notes");

  // 10. Build output (optional).
  if (dist) {
    const html = read(path.join("dist", "blog", slug, "index.html"));
    check("dist-page", "error", !!html, html ? "dist/blog/<slug>/index.html exists" : "dist/blog/<slug>/index.html not found (run npm run build)");
    if (html) {
      check("dist-title", "error", /<title>[^<]+<\/title>/.test(html), "static page has a <title>");
      check("dist-canonical", "error", html.includes(`<link rel="canonical" href="${SITE}/blog/${slug}"`), "static page has the canonical URL");
      check("dist-og-image", "error", html.includes(`og:image" content="${SITE}${post.image}"`), "static page has the og:image");
      check("dist-fallback", "error", html.includes('data-render="static-fallback"'), "static page renders the crawlable fallback");
    }
    const sitemap = read(path.join("dist", "sitemap.xml")) ?? read("public/sitemap.xml") ?? "";
    check("sitemap", "error", sitemap.includes(`/blog/${slug}`), "the sitemap lists the post");
  }
  return results;
}

function report(results, { slug, repo }) {
  const mark = (r) => (r.ok ? "PASS" : r.level === "error" ? "FAIL" : "WARN");
  console.log(`check-feature: ${slug}\n${repo}\n`);
  for (const r of results) console.log(`${mark(r)}  ${r.id.padEnd(24)} ${r.message}`);
  const fail = results.filter((r) => !r.ok && r.level === "error").length;
  const warn = results.filter((r) => !r.ok && r.level === "warn").length;
  console.log(`\n${results.filter((r) => r.ok).length} passed, ${fail} failed, ${warn} warning${warn === 1 ? "" : "s"}`);
}

async function main(argv) {
  const a = parseArgs(argv);
  if (!a.repo || !a.slug) {
    console.error("usage: node scripts/check-feature.mjs --repo <site checkout> --slug <post slug> [--dist] [--json] [--strict]");
    return 2;
  }
  const repo = path.resolve(a.repo);
  if (!fs.existsSync(repo)) {
    console.error(`repo not found: ${repo}`);
    return 2;
  }
  const results = await checkFeature({ repo, slug: a.slug, dist: a.flags.has("dist") });
  if (a.flags.has("json")) console.log(JSON.stringify(results, null, 2));
  else report(results, { slug: a.slug, repo });
  const fail = results.some((r) => !r.ok && r.level === "error");
  const warn = results.some((r) => !r.ok && r.level === "warn");
  return fail || (a.flags.has("strict") && warn) ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) process.exit(await main(process.argv.slice(2)));
