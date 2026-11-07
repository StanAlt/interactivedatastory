import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  sources,
  usageData,
  vendors,
  timeline,
  narrative,
  calculateScenario,
  calculateMeters,
} from "../data/seatPricingResearch";
import "./SeatPricingStudy.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
const money = (n) => `$${fmt(n)}`;
const sourceMap = Object.fromEntries(sources.map((s) => [s.id, s]));
const chapters = [
  ["the-question", "The question"],
  ["the-evidence", "The evidence"],
  ["the-market", "The market"],
  ["the-bill", "The bill"],
  ["the-meter", "The meter"],
  ["the-answer", "The answer"],
];
const colors = {
  automation: "#2447F9",
  augmentation: "#D6502B",
  other: "#D9D5CD",
  seats: "#D6502B",
  usage: "#2447F9",
  hybrid: "#177E89",
};

function Source({ ids, children }) {
  return (
    <span className="sp-sources-inline">
      {children || "Source"}:{" "}
      {ids.map((id, i) => (
        <React.Fragment key={id}>
          {i > 0 && " · "}
          <a href={sourceMap[id].url} target="_blank" rel="noopener noreferrer">
            {sourceMap[id].publisher}
            <span className="sp-sr">: {sourceMap[id].title}</span> ↗
          </a>
        </React.Fragment>
      ))}
    </span>
  );
}

function Prose({ section, children }) {
  return (
    <div className="sp-prose">
      {narrative[section]?.map((p) => (
        <p key={p.slice(0, 35)}>{p}</p>
      ))}
      {children}
    </div>
  );
}

function SectionIntro({ label, title, children }) {
  return (
    <div className="sp-section-intro">
      <p className="sp-section-label">{label}</p>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function Segments({ label, options, value, onChange }) {
  return (
    <div className="sp-segments" role="group" aria-label={label}>
      {options.map((o) => {
        const key = typeof o === "string" ? o : o.value;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={value === key}
            onClick={() => onChange(key)}
          >
            {typeof o === "string" ? o : o.label}
          </button>
        );
      })}
    </div>
  );
}

function Range({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
  left,
  right,
  onInteract,
}) {
  return (
    <div className="sp-range">
      <div className="sp-range-top">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} aria-live={onInteract ? "off" : undefined}>
          {display || value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={onInteract}
        onFocus={onInteract}
        onKeyDown={onInteract}
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

function Chair() {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse
        cx="0"
        cy="58"
        rx="42"
        ry="5"
        fill="currentColor"
        opacity=".08"
        stroke="none"
      />
      <path d="M0 16V39 M0 39L-32 50 M0 39L32 50 M0 39V54 M0 39L-20 33 M0 39L20 33" />
      <path
        d="M-25-49 Q0-59 25-49 L29-16 Q30-5 19-3 H-19 Q-30-5-29-16Z"
        className="sp-chair-cushion"
      />
      <path
        d="M-19-43 Q0-50 19-43 M-22-18 Q0-11 22-18"
        strokeWidth="1.5"
        opacity=".5"
      />
      <path d="M-39-14V6L-29 10 M39-14V6L29 10" />
      <path d="M-45-15H-30 M30-15H45" strokeWidth="5" />
      <path
        d="M-34 2 Q0-8 34 2 L31 13 Q0 22-31 13Z"
        className="sp-chair-cushion"
      />
      <path d="M-27 5Q0-1 27 5" strokeWidth="1.5" opacity=".5" />
      <g fill="currentColor" stroke="none">
        <rect x="-37" y="49" width="10" height="6" rx="3" />
        <rect x="27" y="49" width="10" height="6" rx="3" />
        <rect x="-5" y="53" width="10" height="6" rx="3" />
        <rect x="-24" y="31" width="8" height="5" rx="2.5" />
        <rect x="16" y="31" width="8" height="5" rx="2.5" />
      </g>
    </g>
  );
}

function Hero() {
  const [agents, setAgents] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [isPlaying, setIsPlaying] = useState(!reducedMotion);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const playgroundRef = useRef(null);
  const timerRef = useRef(null);
  const directionRef = useRef(1);
  const manualControlRef = useRef(false);

  function stopAnimation() {
    // Cancel synchronously so a queued tick cannot fight a pointer or key event.
    manualControlRef.current = true;
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
    observer.observe(playgroundRef.current);
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
    if (agents === 12) directionRef.current = -1;
    if (agents === 1) directionRef.current = 1;
    const delay = agents === 12 ? 1800 : agents === 1 ? 1100 : 480;
    timerRef.current = setTimeout(() => {
      if (!manualControlRef.current)
        setAgents((value) => value + directionRef.current);
    }, delay);
    return () => clearTimeout(timerRef.current);
  }, [agents, isPlaying, reducedMotion, isInView, isPageVisible]);

  function toggleAnimation() {
    if (isPlaying) {
      stopAnimation();
      return;
    }
    manualControlRef.current = false;
    directionRef.current = 1;
    setAgents(1);
    setIsPlaying(true);
  }
  const jobs = [
    "Research",
    "Reconcile",
    "Monitor",
    "Enrich",
    "Summarize",
    "Validate",
    "Classify",
    "Compare",
    "Draft",
    "Route",
    "Review",
    "Report",
  ];
  return (
    <header className="sp-hero" id="the-question">
      <div className="sp-hero-meta">
        <Link to="/blog">Acadia insights</Link>
        <span>Interactive research · October 8, 2026</span>
      </div>
      <div className="sp-hero-grid">
        <div className="sp-hero-copy">
          <h1>
            One person.
            <br />
            Ten agents.
            <br />
            What is a seat?
          </h1>
          <p className="sp-deck">
            Software learned to do the work.
            <br />
            Its oldest pricing model still counts the people.
          </p>
          <p className="sp-byline">
            By Stan Altshuller <span>12 min exploration</span>
          </p>
          <a className="sp-explore-link" href="#the-evidence">
            Follow the evidence <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="sp-hero-playground" ref={playgroundRef}>
          <svg
            className={`sp-orbit${agents === 12 ? " is-complete" : ""}`}
            viewBox="0 0 600 470"
            role="img"
            aria-label={`Illustration: one seat supervises ${agents} software ${agents === 1 ? "agent" : "agents"}. This is a conceptual example, not measured productivity.`}
          >
            <defs>
              <radialGradient id="sp-seat-light">
                <stop offset="40%" stopColor="#F6A831" stopOpacity=".5" />
                <stop offset="100%" stopColor="#F6A831" stopOpacity="0" />
              </radialGradient>
              <pattern
                id="sp-dots"
                width="18"
                height="18"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r=".7" fill="#B7B4AD" />
              </pattern>
            </defs>
            <rect
              x="0"
              y="0"
              width="600"
              height="470"
              fill="url(#sp-dots)"
              opacity=".38"
            />
            <ellipse
              cx="300"
              cy="225"
              rx="212"
              ry="173"
              fill="none"
              stroke="#CAC7BF"
              strokeDasharray="3 7"
            />
            {jobs.map((job, i) => {
              const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
              const x = 300 + Math.cos(a) * 212,
                y = 225 + Math.sin(a) * 173;
              const active = i < agents;
              return (
                <g
                  key={job}
                  className={`sp-agent-node ${active ? "is-active" : ""}`}
                >
                  <path
                    d={`M300 225 Q${300 + Math.cos(a) * 90} ${225 + Math.sin(a) * 55} ${x} ${y}`}
                    stroke={active ? "#2447F9" : "#CCC8BF"}
                    strokeWidth={active ? 1.5 : 1}
                    opacity={active ? 0.6 : 0.3}
                    fill="none"
                  />
                  <rect
                    x={x - 28}
                    y={y - 23}
                    width="56"
                    height="46"
                    rx="13"
                    fill={active ? "#2447F9" : "#FAF6EF"}
                    stroke={active ? "#2447F9" : "#CCC8BF"}
                  />
                  <path
                    d={`M${x - 9} ${y - 5} L${x - 14} ${y} ${x - 9} ${y + 5} M${x + 9} ${y - 5} L${x + 14} ${y} ${x + 9} ${y + 5} M${x + 3} ${y - 9} L${x - 3} ${y + 9}`}
                    stroke={active ? "white" : "#CCC8BF"}
                    strokeWidth="2"
                    fill="none"
                  />
                  <text
                    x={x}
                    y={y + 40}
                    textAnchor="middle"
                    fill={active ? "#22366E" : "#817D73"}
                  >
                    {job}
                  </text>
                </g>
              );
            })}
            <circle
              className="sp-seat-halo"
              cx="300"
              cy="225"
              r="110"
              fill="url(#sp-seat-light)"
            />
            <circle
              className="sp-seat-ring"
              cx="300"
              cy="225"
              r="90"
              fill="none"
              stroke="#EAA130"
            />
            <g className="sp-seat">
              <circle
                className="sp-seat-disc"
                cx="300"
                cy="225"
                r="83"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <g transform="translate(300 207)">
                <Chair />
              </g>
              <text x="300" y="287" textAnchor="middle" className="sp-seat-tag">
                One seat
              </text>
            </g>
          </svg>
          <div className="sp-hero-controls">
            <Range
              id="sp-agents"
              label="Agents this person directs"
              value={agents}
              min={1}
              max={12}
              onInteract={stopAnimation}
              onChange={(value) => {
                stopAnimation();
                setAgents(value);
              }}
              left="1 agent"
              right="12 agents"
            />
            <div className="sp-hero-playback">
              <span aria-live={isPlaying ? "off" : "polite"}>
                {agents === 12
                  ? "All 12 agents connected"
                  : isPlaying
                    ? "Watch the agents join in"
                    : "You’re in control"}
              </span>
              {!reducedMotion && (
                <button type="button" onClick={toggleAnimation}>
                  {isPlaying ? "Pause animation" : "Play animation"}
                </button>
              )}
            </div>
            <p>
              <span className="sp-mini-dot coral" />
              People: <strong>1</strong>
              <span className="sp-mini-dot blue" />
              Agents: <strong>{agents}</strong>
              <span className="sp-example-tag">Conceptual illustration</span>
            </p>
          </div>
        </div>
      </div>
      <div className="sp-hero-bottom">
        <span>What replaces the seat?</span>
        <p>Consumption. Actions. Outcomes. Or a more useful combination.</p>
        <a href="#the-market">Explore 9 companies ↗</a>
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
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? "location" : undefined}
          >
            <span>{i + 1}</span>
            {title}
          </a>
        ))}
      </div>
    </nav>
  );
}

function UsageChart() {
  const [period, setPeriod] = useState(3);
  const d = usageData[period];
  const rows = [
    {
      name: "Claude.ai",
      desc: "The chat interface",
      auto: d.automation,
      aug: d.augmentation,
      other: d.other,
    },
    {
      name: "First-party API",
      desc: "Models inside applications",
      auto: d.apiAutomation,
      aug: d.apiAugmentation,
      other: d.apiOther,
    },
  ];
  return (
    <figure className="sp-figure sp-usage-figure">
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">Observed usage</span>
          <h3>Same provider. Different ways of working.</h3>
          <p>Share of sampled interactions by collaboration mode</p>
        </div>
        <strong className="sp-chart-date">{d.period}</strong>
      </div>
      <Segments
        label="Usage sample period"
        options={usageData.map((x, i) => ({ label: x.period, value: i }))}
        value={period}
        onChange={setPeriod}
      />
      <div className="sp-usage-axis">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      {rows.map((row) => (
        <div className="sp-usage-row" key={row.name}>
          <div className="sp-usage-label">
            <h4>{row.name}</h4>
            <span>{row.desc}</span>
          </div>
          {row.auto == null ? (
            <div className="sp-no-data">
              No comparable API sample in this report for {d.period}.
            </div>
          ) : (
            <div
              className="sp-stacked"
              role="img"
              aria-label={`${row.name}: ${row.auto}% automation, ${row.aug}% augmentation, ${row.other}% residual.`}
            >
              <div className="sp-stack-auto" style={{ width: `${row.auto}%` }}>
                {row.auto}%<small>Automation</small>
              </div>
              <div className="sp-stack-aug" style={{ width: `${row.aug}%` }}>
                {row.aug}%
                <small>{row.aug > 20 ? "Augmentation" : "Aug."}</small>
              </div>
              <div
                className="sp-stack-other"
                style={{ width: `${row.other}%` }}
              >
                <span>{row.other > 7 ? `${row.other}%` : ""}</span>
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="sp-legend">
        <span>
          <i style={{ background: colors.automation }} />
          Automation: delegate the task
        </span>
        <span>
          <i style={{ background: colors.augmentation }} />
          Augmentation: work together
        </span>
        <span>
          <i style={{ background: colors.other }} />
          Residual categories
        </span>
      </div>
      <figcaption>
        Historical samples, not an October 2026 market estimate. Rounded shares
        from the January 2026 report’s consistent series. API data is available
        here only for August and November. These are interaction patterns, not
        jobs lost. <Source ids={["anthropic"]} />
      </figcaption>
      <details className="sp-details">
        <summary>Read the chart values</summary>
        <table>
          <caption>Automation, augmentation and residual shares (%)</caption>
          <thead>
            <tr>
              <th>Sample</th>
              <th>Chat automation</th>
              <th>Chat augmentation</th>
              <th>API automation</th>
              <th>API augmentation</th>
            </tr>
          </thead>
          <tbody>
            {usageData.map((x) => (
              <tr key={x.period}>
                <th>{x.period}</th>
                <td>{x.automation}</td>
                <td>{x.augmentation}</td>
                <td>{x.apiAutomation ?? "Not reported"}</td>
                <td>{x.apiAugmentation ?? "Not reported"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

function IntelligenceCost() {
  const [era, setEra] = useState("2024");
  const tokens = era === "2022" ? 1 : 20 / 0.07;
  return (
    <figure className="sp-cost-figure">
      <div className="sp-cost-copy">
        <span className="sp-data-type">A change in the economics</span>
        <h3>What could $20 buy?</h3>
        <p>
          At a fixed benchmark level, the inference needed for more work became
          about 286 times cheaper.
        </p>
        <Segments
          label="Inference cost date"
          options={[
            { value: "2022", label: "Nov 2022" },
            { value: "2024", label: "Oct 2024" },
          ]}
          value={era}
          onChange={setEra}
        />
        <div className="sp-cost-number" aria-live="polite">
          {fmt(tokens)}
          <span>million tokens</span>
        </div>
        <p className="sp-cost-rate">
          {era === "2022" ? "$20.00" : "$0.07"} per million tokens
        </p>
      </div>
      <div
        className="sp-token-field"
        role="img"
        aria-label={`${fmt(tokens)} million tokens for twenty dollars; each square represents approximately one million tokens.`}
      >
        {Array.from({ length: 286 }, (_, i) => (
          <i key={i} className={i < Math.round(tokens) ? "is-filled" : ""} />
        ))}
        <p>Each square ≈ 1 million tokens</p>
      </div>
      <figcaption>
        GPT-3.5-level performance on MMLU. About 286× more tokens for the same
        money, calculated from two published prices. This does not measure all
        model costs, agent reliability or end-to-end ROI.{" "}
        <Source ids={["stanford"]} />
      </figcaption>
    </figure>
  );
}

const meterNames = ["Seats", "Actions", "Executions", "Compute", "Outcomes"];
function PricingAtlas() {
  const [filter, setFilter] = useState("All companies");
  const [selected, setSelected] = useState("salesforce");
  const visible = vendors.filter(
    (v) => filter === "All companies" || v.group === filter,
  );
  const v = vendors.find((x) => x.id === selected);
  function changeFilter(value) {
    setFilter(value);
    const next = vendors.filter(
      (x) => value === "All companies" || x.group === value,
    );
    if (!next.some((x) => x.id === selected)) setSelected(next[0].id);
  }
  return (
    <div className="sp-atlas">
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">
            Public pricing review · 9 selected vendors
          </span>
          <h3>The new pricing map</h3>
        </div>
        <span className="sp-asof">Reviewed 10/8/2026</span>
      </div>
      <Segments
        label="Company group"
        options={[
          "All companies",
          "Established SaaS",
          "Agent & workflow platforms",
        ]}
        value={filter}
        onChange={changeFilter}
      />
      <div className="sp-atlas-layout">
        <div className="sp-atlas-table">
          <div className="sp-atlas-head">
            <span>Choose a company</span>
            {meterNames.map((m) => (
              <span key={m} title={m}>
                {m === "Executions" ? "Runs" : m === "Outcomes" ? "Results" : m}
              </span>
            ))}
          </div>
          {visible.map((x) => (
            <button
              type="button"
              key={x.id}
              className={`sp-atlas-row ${selected === x.id ? "is-selected" : ""}`}
              onClick={() => setSelected(x.id)}
              aria-pressed={selected === x.id}
              aria-label={`${x.name}, ${x.product}. Documented meters: ${x.meters.join(", ")}. Show details.`}
            >
              <span className="sp-company-name">
                {x.name}
                <small>{x.product}</small>
              </span>
              {meterNames.map((m) => (
                <span key={m} className="sp-meter-cell" aria-hidden="true">
                  {x.meters.includes(m) ? (
                    <i
                      className={
                        m === "Seats"
                          ? "sp-dot-seat"
                          : m === "Outcomes"
                            ? "sp-dot-outcome"
                            : "sp-dot-work"
                      }
                    />
                  ) : (
                    <span className="sp-empty-dot">–</span>
                  )}
                </span>
              ))}
            </button>
          ))}
          <p className="sp-table-note">
            Runs = workflow executions; results = billed outcomes. Dots indicate
            a documented meter in the product family, not necessarily one plan.
            A dash makes no claim about every contract.
          </p>
        </div>
        <aside
          className="sp-company-detail"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="sp-detail-top">
            <span>{v.name}</span>
            <span className="sp-model-tag">{v.primary}</span>
          </div>
          <p className="sp-detail-price">
            {v.rate}
            <small>{v.unit}</small>
          </p>
          <h4>{v.headline}</h4>
          <p>{v.description}</p>
          <div className="sp-detail-caution">
            <strong>Read the fine print</strong>
            <p>{v.caution}</p>
          </div>
          <span className="sp-transition-label">{v.transition}</span>
          <Source ids={v.sourceIds} />
        </aside>
      </div>
      <p className="sp-caption">
        Public list terms and dated announcements. Taxes, discounts,
        implementation and additional services excluded. These examples
        illustrate choices; they do not estimate the prevalence of any pricing
        model.
      </p>
    </div>
  );
}

function MigrationTimeline() {
  return (
    <div className="sp-migration">
      <h3>This is already in the contracts.</h3>
      <p>
        The documented changes add meters or change how spend is allocated. They
        do not amount to wholesale abolition of seats.
      </p>
      <ol>
        {timeline.map((t) => (
          <li key={t.date + t.company}>
            <time>{t.date}</time>
            <div>
              <h4>{t.company}</h4>
              <p>{t.text}</p>
              <Source ids={[t.source]} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function BillSimulator() {
  const [automation, setAutomation] = useState(60);
  const [demand, setDemand] = useState(100);
  const [model, setModel] = useState("seats");
  const d = calculateScenario(automation, demand);
  const labels = {
    seats: "Seats only",
    usage: "Work only",
    hybrid: "Platform + work",
  };
  const series = Array.from({ length: 19 }, (_, i) => ({
    a: i * 5,
    ...calculateScenario(i * 5, demand),
  }));
  const X = (a) => 66 + (a / 90) * 580,
    Y = (v) => 292 - (v / 32000) * 242;
  const selectedPrice = d[model];
  return (
    <figure className="sp-simulator">
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">Build your own scenario</span>
          <h3>More work. Fewer seats. Which bill follows?</h3>
        </div>
        <span className="sp-example-tag">Illustrative model</span>
      </div>
      <div className="sp-sim-layout">
        <div className="sp-sim-controls">
          <Range
            id="sp-automation"
            label="Work automated"
            value={automation}
            min={0}
            max={90}
            step={5}
            onChange={setAutomation}
            display={`${automation}%`}
            left="None"
            right="90%"
          />
          <Range
            id="sp-demand"
            label="Work volume vs. baseline"
            value={demand}
            min={50}
            max={300}
            step={10}
            onChange={setDemand}
            display={`${(demand / 100).toFixed(1)}×`}
            left="Half as much"
            right="3× as much"
          />
          <div className="sp-sim-facts" aria-live="polite">
            <div>
              <strong>{fmt(d.work)}</strong>
              <span>work units / month</span>
            </div>
            <div>
              <strong>{d.humans}</strong>
              <span>human seats required</span>
            </div>
          </div>
          <button
            type="button"
            className="sp-text-button"
            onClick={() => {
              setAutomation(60);
              setDemand(100);
              setModel("seats");
            }}
          >
            Reset assumptions
          </button>
        </div>
        <div className="sp-sim-chart">
          <Segments
            label="Highlighted pricing model"
            options={Object.entries(labels).map(([value, label]) => ({
              value,
              label,
            }))}
            value={model}
            onChange={setModel}
          />
          <svg
            viewBox="0 0 700 350"
            role="img"
            aria-label={`Monthly software bill versus automation, with work volume at ${demand}% of baseline. At ${automation}% automation: seats ${money(d.seats)}, work ${money(d.usage)}, hybrid ${money(d.hybrid)}.`}
          >
            <text x="66" y="23" className="sp-svg-caption">
              Monthly bill (USD)
            </text>
            {[0, 10000, 20000, 30000].map((n) => (
              <g key={n}>
                <line x1="66" x2="650" y1={Y(n)} y2={Y(n)} stroke="#DAD7CE" />
                <text
                  x="52"
                  y={Y(n) + 4}
                  textAnchor="end"
                  className="sp-axis-text"
                >
                  {n === 0 ? "$0" : `$${n / 1000}k`}
                </text>
              </g>
            ))}
            {[0, 30, 60, 90].map((n) => (
              <text
                x={X(n)}
                y="316"
                textAnchor="middle"
                className="sp-axis-text"
                key={n}
              >
                {n}%
              </text>
            ))}
            <text
              x="356"
              y="343"
              textAnchor="middle"
              className="sp-svg-caption"
            >
              Share of work automated
            </text>
            {Object.keys(labels).map((key) => (
              <path
                key={key}
                d={series
                  .map((p, i) => `${i ? "L" : "M"}${X(p.a)},${Y(p[key])}`)
                  .join(" ")}
                fill="none"
                stroke={colors[key]}
                strokeWidth={model === key ? 4 : 2}
                opacity={model === key ? 1 : 0.45}
                strokeDasharray={key === "hybrid" ? "8 5" : undefined}
              />
            ))}
            <line
              x1={X(automation)}
              x2={X(automation)}
              y1="40"
              y2="292"
              stroke="#14120E"
              strokeDasharray="3 5"
            />
            {Object.keys(labels).map((key) => (
              <circle
                key={key}
                cx={X(automation)}
                cy={Y(d[key])}
                r={model === key ? 7 : 4}
                fill={colors[key]}
                stroke="#FAF6EF"
                strokeWidth="2"
              />
            ))}
          </svg>
          <div className="sp-legend">
            {Object.entries(labels).map(([key, label]) => (
              <span key={key}>
                <i style={{ background: colors[key] }} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="sp-invoice" aria-live="polite">
          <div className="sp-invoice-heading">
            <span>Monthly software invoice</span>
            <span>{labels[model]}</span>
          </div>
          <strong className="sp-invoice-total">{money(selectedPrice)}</strong>
          <span className="sp-invoice-change">
            {selectedPrice === 10000
              ? "Same as baseline"
              : `${Math.abs((selectedPrice / 10000 - 1) * 100).toFixed(0)}% ${selectedPrice > 10000 ? "above" : "below"} baseline`}
          </span>
          <div className="sp-invoice-rule" />
          <div className="sp-invoice-line">
            <span>Seats only</span>
            <strong>{money(d.seats)}</strong>
          </div>
          <div className="sp-invoice-line">
            <span>Work only</span>
            <strong>{money(d.usage)}</strong>
          </div>
          <div className="sp-invoice-line">
            <span>Platform + work</span>
            <strong>{money(d.hybrid)}</strong>
          </div>
          <p>
            All three begin at $10,000 for 10,000 units of work and zero
            automation.
          </p>
        </div>
      </div>
      <figcaption>
        The model holds quality and work per human constant. It assumes
        customers can reduce licenses, with no minimum staffing or extra review
        burden. It excludes wages and AI operating costs. This compares software
        bills, not total ROI.
      </figcaption>
      <details className="sp-details">
        <summary>Show assumptions and formulas</summary>
        <p>
          Monthly work = 10,000 × volume multiplier. Required seats = round up
          [work ÷ 100 × (1 − automation share)]. Seat bill = seats × $100.
          Work-only bill = work × $1. Hybrid bill = $2,500 + work × $0.75. Rates
          are invented for comparison and equal at the baseline. Changing the
          price structure does not prove a buyer will accept it.
        </p>
        <table>
          <caption>Current scenario</caption>
          <tbody>
            <tr>
              <th>Monthly work</th>
              <td>{fmt(d.work)}</td>
            </tr>
            <tr>
              <th>Automation share</th>
              <td>{automation}%</td>
            </tr>
            <tr>
              <th>Human seats</th>
              <td>{d.humans}</td>
            </tr>
            <tr>
              <th>Seats only</th>
              <td>{money(d.seats)}</td>
            </tr>
            <tr>
              <th>Work only</th>
              <td>{money(d.usage)}</td>
            </tr>
            <tr>
              <th>Platform + work</th>
              <td>{money(d.hybrid)}</td>
            </tr>
          </tbody>
        </table>
      </details>
    </figure>
  );
}

function MeterLab() {
  const [agents, setAgents] = useState(4),
    [retries, setRetries] = useState(1),
    [accepted, setAccepted] = useState(true),
    [metric, setMetric] = useState("outcomes");
  const d = calculateMeters(agents, retries, accepted);
  const rows = [
    {
      id: "seats",
      name: "Human seats",
      unit: "person with access",
      desc: "Predictable. Unchanged by how much this person delegates.",
      max: 1,
    },
    {
      id: "agents",
      name: "Agent count",
      unit: "configured agents",
      desc: "Sensitive to how you split up the job. Four specialists can do the same work as one generalist.",
      max: 8,
    },
    {
      id: "actions",
      name: "Actions",
      unit: "attempted steps",
      desc: "Tracks activity. In this model, retries are billable even when they produce no accepted brief.",
      max: 32,
    },
    {
      id: "minutes",
      name: "Compute time",
      unit: "active compute-minutes",
      desc: "Tracks resources. These are summed machine-minutes, not elapsed clock time or human screen time.",
      max: 48,
    },
    {
      id: "outcomes",
      name: "Accepted outcomes",
      unit: "accepted company brief",
      desc: "Closest to the deliverable here. The seller absorbs failed attempts, provided acceptance is measurable and agreed.",
      max: 1,
    },
  ];
  const current = rows.find((r) => r.id === metric);
  return (
    <figure className="sp-meter-lab">
      <div className="sp-chart-heading">
        <div>
          <span className="sp-data-type">The meter laboratory</span>
          <h3>Change the workflow. Watch what you count.</h3>
        </div>
        <span className="sp-example-tag">Illustrative model</span>
      </div>
      <div className="sp-job-header">
        <span className="sp-job-symbol" aria-hidden="true">
          ▤
        </span>
        <div>
          <strong>The assignment</strong>
          <p>Prepare one company brief for an analyst.</p>
        </div>
        <span className={`sp-job-status ${accepted ? "" : "is-failed"}`}>
          {accepted ? "Brief accepted" : "Brief rejected"}
        </span>
      </div>
      <div className="sp-lab-layout">
        <div className="sp-lab-controls">
          <Range
            id="sp-lab-agents"
            label="Agents sharing the assignment"
            value={agents}
            min={1}
            max={8}
            onChange={setAgents}
          />
          <Range
            id="sp-lab-retries"
            label="Full-job retries"
            value={retries}
            min={0}
            max={3}
            onChange={setRetries}
          />
          <label className="sp-checkbox">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            The analyst accepts the final brief
          </label>
          <p className="sp-caption">
            Eight actions and 12 total active compute-minutes per attempt. More
            agents divide the same assumed effort. A retry repeats it.
          </p>
        </div>
        <div
          className="sp-meter-bars"
          role="group"
          aria-label="Choose a billing meter"
        >
          {rows.map((r) => (
            <button
              type="button"
              key={r.id}
              className={metric === r.id ? "is-selected" : ""}
              aria-pressed={metric === r.id}
              onClick={() => setMetric(r.id)}
            >
              <span className="sp-meter-bar-label">
                {r.name}
                <small>{r.unit}</small>
              </span>
              <span className="sp-meter-track">
                <i style={{ width: `${(d[r.id] / r.max) * 100}%` }} />
              </span>
              <strong>{d[r.id]}</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="sp-meter-verdict" aria-live="polite">
        <strong>{current.name}</strong>
        <p>{current.desc}</p>
      </div>
      <figcaption>
        Each row has its own scale (maximums: 1 seat, 8 agents, 32 actions, 48
        minutes, 1 outcome). Compare a row as you change inputs, not bar lengths
        across rows. This conceptual contract is not any vendor’s rate card.
      </figcaption>
    </figure>
  );
}

function EvidenceCheck() {
  const [selected, setSelected] = useState("support");
  const support = selected === "support";
  return (
    <div className="sp-evidence-check">
      <div>
        <span className="sp-data-type">A necessary reality check</span>
        <h3>An agent working is not the same as work that works.</h3>
        <Segments
          label="Productivity study"
          options={[
            { value: "support", label: "Customer support" },
            { value: "coding", label: "Experienced developers" },
          ]}
          value={selected}
          onChange={setSelected}
        />
      </div>
      <div className="sp-study-result" aria-live="polite">
        <strong>{support ? "+15%" : "+19%"}</strong>
        <h4>
          {support
            ? "more issues resolved per hour"
            : "more time to finish the task"}
        </h4>
        <p>
          {support
            ? "5,172 support agents; staggered rollout of an AI assistant. Average effect; benefits varied by worker experience."
            : "16 developers, 246 tasks; randomized access to early-2025 AI tools in mature, familiar repositories."}
        </p>
        <span className="sp-study-caveat">
          {support
            ? "An assistance study. Not a count of seats eliminated."
            : "A historical result. Not an estimate for today’s tools."}
        </span>
        <Source ids={[support ? "support" : "metr"]} />
      </div>
      <p className="sp-evidence-foot">
        These studies measure different things and should not be averaged.
        METR’s February 2026 follow-up suggests improvement but identifies
        selection effects that prevent a reliable estimate of its size.{" "}
        <Source ids={["metr-update"]} />
      </p>
    </div>
  );
}

function FintechExplorer() {
  const [choice, setChoice] = useState("research");
  const choices = {
    research: {
      label: "Investment research",
      unit: "Validated research delivered",
      base: "Licensed content, provenance and access controls",
      work: "Company briefs accepted against an agreed checklist",
      avoid:
        "Pages generated, or portfolio returns attributed to one research tool",
    },
    portfolio: {
      label: "Portfolio analytics",
      unit: "Portfolios or positions covered",
      base: "Data rights, system availability and governance",
      work: "Defined coverage bands or validated analysis runs",
      avoid:
        "Charging every agent that queries the same portfolio as a new human seat",
    },
    operations: {
      label: "Investment operations",
      unit: "Reconciliations accepted",
      base: "Connectivity, audit history and service commitments",
      work: "Records processed with explicit acceptance and exception rules",
      avoid:
        "Charging for duplicate attempts or rewarding a growing exception backlog",
    },
  };
  const d = choices[choice];
  return (
    <div className="sp-fintech">
      <Segments
        label="Fintech product example"
        options={Object.entries(choices).map(([value, v]) => ({
          value,
          label: v.label,
        }))}
        value={choice}
        onChange={setChoice}
      />
      <div className="sp-fintech-answer" aria-live="polite">
        <div>
          <span>A candidate value metric</span>
          <h3>{d.unit}</h3>
          <p>Acadia’s proposed design, not observed vendor pricing.</p>
        </div>
        <dl>
          <div>
            <dt>Platform fee</dt>
            <dd>{d.base}</dd>
          </div>
          <div>
            <dt>Work allowance</dt>
            <dd>{d.work}</dd>
          </div>
          <div>
            <dt>Watch out for</dt>
            <dd>{d.avoid}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function downloadData() {
  const data = {
    reviewDate: "2026-10-08",
    scope:
      "Purposively selected examples, not a representative sample. Historical usage data is not a current market estimate.",
    vendors,
    usageData,
    sources,
    models: {
      bill: {
        baselineWork: 10000,
        workPerHuman: 100,
        seatPrice: 100,
        workUnitPrice: 1,
        hybridPlatformFee: 2500,
        hybridWorkUnitPrice: 0.75,
      },
      meter: {
        workUnits: 1,
        actionsPerAttempt: 8,
        totalActiveMinutesPerAttempt: 12,
      },
    },
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "acadia-seat-pricing-research-2026-10-08.json";
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
          We reviewed public vendor pricing pages, dated announcements and
          original research on October 8, 2026. The nine vendors are selected to
          show different commercial models, not to estimate market share.
          Historical announcements are labeled. Interactive calculations use
          disclosed assumptions and do not forecast revenue, employment or AI
          performance.
        </p>
        <p>
          No representative dataset of SaaS seat cancellations is used here. The
          causal link between AI adoption and market-wide seat losses remains
          unmeasured in this feature. The argument rests on a mechanism, direct
          commercial changes and observed usage, each with different evidentiary
          weight.
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

export default function SeatPricingStudy() {
  const root = useRef(null);
  useEffect(() => {
    if (window.location.hash) {
      requestAnimationFrame(() =>
        document
          .getElementById(window.location.hash.slice(1))
          ?.scrollIntoView(),
      );
    } else {
      window.scrollTo(0, 0);
    }
  }, []);
  return (
    <main className="seat-study" ref={root}>
      <a className="sp-skip" href="#the-evidence">
        Skip to research
      </a>
      <Hero />
      <ChapterNav />
      <div className="sp-body">
        <section className="sp-thesis">
          <div className="sp-thesis-lead">
            <span className="sp-section-label">The argument</span>
            <h2>The login is becoming a poor proxy for the work.</h2>
          </div>
          <Prose section="thesis">
            <Link
              className="sp-inline-link"
              to="/blog/per-seat-pricing-dead-fintech-value-based"
            >
              Read the original Acadia essay ↗
            </Link>
          </Prose>
        </section>
        <section id="the-evidence" className="sp-section">
          <SectionIntro
            label="Evidence, before prediction"
            title="Work is moving beyond the chat window."
          />
          <Prose section="usage" />
          <UsageChart />
          <IntelligenceCost />
          <div className="sp-takeaway">
            <span>What this establishes</span>
            <p>
              AI can separate software activity from human logins. It does not
              establish how many paid seats have disappeared.
            </p>
          </div>
        </section>
        <section id="the-market" className="sp-section">
          <SectionIntro
            label="Read the pricing pages"
            title="The market is changing the unit."
          />
          <Prose section="pricing" />
          <PricingAtlas />
          <MigrationTimeline />
          <div className="sp-counterpoint">
            <span>Keep two ideas separate</span>
            <h3>
              A declining role for seats.
              <br />
              Not necessarily a declining bill.
            </h3>
            <p>
              Zylo’s 2026 sample reports annual SaaS spend rising 8%. More
              usage, new AI products and changing contracts can increase spend
              even as seat count becomes less informative. This is sample spend,
              not a market-wide price index.
            </p>
            <Source ids={["zylo"]} />
          </div>
        </section>
        <section id="the-bill" className="sp-section">
          <SectionIntro
            label="Put the argument under pressure"
            title="When productivity becomes a pricing problem."
          />
          <Prose section="simulation" />
          <BillSimulator />
          <div className="sp-takeaway">
            <span>Try this</span>
            <p>
              Set automation to 60%, then raise work volume to 2.5×. The
              original 100 seats are needed again. The economic question is how
              much demand expands, not just how much work gets automated.
            </p>
          </div>
        </section>
        <section id="the-meter" className="sp-section">
          <SectionIntro
            label="Design the unit, not just the price"
            title="One job. Five very different meters."
          />
          <Prose section="meters" />
          <MeterLab />
          <div className="sp-reading-pair">
            <div>
              <h3>“Per agent” can become another seat.</h3>
              <p>
                One generalist can call six specialist agents. Charge by the
                number configured and the buyer has a reason to collapse six
                into one, even if the work is identical. Agent count is more
                defensible when it buys a real entitlement, such as reserved
                concurrency or a dedicated service level.
              </p>
            </div>
            <div>
              <h3>“Outcome” needs a definition.</h3>
              <p>
                Intercom’s resolution definition includes a customer leaving
                without requesting more help. That may be commercially
                practical; it is not the same as an explicit quality check.
                Specify acceptance, reversals, duplicates and disputes before
                calling the meter value-based.
              </p>
              <Source ids={["intercom"]} />
            </div>
          </div>
          <EvidenceCheck />
        </section>
        <section id="the-answer" className="sp-section">
          <SectionIntro
            label="What this means for fintech"
            title="Sell the capability. Make the unit legible."
          />
          <FintechExplorer />
          <Prose section="conclusion" />
          <div className="sp-closing">
            <p>
              A seat tells you who has access.
              <br />
              Your pricing should also explain
              <br />
              what the software gets done.
            </p>
          </div>
          <section
            className="sp-booking"
            id="book-with-stan"
            aria-labelledby="sp-booking-title"
          >
            <div className="sp-booking-intro">
              <span className="sp-booking-badge">Free 30 minutes</span>
              <h2 id="sp-booking-title">Grab time with Stan.</h2>
              <p>
                Thirty minutes, zero sales pressure. Let’s talk about your
                pricing, your positioning, and your next stage of growth.
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
