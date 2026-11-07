# Golden regression

`scripts/check-feature.mjs` turns the build checklist into 40 checks (post fields, registration, route order, booking embed,
social image size, source ledger, crawlable fallback, copy rules, tests, docs, built output). This file records what it finds
on the five features shipped on acadia.im, so a change to the checker or to a feature shows up as a difference.

Recorded 2026-11-07 against AcadiaIM commit `d94bddf`, with `--dist` after `npm run build`:

| Feature | Passed | Known findings |
|---|---|---|
| 2026 midterms (scrolling map) | 40 of 40 | none |
| AI bust and market crashes | 40 of 40 | none |
| AI benchmarks | 40 of 40 | none |
| AI layoffs | 40 of 40 | none |
| Agents and seat pricing | 40 of 40 | none |

## What the first recording found

The first recording, against AcadiaIM `55f07b5`, found gaps in two features. Both are fixed in `d94bddf`, and the copies in
`skills/interactive-blog/assets/` were refreshed from the fixed files so a new feature does not start from the old mistakes.

| Feature | Passed then | Findings |
|---|---|---|
| AI layoffs | 39 of 40 | `research-copy`: three short sentences stacked in a source note |
| Agents and seat pricing | 35 of 40 | `llms-entry`: no line in `public/llms.txt`. `fallback-booking`: the crawlable fallback had no `/book` link. `fallback-copy`: 19 em dashes (one per source in the source list) and two stacked runs of short sentences. `research-copy`: one of those runs, in the simulator's price assumptions. Warning `css-legend`: the stylesheet did not open with a color legend |

None of the five was linted when it was built, because the linter came afterwards. The findings were copy and checklist gaps, and none
changed how a page works.

Reading the fixed seat-pricing page by hand then turned up three more em dashes in its own text: the source ledger, a
screen-reader separator and an empty-cell marker. The checker had missed them because it read only JSX text of 15 characters or more.
It now flags an em dash in any JSX text node, including `&mdash;`. `tests/copy-rules.test.mjs` and the `emDashShortJsx` fault in
`tests/feature-checker.test.mjs` cover that, and `tests/reference-data.test.mjs` lints the bundled reference features.

Run it yourself:

```bash
cd <AcadiaIM checkout> && npm run build && cd -
npm run eval:golden -- --repo <AcadiaIM checkout> --dist
```

It exits 1 for a regression (a new failure) and for an improvement that is not recorded yet. When a known finding is fixed, remove it from
`golden-features.json` and from the first table above.
