import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { statesGeo, stateBorders, nationOutline, seatDots, SEAT_RADIUS, MAP_W, MAP_H } from "../data/midtermGeo";
import { hemicycle, largestRemainder, block } from "../data/midtermLayout";
import {
  sources,
  asOf,
  reviewDate,
  house,
  houseFlips,
  locatedFlips,
  nightSteps,
  chambers,
  popularVote,
  voterSteps,
  impliedMargin,
  trailGroups,
  trailGroupLabels,
  trailSorts,
  trailShift,
  senateRaces,
  dataStoryRows,
  dataIdeas,
  narrative,
  narrativeSources,
  marginLabel,
  shiftLabel,
} from "../data/midtermResearch";
import "./SeatPricingStudy.css";
import "./MidtermStudy.css";

const sourceMap = Object.fromEntries(sources.map((s) => [s.id, s]));
const stateIndex = Object.fromEntries(statesGeo.map((s) => [s.id, s]));
const chapters = [
  ["the-night", "The night"],
  ["the-chambers", "The chambers"],
  ["the-reasons", "The reasons"],
  ["the-voters", "The voters"],
  ["the-states", "The states"],
  ["the-data", "The data"],
];
const ARC_CY = 575;
const signed = (v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)}`;

/* ── shared helpers ── */

function Source({ ids, children }) {
  return (
    <span className="sp-sources-inline">
      {children || (ids.length > 1 ? "Sources" : "Source")}:{" "}
      {ids.map((id, i) => (
        <React.Fragment key={id}>
          {i > 0 && " · "}
          <a href={`#source-${id}`}>{sourceMap[id].publisher}</a>
        </React.Fragment>
      ))}
    </span>
  );
}

// Inline marks for step text: **bold**, {d:blue}, {r:coral}, {f:amber}.
function Rich({ text }) {
  const parts = [];
  const re = /\*\*(.+?)\*\*|\{([drf]):(.+?)\}/g;
  let last = 0;
  let m;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={k++}>{m[1]}</strong>);
    else
      parts.push(
        <span key={k++} className={`mw-k-${m[2]}`}>
          {m[3]}
        </span>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function Prose({ section, children }) {
  return (
    <div className="sp-prose">
      {narrative[section]?.map((p) => (
        <p key={p.slice(0, 40)}>
          <Rich text={p} />
        </p>
      ))}
      {narrativeSources[section] && (
        <p className="mw-prose-sources">
          <Source ids={narrativeSources[section]} />
        </p>
      )}
      {children}
    </div>
  );
}

function SectionIntro({ label, title }) {
  return (
    <div className="sp-section-intro">
      <p className="sp-section-label">{label}</p>
      <h2>{title}</h2>
    </div>
  );
}

function Segments({ label, options, value, onChange }) {
  return (
    <div className="sp-segments" role="group" aria-label={label}>
      {options.map((o) => {
        const key = typeof o === "string" ? o : o.value;
        return (
          <button key={key} type="button" aria-pressed={value === key} onClick={() => onChange(key)}>
            {typeof o === "string" ? o : o.label}
          </button>
        );
      })}
    </div>
  );
}

function useMedia(query) {
  const get = () => typeof window !== "undefined" && window.matchMedia(query).matches;
  const [match, setMatch] = useState(get);
  useEffect(() => {
    const m = window.matchMedia(query);
    const f = () => setMatch(m.matches);
    f();
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, [query]);
  return match;
}

const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

// Which scroll step crosses the middle of the viewport.
function useActiveStep(count) {
  const refs = useRef([]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.step));
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    refs.current.slice(0, count).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [count]);
  return [refs, active];
}

function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, seen];
}

function useCountUp(target, reduced) {
  const [n, setN] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reduced) {
      setN(target);
      from.current = target;
      return undefined;
    }
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 1000);
      const e = 1 - Math.pow(1 - p, 3);
      const v = Math.round(a + (target - a) * e);
      setN(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return n;
}

// Elapsed milliseconds of a one-shot animation that starts when `play` turns true.
function useProgress(play, duration, reduced) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!play || reduced) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const e = Math.min(now - start, duration);
      setElapsed(e);
      if (e < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, duration, reduced]);
  return reduced ? duration : elapsed;
}

// Deterministic random numbers, so the layout is identical on every load.
function seeded(seed) {
  let a = 0;
  for (const ch of seed) a = (a * 31 + ch.charCodeAt(0)) >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/* ── Chapter 1: the night (dark scrollytelling) ── */

// One dot per seat. Located flips take the first dots of their state (seeded order).
// In the chamber view, flips keep their party and the remaining dots fill the AP
// tally at random, so no state is implied to have voted a particular way.
function buildSeats() {
  const seats = [];
  for (const [st, pts] of Object.entries(seatDots)) {
    const f = houseFlips[st] || {};
    const rand = seeded(st);
    const order = pts.map((p) => ({ p, k: rand() })).sort((a, b) => a.k - b.k);
    order.forEach(({ p }, rank) => {
      const flip = rank < (f.d || 0) ? "D" : rank < (f.d || 0) + (f.r || 0) ? "R" : null;
      seats.push({ st, x: p[0], y: p[1], flip });
    });
  }
  const { D, R, U } = house.called;
  const fD = seats.filter((s) => s.flip === "D").length;
  const fR = seats.filter((s) => s.flip === "R").length;
  const rand = seeded("chamber-2026");
  const rest = seats
    .map((s, i) => (s.flip ? null : { i, k: rand() }))
    .filter(Boolean)
    .sort((a, b) => a.k - b.k);
  rest.forEach(({ i }, j) => {
    seats[i].party = j < D - fD ? "D" : j < D - fD + U ? "U" : "R";
  });
  seats.forEach((s) => {
    if (s.flip) s.party = s.flip;
  });
  const arc = hemicycle(seats.length, { cx: MAP_W / 2, cy: ARC_CY, inner: 130, outer: 400, rows: 10 });
  const groups = { D: [], U: [], R: [] };
  seats.forEach((s, i) => groups[s.party].push(i));
  Object.values(groups).forEach((g) => g.sort((i, j) => seats[i].x - seats[j].x));
  [...groups.D, ...groups.U, ...groups.R].forEach((si, slot) => {
    seats[si].ax = arc[slot].x;
    seats[si].ay = arc[slot].y;
  });
  seats.forEach((s) => {
    s.ping = Math.round((s.x / MAP_W) * 1300 + ((s.y * 7) % 180));
    s.sweep = Math.round((s.x / MAP_W) * 1100);
  });
  return { seats, counts: { D: fD, R: fR, other: seats.length - fD - fR } };
}

// Fit a box into the visible frame of the 975 x 610 stage.
function fit([bx0, by0, bx1, by1], frame, maxK = 3.2) {
  const w = bx1 - bx0;
  const h = by1 - by0;
  const fw = frame.x1 - frame.x0;
  const k = Math.min(maxK, Math.min(fw / w, (MAP_H - 24) / h) * 0.94);
  return { k, tx: frame.x0 + (fw - w * k) / 2 - bx0 * k, ty: (MAP_H - h * k) / 2 - by0 * k };
}

function viewTransform(step, frame) {
  if (step.view === "arc") return fit([80, 150, 895, 600], frame, 1.2);
  if (!step.zoom) return fit([0, 0, MAP_W, MAP_H], frame, 1);
  const boxes = step.zoom.map((id) => stateIndex[id].box);
  const pad = 18;
  return fit(
    [
      Math.min(...boxes.map((b) => b[0])) - pad,
      Math.min(...boxes.map((b) => b[1])) - pad,
      Math.max(...boxes.map((b) => b[2])) + pad,
      Math.max(...boxes.map((b) => b[3])) + pad,
    ],
    frame,
  );
}

// Right edge of the step cards (64px gutter + 400px card + 16px), in map units.
function cardEdge(vw) {
  const stageW = Math.min(1240, vw);
  const stageLeft = (vw - stageW) / 2;
  return Math.max(0, Math.min(460, ((64 + 400 + 16 - stageLeft) * MAP_W) / stageW));
}

function SeatMap({ step, reduced, loop, frameX0, unitPx = 1 }) {
  const { seats } = useMemo(buildSeats, []);
  const view = step.view;
  const isArc = view === "arc";
  const frame = { x0: frameX0, x1: MAP_W };
  const z = viewTransform(step, frame);
  const dotScale = isArc ? 1.9 : Math.min(z.k, 1.8) / z.k;
  const counter =
    view === "arc"
      ? { a: house.called.D, b: house.called.R, u: house.called.U, la: "Democrats", lb: "Republicans", cap: "Called races, AP tally, November 6" }
      : view === "flips"
        ? { a: house.flipsReported.toD, b: house.flipsReported.toR, u: 0, la: "Won from Republicans", lb: "Won from Democrats", cap: "Seats that changed hands, CBS News count" }
        : { a: house.won2024.D, b: house.won2024.R, u: 0, la: "Democrats", lb: "Republicans", cap: "House seats won in 2024" };
  const a = useCountUp(counter.a, reduced);
  const b = useCountUp(counter.b, reduced);
  const focus = new Set(step.zoom || []);
  const majorityAngle = Math.PI - ((house.majority - 0.5) / seats.length) * Math.PI;
  const isTitle = step.id === "title";
  const cls = (s) => (view === "unit" ? "N" : isArc ? s.party : s.flip || "N");
  return (
    <div className={`mw-stage ${isTitle ? "is-title" : ""}`}>
      <div className="mw-counter" aria-live="polite" aria-hidden={isTitle}>
        <div className="is-D">
          <strong>{a}</strong>
          <span>{counter.la}</span>
        </div>
        <div className="is-R">
          <strong>{b}</strong>
          <span>{counter.lb}</span>
        </div>
        {counter.u > 0 && (
          <div className="is-U">
            <strong>{counter.u}</strong>
            <span>Uncalled</span>
          </div>
        )}
        <p className="mw-counter-caption">{counter.cap}</p>
      </div>
      <svg
        className={`mw-seatmap view-${view} ${isArc ? "is-arc" : ""} ${loop ? "is-looping" : ""}`}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        role="img"
        aria-label={
          isArc
            ? `All 435 House seats grouped by party: ${house.called.D} Democratic, ${house.called.R} Republican, ${house.called.U} uncalled as of November 6.`
            : view === "flips"
              ? `Map of all 435 House seats with the ${locatedFlips.toD + locatedFlips.toR} seats that changed hands highlighted${step.zoom ? `, zoomed to ${step.zoom.map((id) => stateIndex[id].name).join(", ")}` : ""}.`
              : "Map of all 435 House seats, one dot per seat, placed inside each state."
        }
      >
        <g className="mw-zoom" style={{ transform: `translate(${z.tx}px, ${z.ty}px) scale(${z.k})` }}>
          {statesGeo.map((s) => (
            <path key={s.id} d={s.d} className={`mw-state ${focus.has(s.id) ? "is-focus" : ""}`} />
          ))}
          <path d={stateBorders} className="mw-borders" style={{ strokeWidth: 0.6 / z.k }} />
          <path d={nationOutline} className="mw-nation" style={{ strokeWidth: 0.9 / z.k }} />
          {seats.map((s, i) => {
            const party = cls(s);
            const x = isArc ? s.ax : s.x;
            const y = isArc ? s.ay : s.y;
            const delay = reduced ? 0 : isArc ? Math.round((s.ax / MAP_W) * 450) : Math.round((s.x / MAP_W) * 250);
            return (
              <g key={i} className="mw-seat" style={{ transform: `translate(${x}px, ${y}px)`, transitionDelay: `${delay}ms` }}>
                <g className="mw-seat-scale" style={{ transform: `scale(${dotScale})`, transitionDelay: `${delay}ms` }}>
                  <g className="mw-seat-in" style={{ "--ping": reduced ? "0ms" : `${s.ping}ms` }}>
                    <circle r={SEAT_RADIUS * 2.4} className={`mw-halo is-${party}`} />
                    <circle r={SEAT_RADIUS} className={`mw-dot is-${party}`} style={{ transitionDelay: isArc && !reduced ? `${delay + 700}ms` : "0ms" }} />
                    {s.flip && view !== "unit" && (
                      <circle r={SEAT_RADIUS * 2.1} className="mw-flip-ring" style={{ "--sweep": reduced || isArc ? "0ms" : `${s.sweep}ms` }} />
                    )}
                  </g>
                </g>
              </g>
            );
          })}
          {!isArc &&
            step.zoom &&
            step.zoom.map((id) => {
              const st = stateIndex[id];
              const f = houseFlips[id] || {};
              return (
                <text
                  key={id}
                  x={st.cx}
                  y={st.box[1] - 6 / z.k}
                  className="mw-zoom-label"
                  textAnchor="middle"
                  style={{ fontSize: Math.max(14, 14 / unitPx) / z.k, strokeWidth: Math.max(4, 4 / unitPx) / z.k }}
                >
                  {id}
                  {f.d ? <tspan className="mw-zl-d">{` +${f.d}`}</tspan> : null}
                  {f.r ? <tspan className="mw-zl-r">{` +${f.r} R`}</tspan> : null}
                </text>
              );
            })}
          <g className="mw-arc-marks" aria-hidden="true">
            <line
              className="mw-arc-line"
              x1={MAP_W / 2 + 112 * Math.cos(majorityAngle)}
              y1={ARC_CY - 112 * Math.sin(majorityAngle)}
              x2={MAP_W / 2 + 418 * Math.cos(majorityAngle)}
              y2={ARC_CY - 418 * Math.sin(majorityAngle)}
            />
            <text className="mw-arc-text" x={MAP_W / 2} y={ARC_CY - 40} textAnchor="middle" style={{ fontSize: Math.max(18, 14 / unitPx) / z.k }}>
              {house.majority} for a majority
            </text>
          </g>
        </g>
      </svg>
      <div className="mw-legend">
        {view === "unit" && (
          <span>
            <i className="is-N" />
            One dot per House seat, placed inside its state, not at the district’s location
          </span>
        )}
        {view === "flips" && (
          <>
            <span>
              <i className="is-D" />
              Won from Republicans
            </span>
            <span>
              <i className="is-R" />
              Won from Democrats
            </span>
            <span>
              <i className="is-N" />
              Other seats
            </span>
          </>
        )}
        {isArc && (
          <>
            <span>
              <i className="is-D" />
              Democratic
            </span>
            <span>
              <i className="is-R" />
              Republican
            </span>
            <span>
              <i className="is-U" />
              Uncalled
            </span>
            <span>
              <i className="is-F" />
              Changed hands
            </span>
            <span>
              <em>Grouped by party; positions in the chamber are not tied to states.</em>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// Width of the viewport, for fitting the map beside the step cards.
function useViewportWidth() {
  const [w, setW] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1440));
  useEffect(() => {
    const f = () => setW(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return w;
}

function NightStory() {
  const reduced = useReducedMotion();
  const vw = useViewportWidth();
  const wide = vw >= 1100;
  const [refs, active] = useActiveStep(nightSteps.length);
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    if (active > 0) setMoved(true);
  }, [active]);
  // The title view keeps pulsing until the reader interacts with the page.
  useEffect(() => {
    const stop = () => setMoved(true);
    window.addEventListener("pointerdown", stop, { once: true });
    window.addEventListener("keydown", stop, { once: true });
    return () => {
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", stop);
    };
  }, []);
  const step = nightSteps[active] || nightSteps[0];
  const shown = step.id === "title" ? { ...step, view: "flips" } : step;
  return (
    <section className="mw-scrolly is-dark" id="the-night" aria-label="The night: every House seat">
      <div className="mw-sticky">
        <SeatMap
          step={shown}
          reduced={reduced}
          loop={step.id === "title" && !moved && !reduced}
          frameX0={wide ? (step.id === "title" ? Math.max(360, cardEdge(vw)) : cardEdge(vw)) : 0}
          unitPx={Math.min(1240, vw) / MAP_W}
        />
      </div>
      <div className="mw-steps">
        {nightSteps.map((s, i) => (
          <div
            key={s.id}
            className={`mw-step ${i === 0 ? "is-first" : ""} ${i === nightSteps.length - 1 ? "is-last" : ""}`}
            data-step={i}
            ref={(el) => (refs.current[i] = el)}
          >
            {s.id === "title" ? (
              <div className="mw-title-card">
                <div className="mw-meta">
                  <Link to="/blog">Acadia insights</Link>
                  <span>Interactive data story · {narrative.dateline}</span>
                </div>
                <h1>
                  {narrative.headline.map((line, k) => (
                    <React.Fragment key={line}>
                      {k > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ))}
                </h1>
                <p className="mw-deck">{narrative.deck}</p>
                <p className="mw-byline">
                  By Stan Altshuller <span>{narrative.readTime}</span>
                </p>
                <p className="mw-scroll-cue">
                  <i aria-hidden="true" /> Scroll to follow the House, seat by seat
                </p>
              </div>
            ) : (
              <div className="mw-card">
                {s.text.map((t) => (
                  <p key={t.slice(0, 30)}>
                    <Rich text={t} />
                  </p>
                ))}
                {s.sources && <Source ids={s.sources} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ChapterNav() {
  const [active, setActive] = useState("the-night");
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), {
      rootMargin: "-100px 0px -55% 0px",
    });
    chapters.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return (
    <nav className="sp-chapters" aria-label="Article chapters">
      <div>
        {chapters.map(([id, title], i) => (
          <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined}>
            <span>{i + 1}</span>
            {title}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ── Chapter 2: the chambers ── */

function ChamberArc({ chamber, when }) {
  const c = chambers[chamber];
  const counts = when === "before" ? c.before : c.after;
  const n = c.total;
  const big = n > 200;
  const rows = big ? 12 : n > 60 ? 6 : 5;
  const seats = useMemo(() => hemicycle(n, { cx: 300, cy: 300, inner: big ? 96 : n > 60 ? 120 : 140, outer: 285, rows }), [n, rows, big]);
  const order = [
    ...Array(counts.D || 0).fill("D"),
    ...Array(counts.I || 0).fill("I"),
    ...Array(counts.U || 0).fill("U"),
    ...Array(counts.R || 0).fill("R"),
  ];
  const r = big ? 4.3 : n > 60 ? 8.6 : 11.5;
  const maj = Math.PI - ((c.majority - 0.5) / n) * Math.PI;
  const dTotal = (counts.D || 0) + (counts.I || 0);
  return (
    <svg
      className="mw-arc"
      viewBox="0 0 600 392"
      role="img"
      aria-label={`${c.label}, ${when === "before" ? c.beforeLabel : c.afterLabel}: ${counts.D} Democratic${counts.I ? `, ${counts.I} independent` : ""}, ${counts.R} Republican${counts.U ? `, ${counts.U} uncalled` : ""}.`}
    >
      {seats.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={r} className={`is-${order[i]}`} />
      ))}
      <line className="mw-arc-majority" x1={300 + 70 * Math.cos(maj)} y1={300 - 70 * Math.sin(maj)} x2={300 + 300 * Math.cos(maj)} y2={300 - 300 * Math.sin(maj)} />
      <text x={300} y={342} textAnchor="middle" className="mw-arc-mid">
        {c.majorityLabel}
      </text>
      <text x={92} y={378} textAnchor="middle" className="mw-arc-big is-D">
        {dTotal}
      </text>
      <text x={508} y={378} textAnchor="middle" className="mw-arc-big is-R">
        {counts.R}
      </text>
      <text x={300} y={380} textAnchor="middle" className="mw-arc-small">
        {counts.U ? `${counts.U} uncalled` : ""}
      </text>
    </svg>
  );
}

function ChambersExplorer() {
  const [chamber, setChamber] = useState("house");
  const [when, setWhen] = useState("after");
  const c = chambers[chamber];
  return (
    <figure className="sp-figure mw-chambers">
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">Results as of {asOf}</span>
          <h3>{c.title}</h3>
          <p>{c.subtitle}</p>
        </div>
        <Segments
          label="Chamber"
          options={[
            { value: "house", label: "House" },
            { value: "senate", label: "Senate" },
            { value: "governors", label: "Governors" },
          ]}
          value={chamber}
          onChange={setChamber}
        />
      </div>
      <div className="mw-chamber-layout">
        <div>
          <Segments
            label="Before or after the election"
            options={[
              { value: "before", label: c.beforeLabel },
              { value: "after", label: c.afterLabel },
            ]}
            value={when}
            onChange={setWhen}
          />
          <ChamberArc chamber={chamber} when={when} />
          <div className="mw-arc-legend">
            <span>
              <i className="is-D" />
              Democratic
            </span>
            {chamber === "senate" && (
              <span>
                <i className="is-I" />
                Independent, caucuses with Democrats
              </span>
            )}
            <span>
              <i className="is-R" />
              Republican
            </span>
            {when === "after" && (
              <span>
                <i className="is-U" />
                Uncalled
              </span>
            )}
          </div>
        </div>
        <div className={`mw-flips ${c.flips.length > 9 ? "is-compact" : ""}`} aria-live="polite">
          <h4>{c.flipsTitle}</h4>
          <ul>
            {c.flips.map((f) => (
              <li key={f.key} className={`to-${f.to}`}>
                <b>{f.st}</b>
                <span>{f.label}</span>
                <em className={`is-${f.to}`}>{f.result}</em>
              </li>
            ))}
          </ul>
          {c.note && <p className="mw-flips-note">{c.note}</p>}
        </div>
      </div>
      <figcaption>
        {c.caption} <Source ids={c.sources} />
      </figcaption>
      <details className="sp-details">
        <summary>Read the chart values</summary>
        <table>
          <caption>
            {c.title}: {c.beforeLabel.toLowerCase()} and after, and {c.flipsTitle.toLowerCase()}
          </caption>
          <thead>
            <tr>
              <th>Count</th>
              <th>Democratic</th>
              <th>Independent</th>
              <th>Republican</th>
              <th>Uncalled</th>
            </tr>
          </thead>
          <tbody>
            {[
              [c.beforeLabel, c.before],
              [c.afterLabel, c.after],
            ].map(([label, v]) => (
              <tr key={label}>
                <th>{label}</th>
                <td>{v.D}</td>
                <td>{v.I || 0}</td>
                <td>{v.R}</td>
                <td>{v.U || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th>State</th>
              <th>Change</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {c.flips.map((f) => (
              <tr key={f.key}>
                <th>{f.st}</th>
                <td>{f.result}</td>
                <td>{f.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

function PopularVote() {
  const [ref, seen] = useInView(0.3);
  const reduced = useReducedMotion();
  const max = 15;
  const on = seen || reduced;
  return (
    <figure className="sp-figure mw-popvote" ref={ref}>
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">National House vote margin</span>
          <h3>{popularVote.title}</h3>
          <p>{popularVote.subtitle}</p>
        </div>
      </div>
      <div className="mw-pv-axis" aria-hidden="true">
        <span className="is-D">← Democratic lead</span>
        <span>Even</span>
        <span className="is-R">Republican lead →</span>
      </div>
      <div className="mw-pv-rows" role="img" aria-label={popularVote.rows.map((r) => `${r.year}: ${marginLabel(r.m)}`).join("; ")}>
        {popularVote.rows.map((r) => {
          const w = (Math.abs(r.m) / max) * 50;
          const side = r.m > 0 ? "D" : "R";
          return (
            <div key={r.year} className={`mw-pv-row ${r.current ? "is-current" : ""}`}>
              <span className="mw-pv-year">{r.year}</span>
              <div className="mw-pv-track">
                <i className="mw-pv-zero" />
                <div
                  className={`mw-pv-bar is-${side}`}
                  style={side === "D" ? { right: "50%", width: on ? `${w}%` : 0 } : { left: "50%", width: on ? `${w}%` : 0 }}
                />
                <b
                  className={`mw-pv-label is-${side}`}
                  style={side === "D" ? { right: `calc(50% + ${on ? w : 0}% + 10px)` } : { left: `calc(50% + ${on ? w : 0}% + 10px)` }}
                >
                  {marginLabel(r.m)}
                </b>
              </div>
              <em>{r.note}</em>
            </div>
          );
        })}
      </div>
      <figcaption>
        {popularVote.caption} <Source ids={popularVote.sources} />
      </figcaption>
    </figure>
  );
}

/* ── Chapter 3: the reasons (paper scrollytelling, 1 dot = 1% of voters) ── */

const labelWidth = (text, size) => text.length * size * 0.56 + 8;

function voterLayout(step, narrow, wide) {
  const W = narrow ? 380 : wide ? 720 : 975;
  const n = step.groups.length;
  const gap = narrow ? 13 : 17;
  const cols = narrow ? 10 : n <= 2 ? 10 : n === 3 ? 8 : n === 4 ? 7 : 6;
  const pad = narrow ? 22 : n >= 5 ? 30 : 54;
  const labelH = 58;
  const counts = largestRemainder(
    step.groups.map((g) => g.share),
    100,
  );
  const items = step.groups.map((g, gi) => {
    const c = counts[gi];
    const cc = Math.min(cols, Math.max(c, 1));
    const bw = cc * gap;
    const lw = Math.max(labelWidth(g.label, 15), labelWidth(step.mode === "vote" ? "44% of voters" : "39%", 15));
    return { g, c, cc, bw, slot: Math.max(bw, lw), h: Math.ceil(c / cc) * gap };
  });
  const rows = [];
  let cur = [];
  let curW = 0;
  items.forEach((it) => {
    const add = (cur.length ? pad : 0) + it.slot;
    if (cur.length && curW + add > W - 8) {
      rows.push(cur);
      cur = [];
      curW = 0;
    }
    curW += (cur.length ? pad : 0) + it.slot;
    cur.push(it);
  });
  if (cur.length) rows.push(cur);
  const dots = [];
  const labels = [];
  let y = narrow ? 64 : 80;
  rows.forEach((row) => {
    const used = row.reduce((a, it) => a + it.slot, 0) + pad * (row.length - 1);
    let x = (W - used) / 2;
    const rowH = Math.max(...row.map((it) => it.h));
    row.forEach((it) => {
      const bx = x + (it.slot - it.bw) / 2 + gap / 2;
      const pts = block(it.c, { x: bx, y: y + labelH, cols: it.cc, gap });
      let kinds;
      if (it.g.muted) kinds = Array(it.c).fill("O");
      else if (step.mode === "vote") {
        const [nd, nr] = largestRemainder([it.g.d, it.g.r, Math.max(0, 100 - it.g.d - it.g.r)], it.c);
        kinds = [...Array(nd).fill("D"), ...Array(nr).fill("R"), ...Array(it.c - nd - nr).fill("O")];
      } else kinds = Array(it.c).fill("A");
      pts.forEach((p, k) => dots.push({ ...p, kind: kinds[k] }));
      labels.push({ key: it.g.key, g: it.g, x: x + it.slot / 2, y: y + labelH - 30 });
      x += it.slot + pad;
    });
    y += labelH + rowH + (narrow ? 18 : 26);
  });
  return { W, H: y + 6, dots, labels };
}

function VotersField({ step, narrow, wide }) {
  const layout = useMemo(() => voterLayout(step, narrow, wide), [step, narrow, wide]);
  return (
    <div className="mw-stage mw-voters-stage">
      <svg
        className="mw-voters"
        viewBox={`0 0 ${layout.W} ${layout.H}`}
        role="img"
        aria-label={`${step.title}. ${step.groups
          .map((g) => `${g.label}: ${g.share}% of voters${g.d != null ? `, ${g.d}% voted Democratic and ${g.r}% Republican` : ""}`)
          .join("; ")}.`}
      >
        <text x={layout.W / 2} y={narrow ? 26 : 34} textAnchor="middle" className="mw-voters-title">
          {step.title}
        </text>
        {layout.dots.map((p, i) => (
          <circle key={i} r={narrow ? 5 : 6.4} className={`mw-vdot is-${p.kind}`} style={{ transform: `translate(${p.x}px, ${p.y}px)` }} />
        ))}
        {layout.labels.map((l) => (
          <g key={`${step.id}-${l.key}`} className="mw-vlabels">
            <text x={l.x} y={l.y - 20} textAnchor="middle" className={`mw-vlabel ${l.g.muted ? "is-muted" : ""}`}>
              {l.g.label}
            </text>
            {step.mode === "vote" && l.g.d != null ? (
              <text x={l.x} y={l.y + 2} textAnchor="middle" className="mw-vlabel-sub">
                {l.g.share}% · <tspan className="is-D">D {l.g.d}</tspan> <tspan className="is-R">R {l.g.r}</tspan>
              </text>
            ) : (
              <text x={l.x} y={l.y + 4} textAnchor="middle" className={`mw-vlabel-share ${l.g.muted ? "is-muted" : ""}`}>
                {l.g.share}%
              </text>
            )}
          </g>
        ))}
      </svg>
      <p className="mw-vnote">
        {step.mode === "vote"
          ? "Each dot is 1% of voters. Blue voted Democratic for the House, coral Republican, gray other."
          : "Each dot is 1% of voters, grouped by their answer."}
      </p>
    </div>
  );
}

function ReasonsStory() {
  const narrow = useMedia("(max-width: 680px)");
  const wide = useMedia("(min-width: 1100px)");
  const [refs, active] = useActiveStep(voterSteps.length);
  const step = voterSteps[active] || voterSteps[0];
  return (
    <section className="mw-scrolly is-paper" aria-label="The reasons: voters sorted by their answers">
      <div className="mw-sticky">
        <VotersField step={step} narrow={narrow} wide={wide} />
      </div>
      <div className="mw-steps">
        {voterSteps.map((s, i) => (
          <div key={s.id} className={`mw-step ${i === 0 ? "is-lead" : ""} ${i === voterSteps.length - 1 ? "is-last" : ""}`} data-step={i} ref={(el) => (refs.current[i] = el)}>
            <div className="mw-card">
              <span className="mw-card-step">
                {i + 1} of {voterSteps.length}
              </span>
              {s.text.map((t) => (
                <p key={t.slice(0, 30)}>
                  <Rich text={t} />
                </p>
              ))}
              {s.id === "switchers" && (
                <p className="mw-card-model">
                  Model: {s.groups
                    .filter((g) => g.d != null)
                    .map((g) => `${g.share}% × (${g.d} − ${g.r})`)
                    .join(" + ")}{" "}
                  = D+{impliedMargin(s.groups).toFixed(1)} among {s.groups.filter((g) => g.d != null).reduce((a, g) => a + g.share, 0)}% of voters.
                </p>
              )}
              <Source ids={s.sources} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Chapter 4: the voters (trails) ── */

function TrailChart() {
  const reduced = useReducedMotion();
  const narrow = useMedia("(max-width: 680px)");
  const [sort, setSort] = useState("group");
  const [selected, setSelected] = useState("men-18-29");
  const [ref, seen] = useInView(0.2);
  const stagger = 90;
  const dur = 1300;
  const elapsed = useProgress(seen, dur + stagger * trailGroups.length, reduced);
  const order = useMemo(() => {
    const rows = [...trailGroups];
    if (sort === "shift") rows.sort((p, q) => trailShift(q) - trailShift(p));
    if (sort === "m26") rows.sort((p, q) => q.m26 - p.m26);
    return rows.map((r) => r.key);
  }, [sort]);
  const W = narrow ? 360 : 960;
  const left = narrow ? 10 : 236;
  const right = narrow ? 56 : 104;
  const rowH = narrow ? 76 : 50;
  const top = narrow ? 64 : 62;
  const span = 60;
  const x = (m) => left + ((span - m) / (2 * span)) * (W - left - right);
  const H = top + trailGroups.length * rowH;
  const ticks = narrow ? [-40, 0, 40] : [-40, -20, 0, 20, 40];
  const sel = trailGroups.find((g) => g.key === selected);
  return (
    <figure className="mw-trails" ref={ref}>
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">Exit polls · margin = Democratic share minus Republican share</span>
          <h3>Where each group moved between 2024 and 2026</h3>
          <p>Hollow dot: 2024. Glowing dot: 2026 House vote. Click a row for its values.</p>
        </div>
        <Segments label="Sort rows" options={trailSorts} value={sort} onChange={setSort} />
      </div>
      <svg
        className="mw-trail-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={trailGroups.map((g) => `${g.label}: ${marginLabel(g.m24)} in 2024 (${g.base}), ${marginLabel(g.m26)} in 2026`).join("; ")}
      >
        <defs>
          {trailGroups.map((g) => (
            <linearGradient key={g.key} id={`mw-g-${g.key}`} gradientUnits="userSpaceOnUse" x1={x(g.m24)} x2={x(g.m26)} y1="0" y2="0">
              <stop offset="0%" stopColor={g.m24 >= 0 ? "#6d86ff" : "#f06a45"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={g.m26 >= 0 ? "#6d86ff" : "#f06a45"} />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((m) => (
          <g key={m}>
            <line x1={x(m)} x2={x(m)} y1={top - 24} y2={H - 6} className={m === 0 ? "mw-trail-zero" : "mw-trail-grid"} />
            <text x={x(m)} y={top - 32} textAnchor="middle" className={`mw-trail-axis ${m > 0 ? "is-D" : m < 0 ? "is-R" : ""}`}>
              {marginLabel(m)}
            </text>
          </g>
        ))}
        {trailGroups.map((g, gi) => {
          const idx = order.indexOf(g.key);
          const y = top + idx * rowH + (narrow ? 50 : rowH / 2);
          const x0 = x(g.m24);
          const x1 = x(g.m26);
          const lift = Math.min(18, Math.abs(x1 - x0) * 0.2);
          const cx = (x0 + x1) / 2;
          const d = `M${x0},0 Q${cx},${-lift} ${x1},0`;
          const t = easeOut(Math.max(0, Math.min(1, (elapsed - gi * stagger) / dur)));
          const hx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
          const hy = 2 * (1 - t) * t * -lift;
          const shift = trailShift(g);
          const color = g.m26 >= 0 ? "#6d86ff" : "#f06a45";
          const isSel = selected === g.key;
          return (
            <g
              key={g.key}
              className={`mw-trail-row ${isSel ? "is-active" : ""}`}
              style={{ transform: `translate(0px, ${y}px)` }}
              tabIndex={0}
              role="button"
              aria-pressed={isSel}
              aria-label={`${g.label}: ${shiftLabel(shift)}. Show details.`}
              onClick={() => setSelected(g.key)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelected(g.key))}
            >
              <rect x={0} y={narrow ? -50 : -rowH / 2} width={W} height={rowH} className="mw-trail-hit" />
              {narrow ? (
                <>
                  <text x={left} y={-30} className="mw-trail-label">
                    {g.label}
                  </text>
                  <text x={left} y={-14} className="mw-trail-base">
                    vs {g.base}
                  </text>
                </>
              ) : (
                <>
                  <text x={0} y={-2} className="mw-trail-label">
                    {g.label}
                  </text>
                  <text x={0} y={15} className="mw-trail-base">
                    vs {g.base}
                  </text>
                </>
              )}
              <path d={d} className="mw-trail-glow" stroke={`url(#mw-g-${g.key})`} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - t} />
              <path d={d} className="mw-trail-path" stroke={`url(#mw-g-${g.key})`} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - t} />
              <circle cx={x0} cy={0} r={narrow ? 5 : 6} className="mw-trail-start" />
              <g style={{ transform: `translate(${hx}px, ${hy}px)`, opacity: t > 0 ? 1 : 0 }}>
                <circle r={narrow ? 11 : 13} fill={color} fillOpacity={0.22} />
                <circle r={narrow ? 6 : 7} fill={color} />
              </g>
              <text x={W - right + 14} y={5} className={`mw-trail-value ${shift >= 0 ? "is-D" : "is-R"}`}>
                {signed(shift)}
              </text>
            </g>
          );
        })}
      </svg>
      {sel && (
        <div className="mw-trail-detail" aria-live="polite">
          <div className="mw-td-name">
            <span>Group</span>
            <strong>{sel.label}</strong>
          </div>
          <div>
            <span>2024 ({sel.base.replace("2024 ", "")})</span>
            <strong className={sel.m24 >= 0 ? "is-D" : "is-R"}>{marginLabel(sel.m24)}</strong>
          </div>
          <div>
            <span>2026 House vote</span>
            <strong className={sel.m26 >= 0 ? "is-D" : "is-R"}>{marginLabel(sel.m26)}</strong>
          </div>
          <div>
            <span>Move</span>
            <strong className={trailShift(sel) >= 0 ? "is-D" : "is-R"}>{shiftLabel(trailShift(sel))}</strong>
          </div>
          <p className="mw-td-note">
            {sel.note}
            {sel.share != null ? ` ${sel.share}% of 2026 voters.` : ""} <Source ids={sel.sources} />
          </p>
        </div>
      )}
      <figcaption>
        {narrative.trailCaption} Groups: {Object.values(trailGroupLabels).join(", ")}.
      </figcaption>
      <details className="sp-details mw-details-dark">
        <summary>Read the chart values</summary>
        <table>
          <caption>Margin by group, 2024 baseline and 2026 House vote</caption>
          <thead>
            <tr>
              <th>Group</th>
              <th>2024</th>
              <th>Baseline</th>
              <th>2026</th>
              <th>Move</th>
            </tr>
          </thead>
          <tbody>
            {trailGroups.map((g) => (
              <tr key={g.key}>
                <th>{g.label}</th>
                <td>{marginLabel(g.m24)}</td>
                <td>{g.base}</td>
                <td>{marginLabel(g.m26)}</td>
                <td>{shiftLabel(trailShift(g))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/* ── Chapter 5: the states ── */

function ShiftMap() {
  const reduced = useReducedMotion();
  const narrow = useMedia("(max-width: 680px)");
  const [ref, seen] = useInView(0.2);
  const [selected, setSelected] = useState("TX");
  const detailRef = useRef(null);
  const pick = (st, fromList) => {
    setSelected(st);
    if (fromList && narrow) requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }));
  };
  const races = Object.fromEntries(senateRaces.map((r) => [r.st, r]));
  const sel = races[selected];
  const sorted = useMemo(
    () => [...senateRaces].sort((a, b) => (b.shift ?? -999) - (a.shift ?? -999) || a.st.localeCompare(b.st)),
    [],
  );
  const play = seen && !reduced;
  const arrows = senateRaces
    .filter((r) => r.shift != null)
    .map((r, i) => {
      const st = stateIndex[r.st];
      const len = Math.max(8, Math.min(110, Math.abs(r.shift) * 3.4));
      const dir = r.shift >= 0 ? -1 : 1; // Democratic shifts point left
      const x1 = st.cx + dir * len * 0.87;
      const y1 = st.cy - len * 0.5;
      const ang = (Math.atan2(y1 - st.cy, x1 - st.cx) * 180) / Math.PI;
      return { r, st, x1, y1, ang, len, i, party: r.shift >= 0 ? "D" : "R" };
    });
  const tag = (r) => (r.flip ? `Flipped ${r.from} to ${r.winner}` : r.called ? `${r.winner} hold` : "Uncalled");
  return (
    <div className="sp-atlas mw-states" ref={ref}>
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">35 Senate races · arrows compare each 2026 Senate margin with the 2024 presidential margin</span>
          <h3>How far each Senate state moved</h3>
        </div>
        <span className="sp-asof">As of {asOf}</span>
      </div>
      <div className="mw-states-layout">
        <div>
          <svg className="mw-shiftmap" viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label="Map of the 35 Senate races, with arrows showing each state's shift from the 2024 presidential margin">
            {statesGeo.map((s) => {
              const r = races[s.id];
              const cls = r ? `has-race is-${r.called ? r.winner : "U"} ${r.flip ? "is-flip" : ""} ${selected === s.id ? "is-selected" : ""}` : "";
              return (
                <path
                  key={s.id}
                  d={s.d}
                  className={`mw-sm-state ${cls}`}
                  {...(r
                    ? {
                        tabIndex: 0,
                        role: "button",
                        "aria-label": `${s.name} Senate race. Show details.`,
                        "aria-pressed": selected === s.id,
                        onClick: () => pick(s.id),
                        onKeyDown: (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pick(s.id)),
                      }
                    : { "aria-hidden": true })}
                />
              );
            })}
            {/* Outlines sit above every state fill so neighbors cannot cover them. Selection is a dark
                band underneath; the amber "changed hands" line always stays on top. */}
            <g className="mw-sm-outlines" aria-hidden="true">
              <path d={stateIndex[selected].d} className="mw-sm-sel" data-st={selected} />
              {senateRaces
                .filter((r) => r.flip)
                .map((r) => (
                  <path key={r.st} d={stateIndex[r.st].d} className="mw-sm-flip" data-st={r.st} />
                ))}
            </g>
            {arrows.map((a) => (
              <g key={a.r.st} className={`mw-arrow-g ${selected === a.r.st ? "is-selected" : ""}`} style={{ "--delay": `${a.i * 45}ms` }}>
                <path
                  d={`M${a.st.cx},${a.st.cy} L${a.x1},${a.y1}`}
                  className={`mw-arrow is-${a.party} ${play ? "mw-arrow-draw" : ""}`}
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={seen || reduced ? 0 : 1}
                />
                <path
                  d="M0,-5 L10,0 L0,5 z"
                  className={`mw-arrow-head is-${a.party} ${play ? "mw-arrow-head-in" : ""}`}
                  style={{ transform: `translate(${a.x1}px, ${a.y1}px) rotate(${a.ang}deg)`, opacity: seen || reduced ? 1 : 0 }}
                />
              </g>
            ))}
            {!narrow &&
              senateRaces.map((r) => {
                const st = stateIndex[r.st];
                if (st.box[2] - st.box[0] < 24) return null;
                return (
                  <text key={r.st} x={st.cx} y={st.cy + 16} textAnchor="middle" className="mw-sm-label">
                    {r.st}
                  </text>
                );
              })}
          </svg>
          <div className="sp-legend mw-shift-legend">
            <span>
              <i className="mw-lg-arrow is-D" />
              Moved toward Democrats
            </span>
            <span>
              <i className="mw-lg-arrow is-R" />
              Moved toward Republicans
            </span>
            <span>
              <i className="mw-lg-flip" />
              Seat changed hands
            </span>
            <span>
              <i className="mw-lg-fill is-D" />
              Democratic win
            </span>
            <span>
              <i className="mw-lg-fill is-R" />
              Republican win
            </span>
          </div>
        </div>
        <aside className="sp-company-detail mw-state-detail" aria-live="polite" aria-atomic="true" ref={detailRef}>
          <div className="sp-detail-top">
            <span>{sel.name}</span>
            <span className="sp-model-tag">{tag(sel)}</span>
          </div>
          <div className="mw-sd-race">
            {sel.cands.map((c) => (
              <div key={c.name} className={`mw-sd-cand is-${c.party}`}>
                <b>
                  {c.name} ({c.party})
                </b>
                <em>{c.pct}%</em>
                <div className="mw-sd-bar">
                  <i style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mw-sd-shift">
            <div>
              <span>2024 president</span>
              <strong className={sel.pres24 >= 0 ? "is-D" : "is-R"}>{marginLabel(sel.pres24)}</strong>
            </div>
            <div>
              <span>2026 Senate</span>
              <strong className={sel.m26 >= 0 ? "is-D" : "is-R"}>{marginLabel(sel.m26)}</strong>
            </div>
            <div>
              <span>Shift</span>
              <strong className={sel.shift == null ? "" : sel.shift >= 0 ? "is-D" : "is-R"}>{sel.shift == null ? "n/a" : signed(sel.shift)}</strong>
            </div>
          </div>
          {(sel.note || sel.count) && (
            <p className="mw-sd-note">
              {sel.note} {sel.count ? `${sel.count}.` : ""}
            </p>
          )}
          <Source ids={sel.sources} />
        </aside>
      </div>
      <div className="mw-race-list" role="group" aria-label="Senate races sorted by shift">
        {sorted.map((r) => {
          const w = r.shift == null ? 0 : Math.min(50, Math.abs(r.shift) * 1.7);
          return (
            <button key={r.st} type="button" className={`mw-race-row ${selected === r.st ? "is-selected" : ""}`} aria-pressed={selected === r.st} onClick={() => pick(r.st, true)}>
              <b>{r.st}</b>
              <span className="mw-race-track" aria-hidden="true">
                {r.shift != null && <i className={r.shift >= 0 ? "is-D" : "is-R"} style={r.shift >= 0 ? { right: "50%", width: `${w}%` } : { left: "50%", width: `${w}%` }} />}
              </span>
              <em className={r.shift == null ? "is-none" : r.shift >= 0 ? "is-D" : "is-R"}>
                {r.shift == null ? "Ind." : signed(r.shift)}
                {r.flip && <span className="is-flipped">FLIP</span>}
                {!r.called && <span className="is-open">OPEN</span>}
              </em>
            </button>
          );
        })}
      </div>
      <p className="sp-caption">{narrative.statesCaption} “Ind.” marks races where an independent was the main challenger; “OPEN” marks uncalled races.</p>
      <details className="sp-details">
        <summary>Read the chart values</summary>
        <table>
          <caption>Senate races: 2026 margin, 2024 presidential margin and shift</caption>
          <thead>
            <tr>
              <th>State</th>
              <th>2026 result</th>
              <th>2026 margin</th>
              <th>2024 president</th>
              <th>Shift</th>
            </tr>
          </thead>
          <tbody>
            {senateRaces.map((r) => (
              <tr key={r.st}>
                <th>{r.name}</th>
                <td>{tag(r)}</td>
                <td>{r.comparable ? marginLabel(r.m26) : `Ind. ${signed(r.m26)}`}</td>
                <td>{marginLabel(r.pres24)}</td>
                <td>{r.shift == null ? "n/a" : shiftLabel(r.shift)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

/* ── Chapter 6: the data (Acadia) ── */

const short = (id) => id.replace(/-/g, "_");

function DataStoryDemo() {
  const narrow = useMedia("(max-width: 680px)");
  const [mode, setMode] = useState("file");
  const span = 60;
  const pos = (m) => ((span - m) / (2 * span)) * 100; // Democratic margins plot left
  const story = mode === "story";
  return (
    <figure className={`sp-figure mw-datastory ${story ? "is-story" : ""}`}>
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">The same six rows of exit-poll data</span>
          <h3>{story ? "As a story you can tell" : "As a file you could sell"}</h3>
        </div>
        <Segments
          label="Show the data as"
          options={[
            { value: "file", label: "Sell the file" },
            { value: "story", label: "Tell the story" },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>
      <div className="mw-ds-head">
        <span>group</span>
        <div className="mw-ds-head-cells">
          <div className="mw-ds-head-raw" aria-hidden={story}>
            <span>margin_2024</span>
            <span>margin_2026</span>
            <span>basis</span>
            <span>source</span>
          </div>
          <div className="mw-ds-head-viz" aria-hidden={!story}>
            <span className="is-D">{narrow ? "← Dem." : "← Democratic"}</span>
            <span>Even</span>
            <span className="is-R">{narrow ? "Rep. →" : "Republican →"}</span>
          </div>
        </div>
      </div>
      <div className="mw-ds-grid">
        {dataStoryRows.map((r) => {
          const a = pos(r.m24);
          const b = pos(r.m26);
          const shift = trailShift(r);
          return (
            <div className="mw-ds-row" key={r.key}>
              <span className="mw-ds-name">{r.label}</span>
              <div className="mw-ds-cells">
                <div className="mw-ds-raw" aria-hidden={story}>
                  <span>{r.m24 > 0 ? `+${r.m24.toFixed(1)}` : r.m24.toFixed(1)}</span>
                  <span>{r.m26 > 0 ? `+${r.m26.toFixed(1)}` : r.m26.toFixed(1)}</span>
                  <span>{r.base.includes("House") ? "house_2024" : "pres_2024"}</span>
                  <span>{short(r.sources[0])}</span>
                </div>
                <div className="mw-ds-viz" aria-hidden={!story}>
                  <span className="mw-ds-axis" />
                  <span
                    className="mw-ds-seg"
                    style={{
                      left: `${Math.min(a, story ? b : a)}%`,
                      width: `${story ? Math.abs(b - a) : 0}%`,
                      "--from": b < a ? (r.m26 >= 0 ? "#2447f9" : "#d6502b") : "#c9c4ba",
                      "--to": b < a ? "#c9c4ba" : r.m26 >= 0 ? "#2447f9" : "#d6502b",
                    }}
                  />
                  <span className="mw-ds-dot is-start" style={{ left: `${a}%` }} />
                  <span className={`mw-ds-dot ${r.m26 >= 0 ? "is-D" : "is-R"}`} style={{ left: `${story ? b : a}%` }} />
                  <span className="mw-ds-shift">{signed(shift)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mw-ds-verdict">
        <div className={mode === "file" ? "is-on" : ""}>
          <span>Sold as a file</span>
          <p>{narrative.dataVerdict.file}</p>
        </div>
        <div className={story ? "is-on" : ""}>
          <span>Told as a story</span>
          <p>{narrative.dataVerdict.story}</p>
        </div>
      </div>
      <figcaption>
        Values are the margins used in the trail chart above. <Source ids={[...new Set(dataStoryRows.flatMap((r) => r.sources))]} />
      </figcaption>
    </figure>
  );
}

function DataIdeas() {
  const [choice, setChoice] = useState(dataIdeas[0].id);
  const d = dataIdeas.find((x) => x.id === choice);
  return (
    <div className="mw-ideas">
      <div>
        <p className="mw-ideas-intro">If your company holds…</p>
        <div className="mw-idea-grid" role="group" aria-label="Choose a kind of data">
          {dataIdeas.map((x) => (
            <button key={x.id} type="button" className="mw-idea-btn" aria-pressed={choice === x.id} onClick={() => setChoice(x.id)}>
              <span>{x.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mw-idea-answer" aria-live="polite">
        <div className="mw-idea-head">
          <span>If you hold</span>
          <h3>{d.label}</h3>
        </div>
        <dl>
          <div>
            <dt>The election equivalent</dt>
            <dd>{d.equivalent}</dd>
          </div>
          <div>
            <dt>A story it could tell</dt>
            <dd>{d.story}</dd>
          </div>
          <div>
            <dt>Formats</dt>
            <dd>{d.formats}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/* ── Sources ── */

function downloadData() {
  const data = {
    reviewDate,
    scope:
      "Results as reported through November 7, 2026, with uncalled races marked. Exit polls are surveys with sampling error; comparisons with 2024 use the baseline each outlet reported.",
    house,
    houseFlips,
    chambers,
    popularVote,
    voterSteps,
    trailGroups,
    senateRaces,
    sources,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `acadia-2026-midterms-data-${reviewDate}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Sources() {
  return (
    <section className="sp-source-section" id="study-sources">
      <div className="sp-source-heading">
        <div>
          <span className="sp-section-label">Open notebook</span>
          <h2>Follow every claim.</h2>
        </div>
        <button className="sp-download" type="button" onClick={downloadData}>
          Download data and sources <span aria-hidden="true">↓</span>
        </button>
      </div>
      <div className="sp-methodology">
        <h3>How this feature was researched</h3>
        {narrative.methodology.map((p) => (
          <p key={p.slice(0, 30)}>{p}</p>
        ))}
      </div>
      <ol className="sp-source-list">
        {sources.map((s, i) => (
          <li id={`source-${s.id}`} key={s.id}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.publisher} · {s.title} ↗
              </a>
              <small>{s.date}</small>
              <p>{s.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function MidtermStudy() {
  useEffect(() => {
    if (window.location.hash) {
      requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView());
    } else {
      window.scrollTo(0, 0);
    }
  }, []);
  return (
    <main className="seat-study midterm-study">
      <a className="sp-skip" href="#the-chambers">
        Skip to the results
      </a>
      <NightStory />
      <ChapterNav />
      <div className="sp-body">
        <section className="sp-thesis">
          <div className="sp-thesis-lead">
            <span className="sp-section-label">The question</span>
            <h2>{narrative.thesisTitle}</h2>
          </div>
          <Prose section="thesis" />
        </section>

        <section id="the-chambers" className="sp-section">
          <SectionIntro label="The results" title="Both chambers changed hands." />
          <Prose section="chambers" />
          <ChambersExplorer />
          <PopularVote />
          <div className="sp-takeaway">
            <span>What this establishes</span>
            <p>{narrative.chambersTakeaway}</p>
          </div>
        </section>
      </div>

      <div id="the-reasons" className="mw-reasons-anchor">
        <div className="sp-body">
          <section className="sp-section mw-section-tight">
            <SectionIntro label="Exit polls" title="What voters said they were voting on." />
            <Prose section="reasons" />
          </section>
        </div>
        <ReasonsStory />
      </div>

      <div className="sp-body">
        <section id="the-voters" className="sp-section">
          <SectionIntro label="Exit polls, 2024 and 2026" title="Which voters moved, and how far." />
          <Prose section="voters" />
          <TrailChart />
          <div className="sp-takeaway">
            <span>Try this</span>
            <p>{narrative.votersTry}</p>
          </div>
        </section>

        <section id="the-states" className="sp-section">
          <SectionIntro label="Senate results" title="Where the Senate was won." />
          <Prose section="states" />
          <ShiftMap />
          <div className="sp-counterpoint">
            <span>Keep two numbers separate</span>
            <h3>
              Each arrow compares two different races:
              <br />
              a 2026 Senate race and the 2024 presidential race.
            </h3>
            <p>{narrative.statesCounterpoint}</p>
          </div>
        </section>

        <section id="the-data" className="sp-section">
          <SectionIntro label="For companies that own data" title="Don’t sell the data. Tell the story." />
          <Prose section="data">
            <Link className="sp-inline-link" to="/blog/proprietary-data-content-moat-fintech">
              Related: proprietary data is the only content moat left ↗
            </Link>
          </Prose>
          <DataStoryDemo />
          <DataIdeas />
          <div className="mw-conclusion">
            <SectionIntro label="The answer" title="Why 2026 was a blue tsunami." />
            <Prose section="conclusion" />
          </div>
          <div className="sp-closing">
            <p>
              What story is
              <br />
              your data waiting to tell?
            </p>
          </div>
          <section className="sp-booking" id="book-with-stan" aria-labelledby="sp-booking-title">
            <div className="sp-booking-intro">
              <span className="sp-booking-badge">Free 30 minutes</span>
              <h2 id="sp-booking-title">Talk to Stan.</h2>
              <p>{narrative.booking}</p>
              <a className="sp-booking-button" href="#book-with-stan-calendar">
                Book a free 30-minute meeting <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="sp-booking-calendar" id="book-with-stan-calendar">
              <iframe
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3Ii8CPyA9AI74gpEZSzTaHSb6BCH36Z6ZbCHnTZkmwYuPte1ktffSoh9696AQ9mYcEGu5Odjop?gv=true"
                title="Book a meeting with Stan Altshuller"
                loading="lazy"
              />
            </div>
            <p className="sp-booking-fallback">
              Calendar not loading?{" "}
              <a href="/book" target="_blank" rel="noopener noreferrer">
                Open booking in a new tab
              </a>
              .
            </p>
          </section>
        </section>
        <Sources />
      </div>
    </main>
  );
}
