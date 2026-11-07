# Chart patterns

Each pattern names the component in `assets/reference-feature.jsx` (the AI jobs
feature) or `assets/reference-seat-feature.jsx` (agents feature) to copy, its
data shape, and when to use it. Styles are in `assets/charts.css` (prefix `aj-`)
and `assets/base.css` (prefix `sp-`).

## Contents
- Shared helpers
- Hero patterns
- Chapter patterns (1–10)
- Closing patterns
- Accessibility rules

## Shared helpers (copy as-is)

`Source`, `Prose`, `SectionIntro`, `Segments`, `Range`, `ChapterNav` from
`reference-feature.jsx`. `Segments` accepts `onInteract` so a hero can stop
autoplay. `Source` links to `#source-<id>` anchors in the ledger.

```jsx
function Segments({ label, options, value, onChange, onInteract }) {
  return (
    <div className="sp-segments" role="group" aria-label={label}>
      {options.map((o) => {
        const key = typeof o === "string" ? o : o.value;
        return (
          <button key={key} type="button" aria-pressed={value === key}
            onPointerDown={onInteract} onKeyDown={onInteract}
            onClick={() => { onInteract?.(); onChange(key); }}>
            {typeof o === "string" ? o : o.label}
          </button>
        );
      })}
    </div>
  );
}
```

## Hero patterns

**Data ladder / stepped series** (`Hero` + `Ladder` in reference-feature.jsx).
Use when one measured series changes over releases or years and one group
differs from the rest. SVG 600 × 470; rails, rungs as 14px bars, people dots
above each rung, missing dots as coral outlines, the gap value at 26 units in
coral. Steps through `ladderReleases`.

**Conceptual orbit** (`Hero` in reference-seat-feature.jsx). Use when the idea is
a ratio that grows (one seat, 1–12 agents). Mark it "Conceptual illustration".

Autoplay controller (both heroes): `isPlaying`, `isInView`
(IntersectionObserver, threshold 0.2), `isPageVisible` (visibilitychange),
`reducedMotion` (matchMedia), `manualRef` latch. `stopAnimation()` cancels the
timeout synchronously and sets the latch; any control calls it on pointerdown,
keydown and change. Only the Play button clears the latch. Live region is
`aria-live="off"` while playing.

## Chapter patterns

1. **Switchable card board** (`ForecastBoard`). Two or three camps or
   categories; 2-column grid of cards with name, role, date, claim, source.
   Use for debates and positions. Data: `{ camp: [{who, role, date, claim, source}] }`.

2. **Forecast versus measured scale** (`ForecastCheck`). Horizontal 0–N scale,
   hatched coral band for the forecast range, teal marker with a large value
   for the measured number, segment toggle between populations. Use whenever a
   prediction can be checked.

3. **Horizontal comparison bars** (`WefBars`). Two to five bars on one scale,
   value inside the bar. Use for created/displaced/net or before/after.

4. **Sortable atlas with detail panel** (`LayoffAtlas` + `Waffle`). Rows are
   buttons with a category dot, name, date and a proportional bar; sort by
   count, share or date; the selected row drives a detail panel with a large
   number, a 100-square waffle of the entity's own base, a headline, detail, a
   "Stated reason" box and sources. Optional denominator toggle
   (`altBase`). Use for any set of entities (companies, vendors, funds).
   Data: `{ id, name, date, sortDate, kind, people, peopleLabel, peopleNote, base, baseLabel, share?, altBase?, link, headline, detail, stated, sources }`.

5. **Vertical bars with per-period / cumulative toggle** (`TrendChart`).
   Four to eight periods, values above bars, current period full opacity,
   derived periods hatched, a stat callout underneath, a `<details>` values
   table. Use for annual counts.

6. **Annotated line chart** (`EntryChart`, Stanford view). SVG 640 × 260,
   padding `{l:56,r:56,t:46,b:46}`, gridlines every 5 units, labeled points,
   muted label for the baseline point. Use for 3–8 points; say when points
   come from different releases.

7. **Two-bar comparison plus stat** (`EntryChart`, graduates view). Use when
   one group is compared with the whole, plus one extra headline number.

8. **Explorer grid with answer panel** (`IndustryExplorer`). 2-column button
   grid with a three-step tier meter on each; answer panel with tier title,
   meter and a `<dl>` (what the data shows, what companies are doing, where
   the gains are) plus sources. Use for "what does this mean for your
   industry/role/product".

9. **Calculator** (`PublishingModel`, `BillSimulator`, `MeterLab`). Segments
   for the scenario, a `Range` slider, an assumptions table, results as large
   numbers with unit squares, a dynamic sentence, and a caption with the
   formula. Put the math in an exported pure function and test it.

10. **Company/vendor pricing atlas** (`PricingAtlas` in the seat feature) and
    **timeline** (`MigrationTimeline`): use for feature-by-entity matrices and
    dated sequences.

## Closing patterns

- `sp-closing` serif statement with the closing question.
- Booking section copied verbatim (Google Calendar schedule iframe, `/book`
  fallback).
- `Sources` ledger with `downloadData()` exporting every dataset and source as
  JSON named `acadia-<topic>-research-<date>.json`.

## Accessibility rules

- Every chart has `role="img"` with an `aria-label` that states the values, or
  a `<details>` table with the values.
- Controls are real buttons with `aria-pressed`; sliders are labeled inputs.
- Detail panels use `aria-live="polite"`.
- Color is never the only encoding: values are printed next to bars and points.
