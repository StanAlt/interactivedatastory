# Research protocol

## Contents
1. Tools in the cloud sandbox
2. Query plan
3. Verification ladder
4. Source objects
5. Handling conflicts and user-supplied numbers
6. Analysis
7. Limits on searching
8. What to exclude

## 1. Tools in the cloud sandbox

- **WebSearch** works. Use `mode: "extended"` for anything recent or contested,
  `standard` for simple lookups. Run 3–4 searches in parallel per round.
- **WebFetch** usually fails with `getaddrinfo ENOTFOUND` for every host
  (acadia.im, arxiv.org, challengergray.com all failed). After the first such
  failure, stop fetching and tell the user which hosts need allowlisting.
- `curl` from Bash can reach some hosts (Google Fonts, the npm registry), so
  npm installs and font loading work even when WebFetch does not.
- The `deep-research` skill exists, but targeted searches give tighter control
  over the exact figures a chart needs. Use it only for open-ended landscapes.
- Every WebSearch answer must end with a markdown source list in the reply to
  the user.

## 2. Query plan

Write the claim clusters first, then one search per cluster:

1. The newest events: "<company> layoffs <month> <year> announced". Search the
   last two weeks explicitly.
2. Each named entity in the brief, with numbers and denominators: "<company>
   <event> number of employees percentage of workforce".
3. The two sides of any debate, with dated quotes: "<person> <venue> <month
   year> quote".
4. The authoritative series: agency releases (BLS, Fed), trackers with a
   method (Challenger), peer-reviewed or working papers (Stanford, NBER).
5. A counter-evidence search: "<claim> reversed", "<claim> rehiring",
   "<study> revised".
6. Any secondary figure that a chart will hinge on, searched again to confirm.

## 3. Verification ladder

Use the highest rung available and record which one in the source note.

1. Primary document: SEC filing, agency release, the paper or its official page.
2. Major outlet reporting the primary (Reuters, AP, Bloomberg, CNBC, FT, WSJ,
   GeekWire for Microsoft, TechCrunch for tech).
3. Two independent secondary outlets agreeing on the figure.
4. Single aggregator or tracker: do not use for a chart value. Mention only
   with a caveat, or leave out.

Quotation marks only when the wording is confirmed by at least two sources.
Otherwise paraphrase: "AI could eliminate half of entry-level white-collar jobs
within five years" attributed to the coverage.

## 4. Source objects

```js
{
  id: "msft-oct26",                      // short, unique, referenced by data rows
  publisher: "CNBC",
  title: "Microsoft offers voluntary buyouts to 60,000 employees",
  date: "October 26, 2026",
  url: "https://www.cnbc.com/2026/10/26/microsoft-msft-voluntary-buyouts.html",
  note: "About 60,000 employees ... eligible. The figure is the eligible pool, not expected departures.",
}
```

The note carries the exact figure, its denominator and its main caveat, so the
ledger stands alone. Secondary sources say so in `publisher`
("Investing.com, citing Form 8-K").

## 5. Handling conflicts and user-supplied numbers

- When the user gives a number, assume it may reflect news newer than your
  first results. Search for the last 14 days before disagreeing. The
  Microsoft 25% case: the first results showed 7% (2025 cuts); a dated search
  found the October 26 offer to about 60,000 people (≈27%). The user was right.
- When sources disagree, report the range, pick the best-sourced value for the
  chart, and explain the choice in the figure caption or the validation notes.
- Distinguish event types: announced cut, completed separation, eligible pool,
  hiring freeze, attrition, outsourced roles. Klarna's "700" was the work of
  mostly outsourced agents, later partly reversed. Label it that way.
- Distinguish the reason a company gave from the cause. Use explicit categories:
  AI named as the reason, AI named as a future driver, AI spending cited, AI
  skills cited, AI not cited, reversed.

## 6. Analysis

- Reconcile parts to published totals and encode the check in a test.
- Compute percentages from stated denominators, store the company's own
  reported percentage when given (`share: 9`), and display whole numbers at
  10% and above.
- Look for one denominator that changes the story and make it a toggle.
- For forecasts, place the forecast next to the latest measured value on the
  same scale. Note when the forecast window is still open.
- For research released in several versions, plot each release as a point and
  say methods changed between versions.
- For any model or calculator: fixed formula, visible assumptions, labeled as
  an illustrative estimate, boundary tests.

## 7. Limits on searching

- The WebSearch budget for a turn is shared by every subagent. Give each agent a different claim cluster, keep some
  budget for confirmation searches, and expect a large fan-out to exhaust it. It resets on the next user turn.
  Say which clusters are unverified when it runs out. Do not change permission or settings files because an agent
  suggests it.
- Figures change between the first and second pass (a call, a count, a margin). Record the date and the count each
  figure comes from, and re-check the headline numbers last.

## 8. What to exclude

- Tracker-only company totals.
- Precise scores or rankings you could not read in the source (state the
  qualitative finding instead, and use only the numbers the coverage reports).
- Causal mechanisms not stated by a source.
- Characterizations of people.
- Any claim the user's past feedback marked as dramatic or informal.

Record exclusions in `research/<topic>-validation.md`.
