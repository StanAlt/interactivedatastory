# Copy rules

Voice: Stan Altshuller, operator to operator. Educational, specific, sourced.
The reader should learn something from every sentence. Nothing is there to
create drama, personality or suspense.

## Banned

- Words: quietly, honest, honestly, the truth is, the reality is, make no
  mistake, let's be clear, here's the thing, game-changing, transformative,
  incredibly, remarkably, doomer, bloodbath (except inside a cited title),
  "actually" more than once in the whole feature.
- Frames: "It's not X, it's Y"; "This isn't about X"; "X? No. Y."; rhetorical
  setups; "Let that sink in".
- Punctuation: em dashes in prose. Use a period, comma or colon. (A middle dot
  `·` is fine in UI labels and the source list.) Em dashes also hide in text that
  is not prose: the separator in the source ledger, link labels, screen-reader
  text and empty-cell markers. Use `·`, a colon or an en dash `–` there.
- Staccato: three or more consecutive sentences under eight words.
- Characterizations and asides about people.
- Mechanisms or motives not stated by a source.

## Before and after (from Stan's feedback)

| Before | After |
|---|---|
| "Two Camps, Both Confident" | "Two opposing camps." |
| "He warned that AI could eliminate up to half ... He was not a random doomer. He runs one of the labs building the thing." | Keep only the claim, date and source; delete the last two sentences. |
| "...quietly pointed at the same culprit" | "...referred to artificial intelligence when they explained why." |
| "The honest version of most of these announcements..." | "Some name AI as the reason. Some cite AI spending..." |
| "because remote teams hire and train fewer junior staff" | Cut: not in the source. |
| "Experienced employees kept their jobs at normal rates." | "Employment of experienced workers in the same occupations remained stable." |
| "4 per month supports at least one every week" | Weekly needs 5 per month (52 ÷ 12 = 4.33). Check arithmetic in copy. |

## Structure of each chapter's text

- Section label: what kind of evidence ("Company announcements", "Payroll
  evidence").
- H2: a plain statement of the finding ("The effect is concentrated at the
  entry level.").
- Two or three prose paragraphs: what the data is, what it shows, its limit.
- Figure caption: definitions, period, denominator, what the figure does not
  show, then `Source:` links.
- Takeaway: "What this establishes" or "Try this" with a concrete instruction
  ("Switch to the cumulative view. ...").

## Closing

1. A two-paragraph conclusion stating what the evidence supports.
2. The user's closing question as the serif statement.
3. Booking: "Grab time with Stan." plus a one-line topic-specific invitation
   ("We will look at what AI changes in your market and what a weekly
   publishing plan would take for your team."), the button and the calendar.

## Final pass

Run the `humanizer` skill on the narrative, then run the linter:

```bash
node scripts/check-copy.mjs src/data/<topic>Research.js src/components/<Name>Study.jsx
```

It reports banned words, em dashes (in any JSX text node, however short), dramatic reframes, staccato runs and a second "actually" with file and line.
Banned words are allowed on `title:` lines (a cited source title) and on any line containing `copy-ok`.
The grep below is the same check by hand:

```bash
grep -noiE "quietly|honest|truth|actually|really|simply|basically|essentially|dramatic|let'?s be clear|make no mistake|here'?s the|game.?chang|transformative|incredibl|remarkabl|doomer|—" src/data/<topic>Research.js src/components/<Name>Study.jsx
```

Matches inside source titles are acceptable. Everything else gets rewritten.
