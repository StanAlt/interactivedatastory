// Builds a tiny site in a temp folder that satisfies every check in scripts/check-feature.mjs, and can inject one
// fault at a time. The feature checker is tested against this: the clean site must pass, and each fault must fail
// exactly the checks it should.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

// A solid-color PNG of the given size.
export function png(width, height) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(width * 3, 0xfa)]);
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

export const SLUG = "demo-feature";
const CALENDAR = "https://calendar.google.com/calendar/appointments/schedules/EXAMPLE?gv=true";

const GOOD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#faf6ef"/><rect x="10" y="10" width="40" height="40" fill="#d6502b" fill-opacity="0.2" stroke="#14120e" stroke-opacity="0.5"/><text x="20" y="100">P&amp;L at a glance</text></svg>`;

// opts is a set of fault names. See the checker tests for what each one should break.
export function buildMiniSite(opts = {}) {
  const has = (k) => opts[k] === true || (opts.faults ?? []).includes(k);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mini-site-"));
  const w = (rel, text) => {
    const f = path.join(dir, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, text);
  };

  w("package.json", JSON.stringify({ name: "mini-site", type: "module" }));

  const sourceList = [
    { id: "agency-2026", publisher: "Example Agency", title: "Quarterly release", date: "March 2026", url: "https://example.com/release", note: "7.5% of 1,200 firms; the denominator is firms, not workers." },
    { id: "paper-2026", publisher: "Example University", title: "Working paper", date: "April 2026", url: "https://example.com/paper", note: "Peer-reviewed estimate of hiring." },
  ];
  if (has("duplicateSourceId")) sourceList.push({ ...sourceList[0], url: "https://example.com/other" });
  const sourcesJs = JSON.stringify(sourceList, null, 2);

  const thesis = has("bannedWord")
    ? "Firms quietly cut hiring in 2026, and the agency release counts 7.5% of 1,200 firms."
    : has("emDashNarrative")
      ? "Firms cut hiring in 2026 — the agency release counts 7.5% of 1,200 firms."
      : "Firms cut hiring in 2026, and the agency release counts 7.5% of 1,200 firms. A working paper estimates the effect on hiring.";
  const cite = has("unknownSource") ? '["agency-2026", "ghost-2026"]' : '["agency-2026"]';
  // Plain concatenation inside the generated module, so no nested template literals need escaping.
  const unlisted = has("unlistedSource") ? ".filter((s) => s.id !== 'paper-2026')" : "";
  const listExpr = `sources${unlisted}.map((s) => "- [" + s.publisher + ": " + s.title + "](" + s.url + "). " + s.date + ". " + s.note).join("\\n")`;
  const sourcesBlock = has("noSourcesHeading") ? "" : "\\n\\n## Sources\\n\\n${" + listExpr + "}";
  const bookLink = has("noFallbackBook") ? "" : "\\n\\n[Book 30 minutes with Stan](/book) to discuss what this changes in your market.";

  w(
    "src/data/demoResearch.js",
    `export const sources = ${sourcesJs};

export const rows = [
  { id: "a", label: "Firms", value: 7.5, sources: ${cite} },
  { id: "b", label: "Hiring", value: 3, sources: ["paper-2026"] },
];

export const narrative = {
  thesis: [${JSON.stringify(thesis)}],
};

export const demoPost = {
  id: ${has("duplicateId") ? 1 : 90},
  slug: "${has("missingSlug") ? "another-slug" : SLUG}",
  title: "Where Did Hiring Go?",
  excerpt: "Firms cut hiring in 2026. Compare the agency release with a working paper and see the denominator that changes the story.",
  author: "Stan Altshuller",
  date: "2026-11-09",
  readTime: "10 min exploration",
  category: "Strategy",
  tags: ["Research", "Interactive"],
  image: "/img/demo-research.png",
  content: \`\${narrative.thesis.join("\\n\\n")}${sourcesBlock}${bookLink}\`,
};
`,
  );

  w(
    "src/data/blogPosts.js",
    `import { demoPost } from "./demoResearch.js";
export const blogPosts = [
  demoPost,
  { id: 1, slug: "older-post", title: "Older post", date: "2026-01-01" },
  { id: 2, slug: "oldest-post", title: "Oldest post", date: "2025-12-01" },
];
`,
  );

  const route = `<Route path="/blog/${SLUG}" element={<PageShell hideChatWidget><React.Suspense fallback={<div>Loading</div>}><DemoStudy /></React.Suspense></PageShell>} />`;
  const catchAll = `<Route path="/blog/:slug" element={<BlogPostRoute />} />`;
  w(
    "src/App.jsx",
    `import React from 'react';
${has("notLazy") ? "import DemoStudy from './components/DemoStudy';" : "const DemoStudy = React.lazy(() => import('./components/DemoStudy'));"}
export default function App() {
  return (
    <Routes>
      <Route path="/blog" element={<Blog />} />
      ${has("noRoute") ? "" : has("routeAfterSlug") ? catchAll + "\n      " + route : route + "\n      " + catchAll}
    </Routes>
  );
}
`,
  );

  w("src/components/Blog.jsx", `const FEATURED_SLUGS = [\n  ${has("noFeatured") ? "'older-post'" : `'${SLUG}'`},\n];\n`);
  w("public/llms.txt", `# Demo\n\n${has("noLlms") ? "" : `- [Where Did Hiring Go?](https://www.acadia.im/blog/${SLUG})\n`}`);

  const jsxText = has("emDashComponent") ? "A heading — with an em dash in the component text." : "Explore the data and follow every source.";
  w(
    "src/components/DemoStudy.jsx",
    `import React from "react";
import "./SeatPricingStudy.css";
import "./DemoStudy.css";

export default function DemoStudy() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <main className="seat-study demo-study">
      <nav className="sp-chapters"><a href="#one">One</a></nav>
      <p>${jsxText} {reduced ? "" : ""}</p>
      ${has("emDashShortJsx") ? '<p>{"Agency"} \u2014 {"Report"}</p>' : ""}
      ${has("noBooking") ? "" : `<iframe src="${CALENDAR}" title="Book a meeting" />`}
      <a href="${has("noBooking") ? "/contact" : "/book"}">Open booking in a new tab</a>
      <section id="study-sources"><button type="button">Download data and sources</button></section>
    </main>
  );
}
`,
  );
  w(
    "src/components/DemoStudy.css",
    `/* Colors: coral = people, blue = automated work, teal = outcomes. */
.demo-study { padding: 0; }
@media (max-width: 940px) { .demo-study { padding: 0 8px; } }
@media (prefers-reduced-motion: reduce) { .demo-study * { transition: none; } }
`,
  );

  w("research/demo.test.mjs", has("missingTest") ? `// no tests for the module\n` : `import { demoPost } from "../src/data/demoResearch.js";\n`);
  if (!has("noDesignDoc")) w("research/demo-design.md", `# Demo\n\nRoute: /blog/${SLUG}\n`);
  if (!has("noValidationDoc")) w("research/demo-validation.md", `# Validation\n\nReviewed.\n`);

  fs.mkdirSync(path.join(dir, "public/img"), { recursive: true });
  fs.writeFileSync(path.join(dir, "public/img/demo-research.png"), has("wrongImage") ? png(1200, 600) : png(1200, 630));
  w("public/img/demo-research.svg", has("badSvg") ? GOOD_SVG.replace('fill-opacity="0.2" stroke="#14120e" stroke-opacity="0.5"', 'fill="#000" opacity="0.2" opacity="0.5"') : has("bareAmp") ? GOOD_SVG.replace("P&amp;L", "P&L") : GOOD_SVG);

  // Built output for --dist checks.
  const og = has("noDistOgImage") ? "" : `<meta property="og:image" content="https://www.acadia.im/img/demo-research.png" />`;
  w("dist/blog/" + SLUG + "/index.html", `<!doctype html><html><head><title>Where Did Hiring Go? | Acadia</title><link rel="canonical" href="https://www.acadia.im/blog/${SLUG}" />${og}</head><body><div data-render="static-fallback">x</div></body></html>`);
  w("dist/sitemap.xml", `<urlset><url><loc>https://www.acadia.im/blog/${SLUG}</loc></url></urlset>`);

  return { dir, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}
