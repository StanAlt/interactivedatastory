# Interactive Blog skill

A skill for Claude Code that produces **research-grade interactive blog features**: a standalone page with its own route,
a data module with a source ledger, an animated hero or a scrolling dot-map story, 5 to 7 chapters with clickable charts,
a crawlable fallback for search engines, a social image, tests, browser QA and a booking section. It was built at
[Acadia](https://www.acadia.im) and encodes how those pages are researched, written, designed, checked and shipped.

Live examples from the site it was built for:

- [One Person, Ten Agents: what is a seat?](https://www.acadia.im/blog/one-person-ten-agents-what-is-a-seat)
- [Where did the jobs go? AI and the 2026 layoffs](https://www.acadia.im/blog/ai-layoffs-2026-where-did-the-jobs-go)
- [Why was 2026 a blue tsunami?](https://www.acadia.im/blog/2026-midterms-blue-wave-exit-polls) (a scrolling map story)

## What the skill does

Nine phases, in order. `SKILL.md` has the detail and points at a reference file for each.

| Phase | What happens | Reference |
|---|---|---|
| 1 Brief | One question, the chapters and their interactives, the close, slug, title, date, next post id | |
| 2 Deep research | Search plan, newest events first, source objects with denominators, handling of blocked fetches | `references/research-protocol.md` |
| 3 Analysis | Reconcile totals, find denominator traps, separate what the evidence does and does not show | `references/research-protocol.md` |
| 4 Narrative | Educational copy rules, banned frames, linted by `scripts/check-copy.mjs` | `references/copy-rules.md` |
| 5 Visualization | Color semantics, hero, one interactive per chapter, scrolling dot-map stories | `references/design-system.md`, `chart-patterns.md`, `scrollytelling.md` |
| 6 Build | Data module, component, stylesheet, route, featured slot, `llms.txt` | `references/build-checklist.md` |
| 7 Social image | 1200 x 630 SVG and PNG | `assets/og-image-template.py` |
| 8 Test and QA | Data tests, build, browser QA at 1440, 390 and 320 px, `scripts/check-feature.mjs` | `scripts/` |
| 9 Ship | Merge `main` into the branch, check duplicate ids, push the branch, merge only with approval | |

## Install

You need Claude Code. The skill is written for a checkout of the Acadia site (React and Vite); see the
[rebrand checklist](#rebrand-checklist) to use it on another site.

**Option 1: clone it into your skills folder** (simplest, and `git pull` updates it)

```bash
git clone https://github.com/StanAlt/interactivedatastory ~/.claude/skills/interactive-blog
```

Restart Claude Code, or run `/reload-plugins`. To install it for one project only, clone into
`<project>/.claude/skills/interactive-blog` instead. Claude Code loads the folder as a plugin and the skill is named
`interactive-blog:interactive-blog`.

**Option 2: as a plugin from this repository's marketplace**

```text
/plugin marketplace add StanAlt/interactivedatastory
/plugin install interactive-blog@acadia-skills
```

Both routes give you the same skill. Updates arrive with `/plugin marketplace update acadia-skills`.

Both options use `git`, so it must be installed on your machine. The repository is public and needs no invitation.

## Use it

Ask for what you want in plain words. The skill triggers on requests like these:

- "Use the interactive blog skill to make an interactive data story on why mortgage rates stayed high in 2026."
- "Make a scrollytelling map story, one dot per branch, with zoom steps."
- "Upgrade the alternative-data post into one of the interactive features."
- "Deep research, then turn it into a post with charts people can click through."

You get the research with a source ledger, the page, tests, a social image, design and validation notes, and a summary
that lists corrected figures, exclusions and what could not be verified.

## What is inside

```text
skills/interactive-blog/      the skill (paths in this README's table are relative to this folder)
  SKILL.md                    nine phases, bundled-file table, delivery checklist
  references/                 research protocol, copy rules, design system, chart patterns, scrollytelling, build checklist
  assets/                     three complete reference features, shared CSS, social image template, test template
  scripts/                    check-copy, check-feature, validate-svg, render-og, qa, qa-scrolly, probe-status-outlines, build-geo
tests/                        unit tests for everything above (npm test)
evals/                        behavior evals, trigger queries, golden regression (see evals/README.md)
.claude-plugin/               plugin and marketplace manifests
```

## Rebrand checklist

The skill assumes the Acadia site and Stan's editorial standard. To use it for another company, change:

1. **Voice:** `references/copy-rules.md` and Phase 4 of `SKILL.md` (inside `skills/interactive-blog/`) (the banned words and the before/after table).
2. **Brand assets:** replace `assets/acadia-logo-group.svg` and the name, URL and kicker in `assets/og-image-template.py`.
   The Acadia logo is not licensed for reuse (see `NOTICE.md`).
3. **Booking section:** the Google Calendar link and `/book` page in the reference components and `references/build-checklist.md`.
4. **Design tokens:** the `--sp-*` variables and `.seat-study` scope in `assets/base.css`; the `sp-` classes in the references.
5. **Site conventions:** the `paths` and `SITE` constants at the top of `scripts/check-feature.mjs`
   (data module folder, route file, featured list, `llms.txt`, research folder, base URL).
6. **Examples:** the reference features and the article text inside them.
7. **Manifests:** name, author and repository in `.claude-plugin/plugin.json` and `marketplace.json`.

## Tests

```bash
npm test
```

It needs Node 22 or later and Python 3 and nothing else. About 80 tests run in a few seconds and cover:

- the skill itself: frontmatter, description length, nine phases in order, every referenced file exists, every file is described
- the scripts: syntax, usage messages, `validate-svg.sh` on good and bad SVGs, the social image generator end to end
- the copy linter: each rule on bad and good samples, JSX and string extraction, the command line exit codes
- the feature checker: a generated site passes all 40 checks, and each of 24 injected faults fails exactly the right checks
- the bundled reference features: source ledgers and citations resolve, the fallback links to /book, and each feature passes the copy linter
- the eval files: case layout, trigger set balance, golden runner behavior
- the trigger eval runner: stream parsing, trigger detection and the whole run loop, tested against a fake `claude` so no model is called
- hygiene: no credentials, session links or local paths in any file (commit messages are not checked)

## Evals

Tests check that the pieces work. Evals check that the skill changes what Claude does. See
[`evals/README.md`](evals/README.md) for the five layers and how to run them, and
[`evals/RESULTS.md`](evals/RESULTS.md) for the latest numbers.

```bash
npm run eval:golden -- --repo <AcadiaIM checkout> --dist   # maintainers only: needs the Acadia site checkout
npm run eval:trigger -- --runs-per-query 3         # twenty requests: does the description make Claude load the skill?
claude plugin eval . --no-publish --scaffold --allow-tools Write,Edit,Bash   # six behavior cases, with and without the skill
```

## Contributing

Open an issue or pull request. Run `npm test` first; CI runs it on every push. If you change a rule in the skill, add or
update a test or an eval case that would have caught the old behavior. `evals/README.md` explains how to add a case.

## License

MIT for the code, scripts, tests, evals and documentation. The Acadia name, logo and article text are not covered; see
[`NOTICE.md`](NOTICE.md).
