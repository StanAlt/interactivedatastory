---
name: interactive-blog
description: End-to-end production of Acadia "Interactive Blog" features: research-grade, data-driven articles with their own route, an animated data hero or a scrolling dot-map story, sticky chapter navigation, clickable charts, a source ledger and an embedded booking calendar, in the style of acadia.im/blog/one-person-ten-agents-what-is-a-seat, /blog/ai-layoffs-2026-where-did-the-jobs-go and /blog/2026-midterms-blue-wave-exit-polls. Use this skill whenever the user asks for an interactive blog, interactive article, interactive research, a data story, a scrollytelling or New York Times style map story, a feature "like the agents post" or "like the AI jobs post", a blog post with charts, visualizations or clickable graphics, or says "deep research and turn it into a post". Also use it to upgrade an existing Acadia post into an interactive feature. Covers research and verification, narrative, visualization design, React build, social image, tests, browser QA and shipping.
---

# Interactive Blog

An Interactive Blog is not a blog post with a chart pasted in. It is a standalone
research feature: its own React route, its own data module with a source ledger,
a question-led hero built from real data, 5–7 chapters that alternate reading
columns with full-width interactive figures, and a closing booking section.
Three reference implementations live in the AcadiaIM repo and are the canon:

- `src/components/SeatPricingStudy.jsx` + `src/data/seatPricingResearch.js` (agents and seat pricing)
- `src/components/AiJobsStudy.jsx` + `src/data/aiJobsResearch.js` (AI and the 2026 layoffs)
- `src/components/MidtermStudy.jsx` + `src/data/midtermResearch.js` (the 2026 midterms, a scrolling dot-map story)

Copies are bundled in `assets/` in case the repo is not available. Read the one
closest to the new topic before writing code; copy its structure and change the
middle. For a story about many units (seats, accounts, branches) where a dot per
unit shows the pattern, read `references/scrollytelling.md` first.

This skill is built for the Acadia site (React and Vite, `SeatPricingStudy.css`
as the shared stylesheet, the booking calendar, Stan's copy rules). To use it for
another site, follow the "Rebrand checklist" section of the repository README.

The phases below run in order. Each has a reference file with the detail. Do not
skip research verification or browser QA: both caught real errors in past runs.

---

## Phase 1 · Brief

Pin down, in writing, before researching:

1. **The question.** One sentence the feature answers. It becomes the hero.
   Agents: "What is a seat?" Jobs: "Where did the jobs go?"
2. **The two or three things the reader can explore.** Each becomes a chapter
   with an interactive figure. If the user named a specific visual (for example
   "companies laying off; click to see the number and the percentage of
   workforce"), it is mandatory and gets its own chapter.
3. **The close.** The closing question the user wants to leave the reader with,
   and the Acadia connection (usually: AI made content production cheap, so
   publish weekly, and book time with Stan).
4. **Slug, title, date.** Use today's real date. Title is short and question-led
   ("Fewer Hires. More Output. Where Did the Jobs Go?"). Get the next free post
   id from the data, never by guessing (`Math.max(...ids) + 1`).

## Phase 2 · Deep research

Read `references/research-protocol.md`. In brief:

- Search with WebSearch in `extended` mode, several queries in parallel, one per
  claim cluster (each company, each forecaster, each data series).
- WebFetch is usually blocked in the cloud sandbox (DNS fails for most hosts,
  including acadia.im). Do not retry other hosts once one fails that way. Rely
  on search, and say which hosts would need allowlisting.
- **Search for the latest event first, not just the famous one.** The user's
  number may come from news days old. ("Microsoft is 25%" was right: a
  60,000-person buyout offer two days earlier. The 2025 rounds were 7%.) Never
  "correct" the user until a dated search for the last 14 days comes back empty.
- Every number gets a source object (publisher, title, date, URL, note with the
  exact figure, its caveat and the verification rung: primary document, major
  outlet reporting the primary, or two independent outlets; the ladder is in
  `references/research-protocol.md` § 3). Prefer primary (filings, agency
  releases, the paper itself) over trackers. Exclude tracker-only figures.
- Record the denominator for every percentage, and whether a count is an
  announcement, an eligible pool or a completed change.
- Quotes: use quotation marks only for wording two sources agree on. Otherwise
  paraphrase and attribute.

## Phase 3 · Analysis

Read `references/research-protocol.md` § Analysis. Before designing anything:

- **Reconcile series.** Check that parts sum to published totals (Challenger:
  3,900 + 13,089 + 54,836 = 71,825, the published cumulative). Write it as a test.
- **Compute shares from stated denominators**, but display the company's own
  reported percentage when it gives one. Whole numbers at 10% and above, one
  decimal below.
- **Find the denominator traps** and make one of them interactive (Amazon:
  8.6% of corporate staff, 1.9% of the whole company).
- **Separate what the evidence establishes from what it does not.** Each
  chapter ends with a takeaway ("What this establishes", "Try this") or a
  counterpoint box ("Keep two numbers separate").
- Label every model as a model, show its formula, and state its assumptions.

## Phase 4 · Narrative and copy

Read `references/copy-rules.md`. Stan's standard, learned from direct feedback:

- Educational, not dramatic. Relay the needed information and stop.
- Cut informal flourishes and characterizations ("He was not a random doomer.
  He runs one of the labs building the thing." was cut entirely).
- Banned words and frames: quietly, honest/honestly, the truth is, the reality
  is, make no mistake, "it's not X, it's Y", staccato stacks of short sentences,
  em dashes, more than one "actually".
- Plain, specific section titles ("Two opposing camps.", "Who is cutting, and
  how deep."). No cleverness in headings.
- No sentence goes beyond its source. If a mechanism is not in a source
  ("because remote teams hire fewer juniors"), cut it.
- Run the `humanizer` pass on all prose, then run `node scripts/check-copy.mjs`
  on the research module and the component. It checks the banned list, em
  dashes, "it's not X, it's Y" frames, three short sentences in a row and the
  one-"actually" limit. Fix every error; warnings are filler words and UI captions.

Narrative lives in the data module as `narrative = { section: [paragraphs] }`
so the same text feeds the page and the static SEO fallback.

## Phase 5 · Visualization design

Read `references/design-system.md` (tokens, type, color semantics, layout,
class catalog) and `references/chart-patterns.md` (copy-ready components).

- **Color has one meaning each, everywhere in the feature.** Write the legend
  in the design notes before drawing. Jobs feature: coral = jobs affected or
  gap; blue = AI and AI spending; teal = measured outcomes; ink = neutral.
  Agents feature: coral = people or seats; blue = automated work; teal =
  outcomes.
- **Hero:** a subject-specific SVG that animates through real data or a clear
  concept (the ladder whose entry rung shrinks 0 → 19%; the chair surrounded by
  1–12 agents). It autoplays, stops permanently on any interaction, pauses
  offscreen and in background tabs, and is static under reduced motion. Never a
  generic stat-card hero.
- **One distinct interactive per chapter**, chosen from the pattern catalog:
  switchable card board, forecast-versus-measured scale, horizontal bars,
  sortable atlas with a detail panel and 100-square waffle, vertical bars with a
  per-year/cumulative toggle, annotated line chart, explorer grid with an answer
  panel, calculator with sliders. Plus "Read the chart values" tables.
- **Many-unit stories** (a dot per seat, account or branch) use the scrolling
  stage in `references/scrollytelling.md`: a sticky dark map with step cards,
  zooms, a unit chart of one dot per percent, trail charts for before and
  after, and arrows for regional shifts. Color a dot only by a fact you have sourced.
- **Legibility floors:** chart labels ≥ 13px, key numbers 28–58px, hero SVG
  text 14–26 units on a 600-wide viewBox. The previous AI-jobs hero failed on
  tiny text; never repeat it.

## Phase 6 · Build

Follow `references/build-checklist.md`. Files for slug `X` / name `Study`:

1. `src/data/<topic>Research.js`: sources, datasets, helper functions,
   `narrative`, and a `<topic>Post` object whose `content` is a readable
   markdown fallback (narrative + data + methods + limits + booking link + sources).
2. `src/components/<Name>Study.jsx`: root `<main className="seat-study <topic>-study">`,
   imports `./SeatPricingStudy.css` then `./<Name>Study.css`.
3. `src/components/<Name>Study.css`: only new `xx-` prefixed classes.
4. Register: import the post object at the top of `src/data/blogPosts.js` and
   add it first in the array; lazy route in `src/App.jsx` **before**
   `/blog/:slug`; add the slug to `FEATURED_SLUGS` in `src/components/Blog.jsx`
   (first position makes it the blog spotlight; confirm with the user);
   add a line to `public/llms.txt`. The sitemap regenerates on build.
5. Booking section: copy it verbatim from the reference (same Google Calendar
   schedule URL, `/book` fallback link).

## Phase 7 · Social image

`assets/og-image-template.py` builds a 1200 × 630 SVG: the Acadia logo group
(vector, from `public/img/seat-pricing-research.svg`), a 70–77px Archivo
headline in 3–4 lines, a simplified version of the hero graphic, one large
accent number, and a bottom rule with the headline statistic and acadia.im.
Validate per CLAUDE.md (no duplicate attributes, no bare `&`), then render the
PNG with `scripts/render-og.cjs` (real Archivo via Google Fonts). Look at the
PNG before using it.

## Phase 8 · Test and QA

1. `npm ci` (deps are not preinstalled; the registry is reachable).
2. Data tests: `research/<topic>.test.mjs`, modeled on `assets/test-template.mjs`:
   source integrity, reconciliation, shares, model boundaries, route registered
   once, no duplicate ids, fallback has no em dashes or banned words.
   `node --test research/*.test.mjs`.
3. `npm run build`; confirm the route's static fallback has the right title,
   canonical and og:image, and the feature is its own chunk.
4. Browser QA with `scripts/qa.cjs` (Playwright with
   `executablePath: '/opt/pw-browsers/chromium'`; never `playwright install`):
   serve with `npx vite preview --port 4173` as a background task, dismiss the
   cookie banner, exercise every control, screenshot each figure at 1440 × 1000,
   390 × 844 and 320 × 780, and assert zero console errors and zero horizontal
   overflow. Read every screenshot. Fix and repeat.
   Known traps: template rule `.sp-company-detail > p:not(.sp-detail-price)`
   forces 13px on detail-panel paragraphs (raise specificity); segment groups
   with long labels wrap (shorten labels); SVG labels at the top or right edge
   clip (add padding); `:hover` sticks on touch (wrap in `@media (hover: hover)`);
   never `pkill -f "vite preview"` in the same command that starts it.
5. Probe states, not only pixels. After each interaction, assert the style that
   carries the meaning (a flipped state keeps its amber outline when selected;
   a selected style never replaces a status style). Screenshot review missed this
   once and a reader found it. `scripts/probe-status-outlines.cjs` is the pattern.
6. Run `node scripts/check-feature.mjs --repo . --slug <slug> --dist`. It checks
   the post fields, registration, route order, booking embed, social image size,
   source ledger, fallback and tests. Fix every FAIL before shipping.
7. Write `research/<topic>-design.md` and `research/<topic>-validation.md`.

## Phase 9 · Ship

Per CLAUDE.md: `git fetch origin main && git merge origin/main`, resolve, push
the working branch. Check for duplicate post ids after every merge (scheduled
posts land on main independently). Merge to `main` only when the user approves,
then confirm the commit is on `origin/main`. Tell the user what was verified, what
could not be (for example the calendar embed in the sandbox), and any figure they
supplied that the research changed.

## Bundled files

| File | Use |
|---|---|
| `references/research-protocol.md` | Search plan, verification ladder, source objects, conflicts, analysis, exclusions |
| `references/copy-rules.md` | Banned words and frames, before/after examples from Stan's feedback, chapter text structure |
| `references/design-system.md` | Tokens, type scale, color semantics, layout rhythm, shared class catalog, motion, responsive |
| `references/chart-patterns.md` | Hero and chapter interaction patterns with data shapes and component names |
| `references/build-checklist.md` | File-by-file build, registration snippets, verify and ship commands |
| `references/scrollytelling.md` | Scrolling dot-map stories: sticky stage, unit chart, trail chart, shift map, QA and research limits |
| `assets/reference-feature.jsx`, `reference-data.js`, `charts.css` | The AI jobs feature (October 2026) |
| `assets/reference-seat-feature.jsx`, `reference-seat-data.js`, `base.css` | The agents feature and the shared stylesheet |
| `assets/reference-scrolly-feature.jsx`, `reference-scrolly-data.js`, `reference-scrolly-layout.js`, `scrolly.css` | The midterms scrolling map feature (November 2026) |
| `assets/og-image-template.py`, `acadia-logo-group.svg` | Social image generator and vector logo |
| `assets/test-template.mjs` | Data test template |
| `scripts/render-og.cjs`, `scripts/qa.cjs`, `scripts/validate-svg.sh` | PNG rendering, browser QA, SVG validation |
| `scripts/check-copy.mjs` | Copy-rules linter for prose, source files and the fallback |
| `scripts/check-feature.mjs` | Build-checklist checker for a finished feature |
| `scripts/qa-scrolly.cjs`, `scripts/probe-status-outlines.cjs`, `scripts/build-geo.cjs` | Scroll-story QA, status-style probe, state geometry generator |

## Delivery summary checklist

- Chapters and interactions built
- Corrections to user-supplied facts, with sources
- Figures excluded as unverifiable
- Tests, build and QA results at three widths
- Branch, PR or merge status, and any files awaiting deletion approval
