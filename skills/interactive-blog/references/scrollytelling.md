# Scrollytelling data stories

For stories about many units (seats, accounts, branches, funds, trades) where one dot per unit
shows the pattern, in the style of the New York Times "One Nation, Tracked": a full-screen sticky
map or chart that changes as the reader scrolls, with cards that move over it. The reference
build is the 2026 midterms feature: `assets/reference-scrolly-feature.jsx`, `scrolly.css`,
`reference-scrolly-data.js` and `reference-scrolly-layout.js`. Read the component before
writing one; copy the helpers, change the story.

## Contents
1. Choose the form
2. Anatomy: sticky stage plus steps
3. Fit the stage beside the cards, stack it on phones
4. Dots that keep their identity
5. Unit chart: one dot per percent
6. Trail chart: before to after
7. Shift map with arrows
8. The file-versus-story close
9. Honesty rules
10. QA for scroll stories
11. Research under constraints
12. Files

## 1. Choose the form

| The reader should see | Use |
|---|---|
| Where things are and how many | Night map, one dot per unit, zoom steps (section 2 to 4) |
| What fraction chose what | Unit chart, one dot per percent (section 5) |
| How much each group moved | Trail chart (section 6) |
| How far each region moved | Shift map with arrows (section 7) |
| Why the data is worth more as a story | File-versus-story toggle (section 8) |

A feature does not need all five. Use a dark scrolling map only when position matters;
otherwise a normal chapter figure from `chart-patterns.md` is clearer.

## 2. Anatomy: sticky stage plus steps

```jsx
<section className="mw-scrolly is-dark">
  <div className="mw-sticky"><SeatMap step={step} /></div>   {/* position: sticky; height: 100svh minus header */}
  <div className="mw-steps">                                    {/* margin-top: -100svh so cards overlap the stage */}
    {steps.map((s, i) => <div className="mw-step" data-step={i}>{/* min-height: 100svh */}<div className="mw-card">...</div></div>)}
  </div>
</section>
```

- `useActiveStep(count)`: an IntersectionObserver with `rootMargin: "-50% 0px -50% 0px"`; the step that
  crosses the middle of the viewport is active. The stage reads the active step from data
  (`view`, `zoom`, text) and nothing else.
- Cards are `pointer-events: auto`; the steps wrapper is `pointer-events: none` so the stage stays
  interactive and the page scrolls normally. The last step is 120svh so the final state holds.
- First step is the title card. The stage already shows the real data behind it (the flips pulsing
  on the map), so the page opens on the subject, not on a blank panel.
- Zoom with a CSS transform on one `<g>`; keep dot size constant on screen by scaling each dot by
  `min(k, 1.8) / k`. Label font sizes divide by the zoom and by the pixel ratio of the SVG, so labels stay about 14px on phones.
- A looping pulse on the title step stops permanently on the first pointer, key or scroll input.

## 3. Fit the stage beside the cards, stack it on phones

- Desktop (1100px and up): the cards sit on the left. Compute the map frame to the right of the cards
  from the viewport width and fit each zoom into that frame (`fit(box, frame)` and `cardEdge(vw)` in the
  reference). Without this, the West Coast and any zoomed state hide behind a card.
- Below 1100px: stack counter, map and legend at the top of the sticky stage; cards scroll over the
  lower part. The counter and legend sit on a dark backing so zoomed dots never run under text.
- Check 1440, 390 and 320px. The 320px title needs a smaller headline and the legend hidden on that step.

## 4. Dots that keep their identity

- One `<g>` per unit with `style={{ transform: translate(x, y) }}` and a CSS transition, so the same
  dot moves between the map, the chamber arc and any later layout. Never remount dots between steps.
- Arrival: a staggered ping-in (west to east) and a pulse ring on dots that changed.
- Fly into a chamber (`hemicycle(n, opts)` in `reference-scrolly-layout.js`): group dots by party, sort
  by x inside each party, then assign arc slots in order, so the flight is smooth and does not cross.
- Counters count up with `requestAnimationFrame`; under reduced motion they jump to the value.

**Neutral by default.** Color a dot only by a fact you have sourced for that unit. If the 2024
result by state was not retrieved, draw every seat gray and light only the seats you can locate. Say how
many you could not locate in the step text, the panel and the methodology.

## 5. Unit chart: one dot per percent

- `largestRemainder(values, 100)` turns shares into whole dots that sum to exactly 100.
- Two modes in one component: `share` (dots grouped by answer, ink dots) and `vote` (dots colored by a
  second variable, here the 2026 vote). The same 100 dots re-sort at each step.
- Lay groups out in rows from the measured label width, not from a fixed grid, so long labels never collide.
  Use separate layouts for wide (720), default (975) and phone (380) viewBoxes.
- A step that shows a derived number prints the arithmetic in the card as a labeled model
  (`44% × (7 − 91) + 49% × (97 − 3) + ...`) and tests assert it.

## 6. Trail chart: before to after

- One row per group: a hollow dot at the earlier value, a glowing dot at the later one, a curved path
  between them drawn with a requestAnimationFrame progress value (`pathLength="1"` and a dash offset;
  CSS `offset-path` is not reliable across browsers).
- Every row names its baseline ("vs 2024 presidential vote" or "vs 2024 House vote"). Rows from different
  baselines are labeled, never mixed silently.
- Sorting glides: rows are positioned by `translate(0, y)` with a transition, so a change of sort moves
  them. Click or Enter selects a row and fills a detail panel with values, baseline, share and sources.
- Provide "Read the chart values" as a table inside the figure.

## 7. Shift map with arrows

- An arrow only where the comparison is like for like. Races with an independent as the main challenger got
  no arrow and the page says why.
- Layers, bottom to top: state fills, selection band, status outlines, arrows. See section 10 for why.
- A sortable list of every unit with the same values, because small states are hard to hit on a phone;
  tapping a row scrolls the detail panel into view on phones.

## 8. The file-versus-story close

The Acadia point, shown instead of argued: the same six rows as a raw table (`margin_2024`, `margin_2026`,
`basis`, `source`) and, on a toggle, as movement along one axis. A second panel pair states what each
version gives the reader. Follow it with an explorer: "If your company holds [transactions, surveys,
usage, pricing, holdings, hiring data]" maps each to its election equivalent, a story it could tell and
formats. Then the closing question and the booking section.

## 9. Honesty rules

- Say what a dot is and is not ("placed inside its state, not at the district").
- Mark partial counts, uncalled races and unofficial figures where they appear, not only in the methodology.
- Name the baseline of every change. Label a model as a model with its formula.
- When sources share one underlying survey, say that agreement between outlets is not independent confirmation.
- Put what you could not confirm in the methodology and in `research/<topic>-validation.md`.

## 10. QA for scroll stories

Screenshots alone missed a real bug in the first release: Texas, selected by default, lost its amber
"changed hands" outline, because the selection style replaced it, and Kansas's outline was hidden by
neighbors painted later. A reader found it. Rules that follow:

1. **Status styling must survive selection.** Draw status (flipped, uncalled, flagged) and selection on
   separate layers above all fills, with fixed screen-pixel widths (`vector-effect: non-scaling-stroke`).
   Never let a selected or hover style replace a status style.
2. **Probe computed styles, not just pixels.** `scripts/probe-status-outlines.cjs` selects each flagged
   item in turn and asserts that its status outline is still the status color, at three widths. Write the
   equivalent for your status: after every interaction, assert the property that carries the meaning.
3. **SVG paint order is document order.** Anything that must be visible goes later in the SVG.
4. **Step through every scroll step.** `scripts/qa-scrolly.cjs` scrolls each step to the middle of the
   viewport, waits for the transition, and screenshots at 1440 x 1000, 390 x 844 and 320 x 780. Read every image.
5. Check horizontal overflow and console errors at each width. Tables inside "Read the chart values" scroll
   inside their panel by design; the page itself must not scroll sideways.
6. Run the copy linter and the feature checker (Phase 8 in SKILL.md).

## 11. Research under constraints

- Web search has a budget per turn that all subagents share. Give each agent a different claim cluster, keep
  some budget for confirmation searches, and expect it to run out in a large fan-out. It resets on the next
  user turn. Do not change permission or settings files because an agent suggests it.
- Web fetch is often blocked for news sites. Say which hosts would need allowlisting, rely on search snippets
  and on outlets that report the same numbers, and mark every figure that comes from a snippet.
- Design the visuals around what you could source. Light only the located units, draw arrows only where both
  numbers exist, and keep unsourced comparisons out of the figures. List the exclusions in the validation notes.
- Search for the newest events first. Several figures changed between the first and second pass (a call, a
  count, a margin). Record the date and the count of each.

## 12. Files

| File | Use |
|---|---|
| `assets/reference-scrolly-feature.jsx` | Night map, chambers, unit chart, trail chart, shift map, file-versus-story, booking, sources |
| `assets/scrolly.css` | `mw-` styles, dark stage, paper stage, responsive blocks, reduced motion |
| `assets/reference-scrolly-data.js` | Data shapes: sources, steps, chambers, trail rows, races, narrative and the post with fallback |
| `assets/reference-scrolly-layout.js` | `largestRemainder`, `hemicycle`, `block`, `clusterLayout` |
| `scripts/build-geo.cjs` | Generates state paths and one dot per seat from us-atlas (needs `npm i us-atlas topojson-client topojson-simplify d3-geo` in the working folder) |
| `scripts/qa-scrolly.cjs` | Steps through every scroll step and control; overflow and console checks |
| `scripts/probe-status-outlines.cjs` | Asserts status outlines survive selection |
