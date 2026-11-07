# Design system

Interactive Blog features share one stylesheet, `src/components/SeatPricingStudy.css`
(bundled as `assets/base.css`), scoped under `.seat-study`. Each new feature adds
a second root class (`seat-study jobs-study`) and a small stylesheet with its own
prefix (`aj-` for the jobs feature). Never edit the shared stylesheet to fix one
feature; override with a more specific selector in the feature stylesheet.

## Contents
1. Tokens
2. Typography
3. Color semantics
4. Layout and rhythm
5. Shared class catalog
6. Feature-specific chart styling
7. Motion
8. Responsive rules

## 1. Tokens

```css
.seat-study {
  --sp-paper: #faf6ef;   /* page ground, cream */
  --sp-ink:   #14120e;   /* text, neutral data */
  --sp-muted: #656158;   /* secondary text, axis labels */
  --sp-rule:  #d7d2c8;   /* hairlines, borders */
  --sp-blue:  #2447f9;   /* electric blue */
  --sp-coral: #d6502b;   /* Acadia coral */
  --sp-teal:  #177e89;
}
```

Supporting surfaces (use these exact values):

| Use | Hex |
|---|---|
| Figure card background | `#fffdf9` with `1px solid var(--sp-rule)`, radius 18px, padding 32px |
| Detail / answer panels | `#efece5`, radius 12–14px |
| Segmented control track | `#ece8e0`, radius 9px, 4px padding |
| Selected row | `#e9e4da` with `inset 4px 0 0 var(--sp-ink)` |
| Hover row | `#f3efe7` (only inside `@media (hover: hover)`) |
| Pale blue callout, booking section | `#e6edff` |
| Pale teal callout | `#e3f0f1` |
| Counterpoint box | `#f0e8db`, radius 8px |
| Empty chart track / waffle off | `#efece5` / `#d9d5cd` |
| Amber highlight (seat glow, booking badge) | `#f6a831` |
| Neutral "not cited / reversed" | `#9a958b` |

Accent orange for "future driver" in the jobs atlas: `#e08a2c`.

## 2. Typography

Fonts load site-wide: **Archivo** (everything), **Instrument Serif** (only the
closing statement), IBM Plex Mono is not used in these features.

| Element | Spec |
|---|---|
| Hero h1 | `clamp(64px, 6.4vw, 94px)`, weight 750, line-height 0.99, tracking −0.065em, max-width 620px. For 4-line headlines use `clamp(54px, 5.5vw, 82px)` |
| Deck | `clamp(19px, 1.65vw, 24px)`, line-height 1.5, max-width 540–560px. No forced `<br/>` that orphans a word |
| Section label | 13px, weight 600, coral |
| Section h2 | `clamp(35px, 4.7vw, 60px)`, weight 650, tracking −0.045em |
| Prose | 18px, line-height 1.8, max-width 720px |
| Chart h3 | 26px, weight 600, tracking −0.03em |
| Chart kicker (`sp-data-type`) | 12px muted |
| Big detail number | 46–58px, weight 750, tracking −0.05em |
| Stat callout number | 42px, weight 750 |
| Chart labels | ≥ 13px; SVG labels 13–26 units on a 600–640 viewBox |
| Segment buttons | 12px |
| Booking h2 | `clamp(38px, 5.2vw, 66px)`, weight 750 |

## 3. Color semantics

Decide the meanings before drawing and write them at the top of the feature
CSS. Each color means one thing for the whole feature, including the hero,
legends and the social image.

- Jobs feature: **coral** = jobs affected or the entry-level gap; **blue** = AI
  and AI spending; **teal** = measured labor outcomes; **ink** = neutral
  employment; **gray #9a958b** = not cited or reversed.
- Agents feature: **coral** = people or seats; **blue** = automated work;
  **teal** = outcomes or hybrid.

Category colors in an atlas legend are allowed to add one or two hues (for
example amber for "future driver"), but they must still be consistent with the
above and shown in a legend.

Derived or estimated values: hatched fill (`repeating-linear-gradient(-45deg, …)`).
Eligible pools or offers (not completed actions): hatched bar. Reversed: 50% opacity.

## 4. Layout and rhythm

- `.sp-body` max-width 1312px, 32px side padding. Sections: 100px vertical
  padding, hairline bottom border.
- Reading column (prose, takeaways) 720px, centered. Figures span the full body.
- Rhythm per chapter: section label + h2 → prose (2–3 paragraphs) → one
  full-width interactive figure → takeaway or counterpoint → optional
  `sp-reading-pair` of two short cited notes.
- Hero: two columns (copy | interactive SVG), meta row on top ("Acadia insights"
  link, "Interactive research · date"), a bottom strip with one headline
  statistic and an in-page link.
- Sticky chapter nav under the site header (`top: 80px`), numbered, highlights
  the chapter in view, scrolls horizontally on mobile.
- Closing: a serif statement (`.sp-closing`) with the user's closing question,
  then the booking section, then the source ledger.

## 5. Shared class catalog (from base.css)

Hero: `sp-hero`, `sp-hero-meta`, `sp-hero-grid`, `sp-hero-copy`, `sp-deck`,
`sp-byline`, `sp-explore-link`, `sp-hero-playground`, `sp-hero-controls`,
`sp-hero-playback`, `sp-example-tag`, `sp-mini-dot` (`.coral`, `.blue`),
`sp-hero-bottom`.

Structure: `sp-skip`, `sp-chapters`, `sp-body`, `sp-thesis`, `sp-thesis-lead`,
`sp-section`, `sp-section-intro`, `sp-section-label`, `sp-prose`,
`sp-inline-link`.

Figures: `sp-figure` (also `sp-atlas`, `sp-simulator` give the card look),
`sp-chart-heading`, `sp-data-type`, `sp-chart-date`, `sp-asof`, `sp-legend`,
`figcaption`, `sp-caption`, `sp-details` (collapsible "Read the chart values"
table), `sp-sources-inline`.

Controls: `sp-segments` (buttons with `aria-pressed`), `sp-range`
(`--range-fill` custom property), `sp-range-top`, `sp-range-ends`.

Panels: `sp-company-detail`, `sp-detail-top`, `sp-detail-caution`,
`sp-takeaway`, `sp-counterpoint`, `sp-reading-pair`, `sp-closing`.

Close: `sp-booking`, `sp-booking-intro`, `sp-booking-badge`,
`sp-booking-button`, `sp-booking-calendar`, `sp-booking-fallback`,
`sp-source-section`, `sp-source-heading`, `sp-download`, `sp-methodology`,
`sp-source-list`.

Specificity trap: `.sp-company-detail > p:not(.sp-detail-price)` sets 13px on
every paragraph in a detail panel. Override with
`.sp-company-detail.<feature>-detail > p.<class>`.

## 6. Feature-specific chart styling

Bundled `assets/charts.css` (the jobs feature) contains finished styles for:
hero ladder SVG, forecast card board, forecast-versus-measured scale with hatched
band and animated marker, horizontal comparison bars, sortable atlas rows with
proportional bars, 100-square waffle, vertical bar chart with derived hatching,
annotated SVG line chart, two-bar comparison with stat callout, explorer grid
with three-step tier meter, publishing calculator with result squares. Copy the
block you need and rename the prefix.

Card details that make it look finished:
- Bars: radius 4–8px, value label beside or inside in weight 650–750.
- Cards in a board: left border 5px in the camp color, 10px radius, entrance
  animation `aj-rise` staggered 50ms.
- Waffle: 10 × 10, 13px squares, 3px gap, radius 2px.
- Tier meter: three 22–46px pills, filled in blue.

## 7. Motion

Purposeful only: data transitions (width, height, left) 0.6–0.9s
`cubic-bezier(0.22, 0.8, 0.24, 1)`; entrance 0.3–0.45s. Hero autoplay steps
1.4–1.7s with a 3.2s hold on the final state. Every animation is disabled in
`@media (prefers-reduced-motion: reduce)`.

## 8. Responsive rules

Breakpoints from base.css: 1190px (paired figures stack), 940px (atlas,
explorer and calculator layouts go to one column), 680px (mobile type and
padding), 400px, 360px. Verify at 1440, 390 and 320 wide. No page-level
horizontal overflow; wide tables scroll inside their container. Keep segment
labels short enough to stay on one row.
