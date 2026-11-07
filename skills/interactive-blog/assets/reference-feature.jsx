import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  sources,
  forecasts,
  companies,
  linkTypes,
  challengerYears,
  cumulative,
  ladderReleases,
  ladderRungs,
  labor,
  industries,
  tierInfo,
  contentFormats,
  piecesPerMonth,
  companyShare,
  displayShare,
  narrative,
} from "../data/aiJobsResearch";
import "./SeatPricingStudy.css";
import "./AiJobsStudy.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
const sourceMap = Object.fromEntries(sources.map((s) => [s.id, s]));
const chapters = [
  ["the-question", "The question"],
  ["the-forecasts", "The forecasts"],
  ["the-cuts", "The cuts"],
  ["the-trend", "The trend"],
  ["the-rung", "The entry level"],
  ["your-industry", "Your industry"],
  ["the-marketing", "Marketing"],
];

function Source({ ids, children }) {
  return (
    <span className="sp-sources-inline">
      {children || "Source"}:{" "}
      {ids.map((id, i) => (
        <React.Fragment key={id}>
          {i > 0 && " · "}
          <a href={`#source-${id}`}>{sourceMap[id].publisher}</a>
        </React.Fragment>
      ))}
    </span>
  );
}

function Prose({ section, children }) {
  return (
    <div className="sp-prose">
      {narrative[section]?.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
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

function Segments({ label, options, value, onChange, onInteract }) {
  return (
    <div className="sp-segments" role="group" aria-label={label}>
      {options.map((o) => {
        const key = typeof o === "string" ? o : o.value;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={value === key}
            onPointerDown={onInteract}
            onKeyDown={onInteract}
            onClick={() => {
              onInteract?.();
              onChange(key);
            }}
          >
            {typeof o === "string" ? o : o.label}
          </button>
        );
      })}
    </div>
  );
}

function Range({ id, label, value, min, max, step = 1, onChange, display, left, right }) {
  return (
    <div className="sp-range">
      <div className="sp-range-top">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{display || value}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--range-fill": `${((value - min) / (max - min)) * 100}%` }}
      />
      <div className="sp-range-ends">
        <span>{left ?? min}</span>
        <span>{right ?? max}</span>
      </div>
    </div>
  );
}

/* ── Hero: the career ladder, drawn from Stanford's published estimates ── */

const RUNG_X = 168;
const RUNG_W = 330;
const DOTS = 10;

function Ladder({ gap }) {
  const ys = [78, 158, 238, 318, 398];
  const exposedW = RUNG_W * (1 - gap / 100);
  return (
    <svg
      className="aj-ladder"
      viewBox="0 0 600 470"
      role="img"
      aria-label={`Ladder chart. Employment of 22- to 25-year-olds in the most AI-exposed occupations is ${gap}% below less-exposed peers. Older age groups in the same occupations are roughly stable.`}
    >
      <defs>
        <pattern id="aj-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".7" fill="#B7B4AD" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="600" height="470" fill="url(#aj-dots)" opacity=".38" />
      <line x1={RUNG_X - 14} y1="30" x2={RUNG_X - 14} y2="440" className="aj-rail" />
      <line x1={RUNG_X + RUNG_W + 14} y1="30" x2={RUNG_X + RUNG_W + 14} y2="440" className="aj-rail" />
      {ladderRungs.map((r, i) => {
        const y = ys[i];
        const w = r.exposed ? exposedW : RUNG_W;
        const filledDots = r.exposed ? Math.round(DOTS * (1 - gap / 100)) : DOTS;
        return (
          <g key={r.age} className={r.exposed ? "aj-rung is-exposed" : "aj-rung"}>
            <text x={RUNG_X - 30} y={y - 2} textAnchor="end" className="aj-rung-age">
              {r.age}
            </text>
            <text x={RUNG_X - 30} y={y + 18} textAnchor="end" className="aj-rung-stage">
              {r.stage}
            </text>
            {r.exposed && (
              <rect
                x={RUNG_X}
                y={y - 7}
                width={RUNG_W}
                height="14"
                rx="7"
                className="aj-rung-gap"
              />
            )}
            <rect
              x={RUNG_X}
              y={y - 7}
              height="14"
              rx="7"
              className="aj-rung-bar"
              style={{ width: `${w}px` }}
            />
            {Array.from({ length: DOTS }, (_, d) => {
              const cx = RUNG_X + 17 + d * ((RUNG_W - 34) / (DOTS - 1));
              const on = d < filledDots;
              return (
                <circle
                  key={d}
                  cx={cx}
                  cy={y - 22}
                  r="7"
                  className={on ? "aj-person" : "aj-person is-missing"}
                />
              );
            })}
            {r.exposed ? (
              <text x={RUNG_X + RUNG_W + 30} y={y + 6} className="aj-rung-value is-gap">
                {gap === 0 ? "0%" : `−${gap}%`}
              </text>
            ) : (
              <text x={RUNG_X + RUNG_W + 30} y={y + 6} className="aj-rung-value">
                stable
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Hero() {
  const [release, setRelease] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [isPlaying, setIsPlaying] = useState(!reducedMotion);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const ref = useRef(null);
  const timerRef = useRef(null);
  const manualRef = useRef(false);

  function stopAnimation() {
    manualRef.current = true;
    clearTimeout(timerRef.current);
    setIsPlaying(false);
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionChanged = () => {
      setReducedMotion(media.matches);
      if (media.matches) stopAnimation();
    };
    const visibilityChanged = () => setIsPageVisible(!document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(ref.current);
    visibilityChanged();
    media.addEventListener("change", motionChanged);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || reducedMotion || !isInView || !isPageVisible) return;
    const last = ladderReleases.length - 1;
    const delay = release === last ? 3200 : release === 0 ? 1400 : 1700;
    timerRef.current = setTimeout(() => {
      if (!manualRef.current) setRelease((r) => (r === last ? 0 : r + 1));
    }, delay);
    return () => clearTimeout(timerRef.current);
  }, [release, isPlaying, reducedMotion, isInView, isPageVisible]);

  function toggle() {
    if (isPlaying) return stopAnimation();
    manualRef.current = false;
    setRelease(0);
    setIsPlaying(true);
  }

  const r = ladderReleases[release];
  return (
    <header className="sp-hero" id="the-question">
      <div className="sp-hero-meta">
        <Link to="/blog">Acadia insights</Link>
        <span>Interactive research · October 28, 2026</span>
      </div>
      <div className="sp-hero-grid">
        <div className="sp-hero-copy">
          <h1>
            Fewer hires.
            <br />
            More output.
            <br />
            Where did the jobs go?
          </h1>
          <p className="sp-deck">
            Two groups made opposite forecasts about AI and work. The 2026
            layoff data and payroll records now test both.
          </p>
          <p className="sp-byline">
            By Stan Altshuller <span>14 min exploration</span>
          </p>
          <a className="sp-explore-link" href="#the-cuts">
            See who is cutting <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="sp-hero-playground aj-hero-playground" ref={ref}>
          <p className="aj-hero-chart-title">
            AI-exposed occupations: employment by age
          </p>
          <Ladder gap={r.gap} />
          <div className="sp-hero-controls aj-hero-controls">
            <Segments
              label="Study release"
              options={ladderReleases.map((x, i) => ({ value: i, label: x.label }))}
              value={release}
              onChange={setRelease}
              onInteract={stopAnimation}
            />
            <div className="sp-hero-playback">
              <span aria-live={isPlaying ? "off" : "polite"}>
                {r.gap === 0
                  ? r.note
                  : `${r.note}: ages 22–25 are ${r.gap}% below less-exposed peers`}
              </span>
              {!reducedMotion && (
                <button type="button" onClick={toggle}>
                  {isPlaying ? "Pause" : "Play"}
                </button>
              )}
            </div>
            <p>
              <span className="sp-mini-dot aj-dot-ink" />
              Employed
              <span className="sp-mini-dot coral" />
              Gap versus peers
              <span className="sp-example-tag">Measured · ADP payroll data</span>
            </p>
          </div>
        </div>
      </div>
      <div className="sp-hero-bottom">
        <span>U.S. job cuts citing AI, Jan–Sep 2026</span>
        <p>120,136 announced, more than double the 54,836 recorded in all of 2025.</p>
        <a href="#the-trend">See the trend ↗</a>
      </div>
    </header>
  );
}

function ChapterNav() {
  const [active, setActive] = useState("the-question");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-100px 0px -55% 0px" },
    );
    chapters.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
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

/* ── Chapter 2: the forecasts ── */

function ForecastBoard() {
  const [camp, setCamp] = useState("cost");
  const list = forecasts[camp];
  return (
    <figure className="sp-figure aj-forecasts">
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">Public statements, 2024–2026</span>
          <h3>What each camp predicted</h3>
        </div>
        <Segments
          label="Forecast camp"
          options={[
            { value: "cost", label: "AI will cost jobs" },
            { value: "create", label: "AI will create jobs" },
          ]}
          value={camp}
          onChange={setCamp}
        />
      </div>
      <ol className={`aj-forecast-list is-${camp}`} aria-live="polite">
        {list.map((f) => (
          <li key={f.who}>
            <div className="aj-forecast-who">
              <strong>{f.who}</strong>
              <span>{f.role}</span>
              <time>{f.date}</time>
            </div>
            <p>{f.claim}</p>
            <Source ids={[f.source]} />
          </li>
        ))}
      </ol>
      <figcaption>
        Claims are paraphrased from the cited coverage unless shown in quotation
        marks. Forecasts are listed by camp, not ranked.
      </figcaption>
    </figure>
  );
}

function ForecastCheck() {
  const [group, setGroup] = useState("all");
  const max = 22;
  const pos = (v) => `${(v / max) * 100}%`;
  const measured = group === "all" ? labor.unemployment : labor.gradUnemployment;
  return (
    <figure className="sp-figure aj-check">
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">Forecast against measurement</span>
          <h3>The unemployment forecast and the September 2026 rate</h3>
          <p>U.S. unemployment rate, percent</p>
        </div>
        <Segments
          label="Measured group"
          options={[
            { value: "all", label: "All workers" },
            { value: "grads", label: "Recent graduates" },
          ]}
          value={group}
          onChange={setGroup}
        />
      </div>
      <div className="aj-scale" role="img" aria-label={`Forecast band 10% to 20%. Measured: ${measured}%.`}>
        <div className="aj-scale-track" />
        <div
          className="aj-scale-band"
          style={{ left: pos(labor.forecastLow), width: pos(labor.forecastHigh - labor.forecastLow) }}
        >
          <span>Forecast · 10%–20%</span>
        </div>
        <div className="aj-scale-marker" style={{ left: pos(measured) }}>
          <i />
          <strong>{measured}%</strong>
          <span>{group === "all" ? "All workers, Sep 2026" : "Ages 22–27, Q2 2026"}</span>
        </div>
        <div className="aj-scale-ticks" aria-hidden="true">
          {[0, 5, 10, 15, 20].map((t) => (
            <span key={t} style={{ left: pos(t) }}>
              {t}%
            </span>
          ))}
        </div>
      </div>
      <figcaption>
        The forecast band is Dario Amodei’s May 2025 range for U.S. unemployment
        within one to five years. The window has not closed, so this is a
        progress check, not a verdict.{" "}
        <Source ids={["amodei", "bls", "nyfed"]} />
      </figcaption>
    </figure>
  );
}

function WefBars() {
  const rows = [
    { label: "Jobs created", value: 170, cls: "is-created" },
    { label: "Jobs displaced", value: 92, cls: "is-displaced" },
    { label: "Net change", value: 78, cls: "is-net" },
  ];
  return (
    <figure className="sp-figure aj-wef">
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">Employer survey projection, 2025 to 2030</span>
          <h3>The job-creation case in one chart</h3>
          <p>Millions of jobs worldwide</p>
        </div>
      </div>
      {rows.map((r) => (
        <div className="aj-wef-row" key={r.label}>
          <span>{r.label}</span>
          <div className="aj-wef-track">
            <div className={`aj-wef-bar ${r.cls}`} style={{ width: `${(r.value / 170) * 100}%` }}>
              {r.label === "Jobs displaced" ? "−" : r.label === "Net change" ? "+" : ""}
              {r.value}M
            </div>
          </div>
        </div>
      ))}
      <figcaption>
        Projections reported by more than 1,000 employers in 55 economies, covering
        technology and other trends together. These are plans, not measured
        outcomes. <Source ids={["wef"]} />
      </figcaption>
    </figure>
  );
}

/* ── Chapter 3: who is cutting ── */

function Waffle({ share }) {
  const filled = Math.max(share > 0 ? 1 : 0, Math.round(share));
  return (
    <div
      className="aj-waffle"
      role="img"
      aria-label={`${share}% of the workforce. Each square is 1% of employees.`}
    >
      {Array.from({ length: 100 }, (_, i) => (
        <i key={i} className={i < filled ? "is-filled" : ""} />
      ))}
    </div>
  );
}

function LayoffAtlas() {
  const [sort, setSort] = useState("people");
  const [selected, setSelected] = useState("microsoft");
  const [useAlt, setUseAlt] = useState(false);
  const sorted = [...companies].sort((a, b) => {
    if (sort === "share") return (companyShare(b) ?? -1) - (companyShare(a) ?? -1);
    if (sort === "recent") return b.sortDate.localeCompare(a.sortDate);
    return b.people - a.people;
  });
  const maxPeople = Math.max(...companies.map((c) => c.people));
  const c = companies.find((x) => x.id === selected);
  const base = useAlt && c.altBase ? c.altBase : c.base;
  const share = c.base ? displayShare(companyShare(c, base)) : null;
  const type = linkTypes[c.link];
  return (
    <div className="sp-atlas aj-atlas">
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">Announced actions · 8 selected companies</span>
          <h3>Who is cutting, and how deep</h3>
        </div>
        <span className="sp-asof">Reviewed 10/28/2026</span>
      </div>
      <Segments
        label="Sort companies"
        options={[
          { value: "people", label: "Most people" },
          { value: "share", label: "Largest share of workforce" },
          { value: "recent", label: "Most recent" },
        ]}
        value={sort}
        onChange={setSort}
      />
      <div className="aj-atlas-layout">
        <div className="aj-atlas-table">
          <div className="aj-atlas-head">
            <span>Choose a company</span>
            <span>{sort === "share" ? "Share of workforce" : "People affected"}</span>
          </div>
          {sorted.map((x) => {
            const s = displayShare(companyShare(x));
            const width =
              sort === "share" ? (s ?? 0) : (x.people / maxPeople) * 100;
            const label =
              sort === "share" ? (s == null ? "No base published" : `${s}%`) : x.peopleLabel;
            return (
              <button
                type="button"
                key={x.id}
                className={`aj-atlas-row ${selected === x.id ? "is-selected" : ""}`}
                aria-pressed={selected === x.id}
                onClick={() => {
                  setSelected(x.id);
                  setUseAlt(false);
                }}
                aria-label={`${x.name}, ${x.peopleLabel} ${x.peopleNote}${s != null ? `, ${s}% of the ${x.baseLabel}` : ""}. ${linkTypes[x.link].label}. Show details.`}
              >
                <span className="aj-atlas-name">
                  <i style={{ background: linkTypes[x.link].color }} aria-hidden="true" />
                  {x.name}
                  <small>{x.date}</small>
                </span>
                <span className="aj-atlas-bar" aria-hidden="true">
                  <span
                    className={x.kind === "offer" ? "is-offer" : x.kind === "reversed" ? "is-reversed" : ""}
                    style={{ width: `${Math.max(width, 0.6)}%`, background: linkTypes[x.link].color }}
                  />
                  <em>{label}</em>
                </span>
              </button>
            );
          })}
          <div className="sp-legend aj-atlas-legend">
            {Object.entries(linkTypes)
              .filter(([k]) => k !== "reversed")
              .map(([k, v]) => (
                <span key={k}>
                  <i style={{ background: v.color }} />
                  {v.label}
                </span>
              ))}
          </div>
        </div>
        <aside className="sp-company-detail aj-detail" aria-live="polite" aria-atomic="true">
          <div className="sp-detail-top">
            <span>{c.name}</span>
            <span className="aj-type-tag" style={{ color: type.color, borderColor: type.color }}>
              {type.label}
            </span>
          </div>
          <p className="aj-detail-number">
            {c.peopleLabel}
            <small>{c.peopleNote}</small>
          </p>
          {c.altBase && (
            <Segments
              label="Measure against"
              options={[
                { value: "base", label: "Corporate staff" },
                { value: "alt", label: "Whole company" },
              ]}
              value={useAlt ? "alt" : "base"}
              onChange={(v) => setUseAlt(v === "alt")}
            />
          )}
          {share != null ? (
            <div className="aj-detail-share">
              <Waffle share={share} />
              <p>
                <strong>{share}%</strong> of the{" "}
                {useAlt && c.altBase ? c.altBaseLabel : c.baseLabel}
                {c.kind === "offer" && " · eligible, not departing"}
              </p>
            </div>
          ) : (
            <p className="aj-detail-nobase">
              No comparable workforce figure was published for this action.
            </p>
          )}
          <h4>{c.headline}</h4>
          <p>{c.detail}</p>
          <div className="sp-detail-caution">
            <strong>Stated reason</strong>
            <p>{c.stated}</p>
          </div>
          <Source ids={c.sources} />
        </aside>
      </div>
      <p className="sp-caption">
        Announced actions from company statements, filings and press reports.
        These eight show the range of rationales; they are not a census of
        layoffs. Bars compare people affected across companies; the squares show
        each company’s own workforce.
      </p>
    </div>
  );
}

/* ── Chapter 4: the trend ── */

function TrendChart() {
  const [mode, setMode] = useState("year");
  const data = mode === "year" ? challengerYears : cumulative();
  const max = Math.max(...data.map((d) => d.value));
  return (
    <figure className="sp-figure aj-trend">
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">Challenger, Gray & Christmas</span>
          <h3>Announced U.S. job cuts citing AI</h3>
          <p>{mode === "year" ? "Per year" : "Running total since 2023"}</p>
        </div>
        <Segments
          label="Trend view"
          options={[
            { value: "year", label: "Per year" },
            { value: "total", label: "Cumulative" },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>
      <div className="aj-bars" role="img" aria-label={data.map((d) => `${d.year} ${d.period}: ${fmt(d.value)}`).join("; ")}>
        {data.map((d) => (
          <div className="aj-bar-col" key={d.year}>
            <strong>{fmt(d.value)}</strong>
            <div className="aj-bar-well">
              <div
                className={`aj-bar ${d.derived && mode === "year" ? "is-derived" : ""} ${d.year === "2026" ? "is-current" : ""}`}
                style={{ height: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span>{d.year}</span>
            <small>{mode === "year" ? d.period : "through " + (d.year === "2026" ? "Sep" : "Dec")}</small>
          </div>
        ))}
      </div>
      <div className="aj-trend-note">
        <strong>21%</strong>
        <p>of all announced U.S. job cuts from January to September 2026 cited AI (120,136 of 573,195).</p>
      </div>
      <figcaption>
        2023 begins in May, when AI was first tracked as a reason. The 2024 value
        is derived from Challenger’s cumulative totals because no standalone
        figure was published (hatched bar). Announcements, not completed
        separations. <Source ids={["challenger-history", "challenger-dec25", "challenger-aug26", "challenger-sep26"]} />
      </figcaption>
      <details className="sp-details">
        <summary>Read the chart values</summary>
        <table>
          <caption>Announced U.S. job cuts citing AI</caption>
          <thead>
            <tr>
              <th>Year</th>
              <th>Period</th>
              <th>Cuts</th>
              <th>Cumulative</th>
            </tr>
          </thead>
          <tbody>
            {challengerYears.map((d, i) => (
              <tr key={d.year}>
                <th>{d.year}</th>
                <td>{d.period}</td>
                <td>{fmt(d.value)}{d.derived ? " (derived)" : ""}</td>
                <td>{fmt(cumulative()[i].value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/* ── Chapter 5: the entry level ── */

function EntryChart() {
  const [view, setView] = useState("stanford");
  const w = 640;
  const h = 260;
  const pad = { l: 56, r: 56, t: 46, b: 46 };
  const xs = ladderReleases.map(
    (_, i) => pad.l + (i * (w - pad.l - pad.r)) / (ladderReleases.length - 1),
  );
  const y = (g) => pad.t + (g / 25) * (h - pad.t - pad.b);
  return (
    <figure className="sp-figure aj-entry">
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">Payroll and survey data</span>
          <h3>{view === "stanford" ? "The gap for young workers in exposed jobs" : "Recent graduates against all workers"}</h3>
          <p>
            {view === "stanford"
              ? "Employment of ages 22–25 in the most AI-exposed occupations, versus less-exposed peers"
              : "Unemployment rate, percent"}
          </p>
        </div>
        <Segments
          label="Entry-level measure"
          options={[
            { value: "stanford", label: "AI-exposed jobs, ages 22–25" },
            { value: "grads", label: "Recent college graduates" },
          ]}
          value={view}
          onChange={setView}
        />
      </div>
      {view === "stanford" ? (
        <svg
          className="aj-line"
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={ladderReleases.map((r) => `${r.label}: ${r.gap}% below peers`).join("; ")}
        >
          {[0, 5, 10, 15, 20, 25].map((g) => (
            <g key={g}>
              <line x1={pad.l} x2={w - pad.r} y1={y(g)} y2={y(g)} className="aj-grid" />
              <text x={pad.l - 10} y={y(g) + 4} textAnchor="end" className="aj-axis">
                {g === 0 ? "0" : `−${g}%`}
              </text>
            </g>
          ))}
          <polyline
            points={ladderReleases.map((r, i) => `${xs[i]},${y(r.gap)}`).join(" ")}
            className="aj-line-path"
          />
          {ladderReleases.map((r, i) => (
            <g key={r.label}>
              <circle cx={xs[i]} cy={y(r.gap)} r="7" className="aj-line-point" />
              <text
                x={xs[i]}
                y={y(r.gap) - 16}
                textAnchor="middle"
                className={r.gap === 0 ? "aj-line-label is-base" : "aj-line-label"}
              >
                {r.gap === 0 ? "Baseline" : `−${r.gap}%`}
              </text>
              <text x={xs[i]} y={h - 18} textAnchor="middle" className="aj-axis">
                {r.label}
              </text>
            </g>
          ))}
        </svg>
      ) : (
        <div className="aj-grads">
          {[
            { label: "All U.S. workers", sub: "September 2026", value: labor.unemployment, cls: "" },
            { label: "Recent graduates, ages 22–27", sub: "Q2 2026", value: labor.gradUnemployment, cls: "is-grads" },
          ].map((r) => (
            <div className="aj-grads-row" key={r.label}>
              <span>
                {r.label}
                <small>{r.sub}</small>
              </span>
              <div className="aj-grads-track">
                <div className={`aj-grads-bar ${r.cls}`} style={{ width: `${(r.value / 8) * 100}%` }}>
                  {r.value}%
                </div>
              </div>
            </div>
          ))}
          <div className="aj-grads-stat">
            <strong>{labor.gradUnderemployment}%</strong>
            <p>of recent graduates are underemployed, working in jobs that do not require a degree.</p>
          </div>
        </div>
      )}
      <figcaption>
        {view === "stanford"
          ? "Published estimates from successive versions of the paper. Methods were revised between versions, so treat the points as releases, not a single consistent series. Experienced workers in the same occupations were stable."
          : "Recent graduates now have a higher unemployment rate than the workforce as a whole. The New York Fed attributes a majority of the recent rise in youth unemployment to remote work."}{" "}
        <Source ids={view === "stanford" ? ["stanford"] : ["bls", "nyfed", "nyfed-remote"]} />
      </figcaption>
    </figure>
  );
}

/* ── Chapter 6: your industry ── */

function IndustryExplorer() {
  const [choice, setChoice] = useState("software");
  const d = industries.find((x) => x.id === choice);
  const tier = tierInfo[d.tier];
  return (
    <div className="aj-industry">
      <div className="aj-industry-grid" role="group" aria-label="Choose an industry">
        {industries.map((x) => (
          <button
            type="button"
            key={x.id}
            aria-pressed={choice === x.id}
            className={`aj-industry-btn is-${x.tier}`}
            onClick={() => setChoice(x.id)}
          >
            <span>{x.label}</span>
            <i aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <b key={n} className={n <= tierInfo[x.tier].level ? "is-on" : ""} />
              ))}
            </i>
          </button>
        ))}
      </div>
      <div className="aj-industry-answer" aria-live="polite">
        <div className="aj-industry-head">
          <span>AI applicability</span>
          <h3>{tier.label}</h3>
          <div className={`aj-tier is-${d.tier}`} aria-hidden="true">
            {[1, 2, 3].map((n) => (
              <b key={n} className={n <= tier.level ? "is-on" : ""} />
            ))}
          </div>
        </div>
        <dl>
          <div>
            <dt>What the occupational data shows</dt>
            <dd>{d.exposure}</dd>
          </div>
          <div>
            <dt>What companies are doing</dt>
            <dd>{d.signal}</dd>
          </div>
          <div>
            <dt>Where the gains are</dt>
            <dd>{d.move}</dd>
          </div>
        </dl>
        <Source ids={d.sources} />
      </div>
    </div>
  );
}

/* ── Chapter 7: marketing ── */

function PublishingModel() {
  const [format, setFormat] = useState("article");
  const [hours, setHours] = useState(6);
  const f = contentFormats.find((x) => x.id === format);
  const before = piecesPerMonth(hours, f.before);
  const after = piecesPerMonth(hours, f.after);
  const cap = 40;
  return (
    <div className="sp-simulator aj-publish">
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">Illustrative model · Acadia planning estimates</span>
          <h3>How much can one team publish each month?</h3>
        </div>
      </div>
      <div className="aj-publish-layout">
        <div className="aj-publish-controls">
          <Segments
            label="Content format"
            options={contentFormats.map((x) => ({ value: x.id, label: x.label }))}
            value={format}
            onChange={setFormat}
          />
          <Range
            id="aj-hours"
            label="Hours per week spent on content"
            value={hours}
            min={2}
            max={20}
            onChange={setHours}
            display={`${hours} hours`}
            left="2 hours"
            right="20 hours"
          />
          <table className="aj-publish-assumptions">
            <caption>Hours per piece</caption>
            <tbody>
              <tr>
                <th>Before AI</th>
                <td>{f.before}</td>
              </tr>
              <tr>
                <th>With AI</th>
                <td>{f.after}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="aj-publish-results" aria-live="polite">
          {[
            { label: "Before AI", value: before, cls: "is-before" },
            { label: "With AI", value: after, cls: "is-after" },
          ].map((r) => (
            <div className={`aj-publish-row ${r.cls}`} key={r.label}>
              <div className="aj-publish-number">
                <strong>{r.value}</strong>
                <span>
                  {r.label}
                  <small>{f.label.toLowerCase()}s per month</small>
                </span>
              </div>
              <div className="aj-publish-squares" aria-hidden="true">
                {Array.from({ length: Math.min(r.value, cap) }, (_, i) => (
                  <i key={i} />
                ))}
                {r.value > cap && <em>+{r.value - cap}</em>}
                {r.value === 0 && <em>Less than one per month</em>}
              </div>
            </div>
          ))}
          <p className="aj-publish-cadence">
            {after * 12 >= 52
              ? `With AI, ${hours} hours a week supports at least one ${f.label.toLowerCase()} every week.`
              : `With AI, ${hours} hours a week supports ${after} per month. A weekly cadence needs 5 per month: add hours or choose a lighter format.`}
          </p>
        </div>
      </div>
      <p className="sp-caption">
        Pieces per month = weekly hours × 52 ÷ 12 ÷ hours per piece, rounded
        down. Hours cover research, drafting, editing and production. Strategy,
        approvals and distribution are excluded. These are Acadia’s working
        estimates, not a study.
      </p>
    </div>
  );
}

function downloadData() {
  const data = {
    reviewDate: "2026-10-28",
    scope:
      "Announced employer actions and published research. Not a census of layoffs; AI citations are employer-reported reasons, not causal estimates.",
    companies,
    forecasts,
    challengerYears,
    ladderReleases,
    labor,
    industries,
    contentFormats,
    sources,
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "acadia-ai-jobs-research-2026-10-28.json";
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
          Download data & sources <span aria-hidden="true">↓</span>
        </button>
      </div>
      <div className="sp-methodology">
        <h3>How this feature was researched</h3>
        <p>
          We reviewed company announcements, regulatory filings, Challenger, Gray
          & Christmas job-cut reports, Bureau of Labor Statistics releases, New
          York Fed data and peer-reviewed or working-paper research on October
          28, 2026. The eight companies were selected to show the range of
          stated rationales, not to estimate the total number of layoffs.
        </p>
        <p>
          An employer citing AI is not proof that AI caused a cut, and announced
          cuts are not completed separations. Where a company published its own
          percentage, we use it; otherwise percentages are calculated from the
          stated workforce. No figure here measures AI’s net effect on total
          employment.
        </p>
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

export default function AiJobsStudy() {
  useEffect(() => {
    if (window.location.hash) {
      requestAnimationFrame(() =>
        document.getElementById(window.location.hash.slice(1))?.scrollIntoView(),
      );
    } else {
      window.scrollTo(0, 0);
    }
  }, []);
  return (
    <main className="seat-study jobs-study">
      <a className="sp-skip" href="#the-forecasts">
        Skip to research
      </a>
      <Hero />
      <ChapterNav />
      <div className="sp-body">
        <section className="sp-thesis">
          <div className="sp-thesis-lead">
            <span className="sp-section-label">The announcements</span>
            <h2>The forecasts are now meeting the data.</h2>
          </div>
          <Prose section="thesis">
            <Link className="sp-inline-link" to="/blog/one-person-ten-agents-what-is-a-seat">
              Related: One person, ten agents, what is a seat? ↗
            </Link>
          </Prose>
        </section>

        <section id="the-forecasts" className="sp-section">
          <SectionIntro label="The debate" title="Two opposing camps." />
          <Prose section="forecasts" />
          <ForecastBoard />
          <div className="aj-pair">
            <ForecastCheck />
            <WefBars />
          </div>
          <div className="sp-takeaway">
            <span>What this establishes</span>
            <p>
              The displacement forecasts used specific numbers. Seventeen months
              later, U.S. unemployment is 4.2%, well below the forecast range.
              The forecast window remains open.
            </p>
          </div>
        </section>

        <section id="the-cuts" className="sp-section">
          <SectionIntro label="Company announcements" title="Who is cutting, and how deep." />
          <Prose section="cuts" />
          <LayoffAtlas />
          <div className="sp-counterpoint">
            <span>Keep two numbers separate</span>
            <h3>
              An eligible pool is not a departure count.
              <br />
              A percentage depends on its denominator.
            </h3>
            <p>
              Microsoft’s 60,000 is the number of people offered an exit. Amazon’s
              30,000 is 9% of corporate staff and 2% of the company. Use the
              “Whole company” toggle on Amazon above to compare.
            </p>
          </div>
        </section>

        <section id="the-trend" className="sp-section">
          <SectionIntro label="Announced cuts citing AI" title="Employers cite AI more often each year." />
          <Prose section="trend" />
          <TrendChart />
          <div className="sp-takeaway">
            <span>Try this</span>
            <p>
              Switch to the cumulative view. More job cuts have cited AI in the
              first nine months of 2026 than in 2023, 2024 and 2025 combined.
            </p>
          </div>
        </section>

        <section id="the-rung" className="sp-section">
          <SectionIntro label="Payroll evidence" title="The effect is concentrated at the entry level." />
          <Prose section="rung" />
          <EntryChart />
          <div className="sp-reading-pair">
            <div>
              <h3>Fewer hires, not more layoffs.</h3>
              <p>
                The Stanford researchers find the gap operates mainly through
                reduced hiring of young workers. Employment of experienced
                workers in the same occupations remained stable.
              </p>
              <Source ids={["stanford"]} />
            </div>
            <div>
              <h3>AI is one cause among several.</h3>
              <p>
                The New York Fed estimates remote work can account for{" "}
                {labor.remoteShare}% of the recent rise in youth unemployment.
                The remaining share leaves room for other causes, including AI.
              </p>
              <Source ids={["nyfed-remote"]} />
            </div>
          </div>
        </section>

        <section id="your-industry" className="sp-section">
          <SectionIntro label="Occupational exposure" title="What AI efficiency means for your industry." />
          <Prose section="industry" />
          <IndustryExplorer />
        </section>

        <section id="the-marketing" className="sp-section">
          <SectionIntro
            label="Our industry"
            title="When production gets cheaper, publishing becomes a choice."
          />
          <Prose section="marketing" />
          <PublishingModel />
          <Prose section="conclusion" />
          <div className="sp-closing">
            <p>
              What do AI efficiencies
              <br />
              mean for your industry?
            </p>
          </div>
          <section className="sp-booking" id="book-with-stan" aria-labelledby="sp-booking-title">
            <div className="sp-booking-intro">
              <span className="sp-booking-badge">Free 30 minutes</span>
              <h2 id="sp-booking-title">Grab time with Stan.</h2>
              <p>
                Thirty minutes, no sales pressure. We will look at what AI changes
                in your market and what a weekly publishing plan would take for
                your team.
              </p>
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
