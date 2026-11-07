# Build checklist

Topic key `jobs`, component `AiJobsStudy`, data `aiJobsResearch`, slug
`ai-layoffs-2026-where-did-the-jobs-go` are used as the example. Replace them.

## 1. Data module `src/data/<topic>Research.js`

Order of exports:

1. `sources` (the ledger, see research-protocol.md § 4)
2. Datasets for each chart, each row carrying `source` or `sources` ids
3. Pure helpers (`shareOf`, `companyShare`, `displayShare`, `cumulative`,
   calculator functions) with a comment stating assumptions
4. `narrative = { thesis: [...], <chapter>: [...], conclusion: [...] }`
5. `sectionTitles` and a `paragraphs` string built from the narrative
6. The post object:

```js
export const aiJobsPost = {
  id: 81,                                   // Math.max(existing ids) + 1
  slug: "ai-layoffs-2026-where-did-the-jobs-go",
  title: "Fewer Hires. More Output. Where Did the Jobs Go?",
  excerpt: "...one or two sentences, factual...",
  author: "Stan Altshuller",
  date: "2026-10-28",                       // today's real date
  readTime: "14 min exploration",
  category: "Strategy",
  tags: ["AI", "Research", "Interactive", "Workforce"],
  image: "/img/<topic>-research.png",
  content: `${paragraphs}\n\n## ...data, methods, limits...\n\n[Book 30 minutes with Stan](/book) ...\n\n## Sources\n\n${sources.map(...).join("\n")}`,
};
```

`content` is the static, crawlable fallback that `scripts/inject-og-meta.js`
renders into `dist/blog/<slug>/index.html` with `data-render="static-fallback"`.
`src/main.jsx` mounts over it instead of hydrating. Keep it complete and readable.

## 2. Component `src/components/<Name>Study.jsx`

- Imports: data exports, `./SeatPricingStudy.css`, `./<Name>Study.css`.
- `chapters` array of `[id, title]`; ids match section ids.
- Root: `<main className="seat-study <topic>-study">`, skip link, `<Hero/>`,
  `<ChapterNav/>`, `<div className="sp-body">` with thesis, chapter sections,
  closing, booking, `<Sources/>`.
- Default export scrolls to `location.hash` or top on mount.

## 3. Stylesheet `src/components/<Name>Study.css`

Header comment with color meanings. Only prefixed classes, plus
`.<topic>-study` overrides of shared classes when needed. Responsive blocks at
1190, 940 and 680px, and a reduced-motion block.

## 4. Registration

```js
// src/data/blogPosts.js (top)
import { aiJobsPost } from './aiJobsResearch.js';
export const blogPosts = [
  aiJobsPost,
  seatPricingPost,
  ...
```

```jsx
// src/App.jsx
const AiJobsStudy = React.lazy(() => import('./components/AiJobsStudy'));
// inside <Routes>, BEFORE <Route path="/blog/:slug" ...>
<Route path="/blog/ai-layoffs-2026-where-did-the-jobs-go" element={<PageShell hideChatWidget><React.Suspense fallback={<div className="min-h-screen pt-32 text-center">Loading research…</div>}><AiJobsStudy /></React.Suspense></PageShell>} />
```

```js
// src/components/Blog.jsx — FEATURED_SLUGS[0] is the blog spotlight
const FEATURED_SLUGS = [
  'ai-layoffs-2026-where-did-the-jobs-go',
  'one-person-ten-agents-what-is-a-seat',
  ...
```

`public/llms.txt`: add one line with the title and full URL. Do not hand-edit
`public/sitemap.xml`: `npm run build` regenerates it from `blogPosts`.

## 5. Social image

`python3 assets/og-image-template.py` (edit the config block at the top), then
`node scripts/render-og.cjs public/img/<topic>-research.svg public/img/<topic>-research.png`.
Validate the SVG:

```bash
grep -o '<[^>]*opacity[^>]*opacity[^>]*>' FILE | grep -v 'fill-opacity\|stroke-opacity'
grep -o '&[^a-z#]' FILE
python3 -c "import xml.dom.minidom as m; m.parse('FILE')"
```

## 6. Tests `research/<topic>.test.mjs`

Copy `assets/test-template.mjs`. Minimum: every cited id exists; URLs are
https; series reconcile to published totals; shares match denominators;
calculator boundaries and monotonicity; slug registered once; no duplicate ids;
fallback contains `## Sources` and `/book`, no em dashes, no banned words.

## 7. Verify

```bash
npm ci
node --test research/*.test.mjs
node scripts/check-copy.mjs src/data/<topic>Research.js src/components/<Name>Study.jsx
npm run build
node scripts/check-feature.mjs --repo . --slug <slug> --dist
grep -o '<title>[^<]*</title>\|og:image" content="[^"]*"\|data-render="[^"]*"' dist/blog/<slug>/index.html
```

Start `npx vite preview --port 4173 --strictPort` with `run_in_background`,
then `node scripts/qa.cjs <slug> <W> <H> <tag> <outdir>` for 1440×1000,
390×844 and 320×780 after editing the interaction list in the script. Read
every screenshot. Stop the server with `pkill -f "[v]ite preview --port 4173"`
in a separate command.

## 8. Docs

`research/<topic>-design.md` (purpose, color meanings, page rhythm, hero,
copy rules, validation plan) and `research/<topic>-validation.md` (sources
count, reconciliations, exclusions, tests, build, QA widths, what could not be
verified).

## 9. Ship

Commit with a descriptive message and the session attribution trailer. Fetch
and merge `main`, re-run the duplicate-id check, push the working branch, and
merge to `main` only with the user's approval.
