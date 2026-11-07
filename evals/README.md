# Evals

Five layers, from fast and exact to slow and realistic. Run the first two on every change; run the others when you change a
rule in `SKILL.md` or a reference.

| Layer | What it checks | Command | Cost |
|---|---|---|---|
| 1. Unit tests | The skill's files, scripts, linter, feature checker and these eval files | `npm test` | none |
| 2. Golden regression | The feature checker on five shipped features matches the recorded results (maintainers only: needs the Acadia site checkout) | `npm run eval:golden -- --repo <AcadiaIM checkout> --dist` | none |
| 3. Behavior cases | Claude behaves as the skill says, with and without the skill | `claude plugin eval . --no-publish --scaffold --allow-tools Write,Edit,Bash` | model runs |
| 4. Trigger queries | The description makes Claude use the skill for the right requests and not for near misses | `npm run eval:trigger` | model runs |
| 5. End-to-end build | A full feature built in a scratch copy of the site passes the feature checker | see below | a full session |

## 2. Golden regression

`golden-features.json` lists the shipped features and the checks each is known to fail. `run-golden.mjs` runs
`skills/interactive-blog/scripts/check-feature.mjs` on them and exits 1 for a regression (a new failure) or an unrecorded improvement (a listed
failure that is gone, so the file should be updated). `GOLDEN.md` explains each recorded finding.
The five features live in the Acadia site repository, so this layer is for the maintainers. Everyone else can rely on the unit tests,
which run the same checker on generated sites with 24 injected faults.

## 3. Behavior cases

Each folder under `evals/` is one case in the layout `claude plugin eval` reads (Claude Code 2.1.269 or later):

```text
evals/<case-name>/
  prompt.md      settings block, then the prompt as the user would type it
  case.yaml      schema_version, name, expected_outcome (and the scaffold script when there are input files)
  graders/NN-*.md   one verifiable statement each, scored by an LLM judge that sees the trace
  files/         input files, copied into the run by place-files.sh
```

| Case | What it checks |
|---|---|
| `brief-and-plan-from-a-vague-request` | Phase 1 and 2: a question-led brief, distinct interactives, next post id computed from data (87), newest events searched first, denominators, blocked-fetch plan, nothing built |
| `copy-pass-removes-banned-patterns` | Phase 4: em dashes, banned words, dramatic reframes, staccato runs and a second "actually" removed; numbers and facts preserved; nothing added |
| `blocked-fetch-and-stale-number` | Phase 2: stops fetching after a DNS failure, names hosts, searches the last 14 days before correcting the user, records event types and denominators |
| `ship-without-merging-to-main` | Phase 9: fetch and merge main, duplicate-id check, push the branch only, wait for approval to merge, a summary that says what was and was not verified |
| `social-image-follows-svg-rules` | Phase 7: a valid 1200 x 630 SVG from the template, no duplicate attributes or bare ampersands, large legible text |
| `scrolling-map-plan-colors-only-sourced-facts` | Scrollytelling: sticky stage, dots colored only by sourced facts, unlocated units disclosed, phone layout, status survives selection, QA that probes styles |

Run one case: `claude plugin eval . --case copy-pass-removes-banned-patterns --runs 1 --no-publish --scaffold --allow-tools Write,Edit,Bash`.
Always pass `--no-publish`, otherwise the report is published to claude.ai when your account supports it. These are real
model runs, so use `--runs 1` while iterating and `--max-cost-usd` as a ceiling. `--ablation with-without` is the default:
every case also runs without the skill, so the score difference is the skill's effect.

Read the results for assertions that pass both with and without the skill. They do not discriminate, so tighten or drop them.

### Adding a case

1. Make `evals/<name>/` with lowercase letters, digits and hyphens. Do not use `results`, `mocks`, `node_modules`, `files`, `true`, `false` or `null`.
2. `prompt.md`: a settings block with only `tags`, `max_turns`, `timeout_seconds`, `allowed_tools`, then the prompt in the user's words. Name the skill. If you add input files, end the prompt with `Input files: a.txt, b.csv`.
3. `case.yaml`: `schema_version: "1.1"` (quoted), `name` equal to the folder, `expected_outcome`. For input files add `context:` and `scaffold_script: place-files.sh`.
4. `graders/01-few-words.md` onward: `type: llm`, `focus: trace`, `weight: 1`, then one statement about the result.
5. Run `npm test`. `tests/evals.test.mjs` checks all of the above.

## 4. Trigger queries

`trigger-queries.json` has 20 realistic requests: 10 that should trigger the skill and 10 near misses (a plain scheduled blog post,
a LinkedIn carousel, a one-off chart, a typo fix, a deck, a dashboard). `run-trigger.py` registers the description from `SKILL.md` as a
temporary project command, runs `claude -p` on each request, and counts a run as triggered when Claude calls the Skill tool for it
within the first three turns.

```bash
npm run eval:trigger -- --runs-per-query 3 --num-workers 3
```

Output is JSON on stdout (a summary, then one row per query) and progress on stderr. Each run is a short real model call and stops
as soon as the Skill call appears. Three details decide whether the number can be trusted:

- **Other skills compete.** Set `HOME` to a folder that holds only the skills you want as competition, otherwise your own installed
  skills change the result. The numbers in `RESULTS.md` were measured with the maintainer's other skills installed and this one not.
- **The Skill call can come late.** The runner counts it anywhere in the first turns. skill-creator's `scripts.run_eval` counts it only
  as the very first tool call, so a model that searches for tools first scores as a miss. It also runs parallel queries in one folder, where the
  models see several identical commands under different names and only one name counts. `run-trigger.py` gives every run its own folder.
- **A silent run is an error, not a miss.** A run that prints no model output (not logged in, rate limited) is reported and left out
  of the rate. If every run fails the script exits 3.

`tests/trigger-runner.test.mjs` tests the runner against a fake `claude`, so the tests need no model. skill-creator's `scripts.run_loop`
can use the same query file to improve the description; check its result with this runner before you accept it.

## 5. End-to-end build

Ask Claude to build a feature with the skill in a scratch branch of the site. When it finishes, run

```bash
node skills/interactive-blog/scripts/check-feature.mjs --repo <site> --slug <slug> --dist
node skills/interactive-blog/scripts/check-copy.mjs <site>/src/data/<topic>Research.js <site>/src/components/<Name>Study.jsx
```

Every FAIL is a defect in the build or a gap in the skill.
