# Results

Measured on 2026-11-07 with Claude Code 2.1.319 and `claude plugin eval`, skill version 1.0.0. Each assertion is judged by an
LLM judge (a small model, three votes, majority wins) that reads the full trace.

## Behavior cases: with the skill and without it

Score is the share of a case's assertions that passed, averaged over two runs per arm. "Without" is the same prompt with the
plugin not loaded.

| Case | With the skill | Without | Change |
|---|---|---|---|
| `brief-and-plan-from-a-vague-request` | 0.89 | 0.39 | +0.50 |
| `copy-pass-removes-banned-patterns` | 1.00 | 0.50 | +0.50 |
| `blocked-fetch-and-stale-number` | 1.00 | 0.21 | +0.79 |
| `scrolling-map-plan-colors-only-sourced-facts` | 0.88 | 0.38 | +0.50 |
| `ship-without-merging-to-main` | 0.86 | 0.29 | +0.57 |
| `social-image-follows-svg-rules` | 0.93 | 0.57 | +0.36 |
| **Mean of six cases** | **0.92** | **0.39** | **+0.54** |

The skill was loaded (the `Skill` tool was called) in all with-skill runs. It cannot be loaded in the without arm.

Cross-checks that do not depend on the judge:

- **Copy pass:** the with-skill outputs pass `scripts/check-copy.mjs` and keep every number in 2 of 2 runs. The without-skill outputs fail the linter in 2 of 2 runs.
- **Social image:** every image is valid XML at 1200 x 630. The without-skill images have no Acadia logo, no kicker and no acadia.im, and their headlines are set under 70 px. The with-skill images include the kicker and URL in 2 of 2 runs and the logo group in 1 of 2.

## What the evals found, and what changed

1. **The first attempt measured nothing.** The prompts said "Don't run anything", so the model never loaded the skill and both arms scored the same. The prompts now ask for the skill and hold back only searches and commands.
2. **The second attempt errored on every run.** Granting shell tools needs a sandbox backend (`bubblewrap`, `socat`), which the machine lacked, and the CLI refused to run unconfined. Installing them fixed it.
3. **First valid run (one run per arm, mean +0.44).** Reading the answers found one real gap in `SKILL.md`: the verification rung (primary document, major outlet reporting the primary, two independent outlets) lived only in a reference file, so an agent that read only `SKILL.md` left it out. Phase 2 now says to record it in each source note. Several assertions were also worded as completed actions for answers that are plans, and one case name used a word the skill bans in blog prose. Both were fixed.
4. **Second run (two runs per arm, mean +0.49).** Two assertions were still brittle. One bundled the verification rung with an unrelated clause about tracker-only figures, so it is now two assertions. Two shipping assertions required specific examples and a trailer format that only exists in one environment, so they were loosened to what the skill requires.
5. **The two affected cases were re-run** and the table above takes each case from its last run. The skill text did not change after step 3.

Assertion wording changed after results were seen in steps 3 and 4. Each change made the wording match what the skill requires, not what one answer said. With two runs per arm and a judge model, a difference of one run on a single assertion is noise.

## Weak spots that are still open

The with-skill arm did not pass these in every run. For each, the answer was read to find the cause.

| Case | Assertion | With | Without | Cause |
|---|---|---|---|---|
| brief | `02-chapters-with-distinct-interactives` | 1 of 2 | 1 of 2 | One brief used a line chart in two chapters. Noisy for both arms |
| brief | `07-denominators` | 1 of 2 | 0 of 2 | One plan mentions a "denominator trap" for a single chapter but never says every percentage gets a denominator |
| scrolling map | `03-discloses-unlocated-branches` | 1 of 2 | 2 of 2 | One plan puts the disclosure in the legend and step text, but its "methodology" mention is about the data source |
| scrolling map | `08-names-baselines` | 1 of 2 | 0 of 2 | One plan never mentions baselines |
| shipping | `06-summary-lists-changes-and-exclusions` | 1 of 2 | 0 of 2 | One message puts both items in a single bracketed line where the assertion asks for two |
| shipping | `07-commit-has-attribution-trailer` | 1 of 2 | 1 of 2 | The judge's verdict on the same kind of trailer differs between runs, in both arms |
| social image | `05-logo-kicker-and-url` | 1 of 2 | 0 of 2 | One run drew its own SVG and left out the logo group (confirmed by a script) |

## Assertions that do not tell the arms apart

Both arms pass or fail these at the same rate: `brief` 01, 04 and 09; `copy-pass` 03, 05, 06 and 07; `blocked-fetch` 06;
`scrolling map` 01 and 02; `shipping` 04 and 07; `social image` 01, 02, 03 and 06. They stay as guard rails (a skill should not
make a model worse at these) but they do not show the skill's effect. Replace them with harder variants if you want a sharper
signal.

## Trigger accuracy

Measured on 2026-11-07 with `evals/run-trigger.py` and Claude Code 2.1.319: the 20 requests in
`evals/trigger-queries.json`, three runs each. A query counts as triggered when at least two of its three runs load the skill. The runs used
a home folder that had the maintainer's other skills installed (a scheduled blog post skill, a LinkedIn carousel builder, a deck builder and
others) but not this one, so the near misses compete with real neighbors.

| | Queries | Passed | Runs that loaded the skill |
|---|---|---|---|
| Should trigger | 10 | 10 | 30 of 30 |
| Should not trigger | 10 | 10 | 0 of 30 |

No run errored.

Read it with these limits in mind:

- The queries and the description were written by the same person and none was held out. The result says the description does not misfire on
  the neighbors it was written against and is picked up on varied phrasings. It is not a general trigger rate.
- skill-creator's `scripts.run_eval`, given the same queries and the same description on the same day (three workers, two runs per query), passed
  7 of 10 positive queries (7 of 20 runs) and 10 of 10 near misses (0 of 20 runs triggered).
  That runner counts a trigger only when the Skill call is the first tool call, and it runs every query in one folder, so parallel runs see each
  other's identical commands. It undercounts, which is why this repository has its own runner (`evals/README.md`, layer 4).
- The temporary command is named after the skill, as the installed skill is, so a request that says "interactive blog" gets help from the name.
  The positives that do not say it ("a blog post with a calculator in it, sliders for assumptions", "deep research and turn it into a post") also
  loaded the skill in every run.
- A different set of installed skills can change the result. Run `npm run eval:trigger` with your own `HOME` before relying on it.

## Other checks

- **Unit tests:** 81 pass in about six seconds, also from a fresh clone. They include the trigger runner, tested against a fake `claude`.
- **Golden regression:** all five shipped features pass the feature checker's 40 checks on the built output (see `GOLDEN.md`, which also records what the first run found and how it was fixed).
- **Install:** both routes were tested in a throwaway home folder. The skill appears as `interactive-blog:interactive-blog`.
- **Plugin validation:** `claude plugin validate .` passes. Its only warning is that there is no icon.

## Cost

About $8.60 across seven CLI runs, including the two aborted ones. A full six-case run with two runs per arm costs about $4.70
and takes about 11 minutes.
The trigger runs are not included. One model call costs about $0.06 on a machine with many skills installed, and a triggered run
stops after its first turn, so start with `--runs-per-query 1`.
