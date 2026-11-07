// Public-source review, 2026-10-28. Each numerical claim has a source below.
// Layoff figures are announced employer actions, not measured net job losses.
// "AI cited" means the employer or its CEO referred to AI; it is not proof of cause.

export const sources = [
  {
    id: "challenger-aug26",
    publisher: "Challenger, Gray & Christmas",
    title: "Job Cut Announcement Report, August 2026",
    date: "September 2026",
    url: "https://www.challengergray.com/wp-content/uploads/2026/09/Challenger-Report-August-2026.pdf",
    note: "116,175 announced U.S. job cuts citing AI from January through August 2026; 3,462 in August. Announced plans, not completed separations.",
  },
  {
    id: "challenger-sep26",
    publisher: "Challenger data via Octagon",
    title: "AI as a reason for U.S. job cuts, September 2026",
    date: "October 2026",
    url: "https://www.octagonai.co/markets/economics/jobs-economy/will-ai-be-the-1-reason-for-job-cuts-in-october/",
    note: "Secondary report of Challenger’s September release: 3,961 AI-cited cuts of 43,281 total; 120,136 year to date, about 21% of 573,195 announced cuts. Consistent with 112,713 through July plus August and September.",
  },
  {
    id: "challenger-dec25",
    publisher: "Challenger, Gray & Christmas",
    title: "Job Cut Announcement Report, December 2025",
    date: "January 2026",
    url: "https://www.challengergray.com/wp-content/uploads/2026/01/Challenger-Report-December-2025.pdf",
    note: "54,836 announced cuts citing AI in 2025; 71,825 cumulative since AI was first tracked in 2023.",
  },
  {
    id: "challenger-history",
    publisher: "Compilation of Challenger reports",
    title: "AI-related passages from all job cuts reports",
    date: "Compiled from 2023 to 2026 releases",
    url: "https://gist.github.com/mcphil/08f8f011f27c9864d157ead0b9d716d9",
    note: "2023: 3,900 (May to December, first year tracked). 2024: 13,089, derived as cumulative total minus 2023 and 2025. Challenger did not publish a standalone 2024 total.",
  },
  {
    id: "msft-oct26",
    publisher: "CNBC",
    title: "Microsoft offers voluntary buyouts to 60,000 employees",
    date: "October 26, 2026",
    url: "https://www.cnbc.com/2026/10/26/microsoft-msft-voluntary-buyouts.html",
    note: "About 60,000 employees at vice president level and below in the U.S., Canada, the U.K. and India are eligible. The figure is the eligible pool, not expected departures.",
  },
  {
    id: "msft-geekwire",
    publisher: "GeekWire",
    title: "Microsoft makes new voluntary exit offer to about a quarter of its workforce",
    date: "October 26, 2026",
    url: "https://www.geekwire.com/2026/microsoft-makes-new-voluntary-exit-offer-to-more-than-a-quarter-of-its-workforce-including-some-execs/",
    note: "Second buyout offer of 2026, after an April early-retirement program for about 7% of the U.S. workforce. Global workforce about 223,000. Some data center, sales and marketing groups excluded.",
  },
  {
    id: "msft-2025",
    publisher: "HR Grapevine, citing Reuters",
    title: "Microsoft cuts 15,000 jobs despite AI-led profits boom",
    date: "July 28, 2025",
    url: "https://www.hrgrapevine.com/us/content/article/2025-07-28-microsoft-cuts-15000-jobs-despite-ai-led-profits-boom",
    note: "About 6,000 cuts in May and 9,000 in July 2025, roughly 7% of a 228,000 workforce, while capital spending on AI rose.",
  },
  {
    id: "meta-2026",
    publisher: "Quartz",
    title: "Meta layoffs 2026: 8,000 jobs cut in AI restructuring",
    date: "May 2026",
    url: "https://qz.com/meta-layoffs-8000-jobs-ai-restructuring-052026",
    note: "About 8,000 employees, roughly 10% of the workforce, with about 7,000 redirected to new AI-focused teams.",
  },
  {
    id: "meta-fortune",
    publisher: "Fortune",
    title: "Mark Zuckerberg has cut 25,000 jobs at Meta since 2022",
    date: "March 27, 2026",
    url: "https://fortune.com/2026/03/27/mark-zuckerberg-meta-layoffs-metaverse-reality-labs-year-of-efficiency-tech-ai/",
    note: "Cumulative reductions since 2022, including Reality Labs cuts in January 2026.",
  },
  {
    id: "amazon-oct25",
    publisher: "TechCrunch",
    title: "Amazon to cut 14,000 corporate jobs",
    date: "October 28, 2025",
    url: "https://techcrunch.com/2025/10/28/amazon-to-cut-14000-corporate-jobs",
    note: "About 14,000 corporate roles. Amazon has roughly 350,000 corporate employees within a total workforce of about 1.56 million.",
  },
  {
    id: "amazon-jan26",
    publisher: "Associated Press via NY1",
    title: "Amazon cuts 16,000 jobs in the latest round of layoffs",
    date: "January 28, 2026",
    url: "https://ny1.com/nyc/all-boroughs/ap-top-news/2026/01/28/amazon-cuts-16000-jobs-in-the-latest-round-of-layoffs",
    note: "A second round of about 16,000 corporate roles, bringing the total since October 2025 to about 30,000.",
  },
  {
    id: "amazon-ai",
    publisher: "CNBC",
    title: "AI is already taking white-collar jobs",
    date: "October 22, 2025",
    url: "https://www.cnbc.com/2025/10/22/ai-taking-white-collar-jobs-economists-warn-much-more-in-the-tank.html",
    note: "Reports Andy Jassy’s June 2025 memo: generative AI will reduce Amazon’s corporate workforce over the next few years, with teams expected to “get more done with scrappier teams.”",
  },
  {
    id: "salesforce",
    publisher: "Yahoo Finance",
    title: "Benioff says Salesforce has cut 4,000 customer service jobs as AI steps in",
    date: "September 2025",
    url: "https://finance.yahoo.com/news/salesforce-ceo-marc-benioff-says-145324020.html",
    note: "Support headcount reduced from about 9,000 to about 5,000. Benioff: “I need less heads.” The company said hundreds were redeployed into sales and services.",
  },
  {
    id: "accenture",
    publisher: "The Irish Times",
    title: "Accenture to exit staff who cannot be retrained for age of AI",
    date: "September 26, 2025",
    url: "https://www.irishtimes.com/business/2025/09/26/accenture-to-exit-staff-who-cannot-be-retrained-for-age-of-ai",
    note: "More than 11,000 roles over three months. Headcount fell from 791,000 to 779,000. Part of an $865 million restructuring also tied to slower consulting demand.",
  },
  {
    id: "dropbox",
    publisher: "Investing.com, citing Form 8-K",
    title: "Dropbox announces 9% workforce reduction and CTO departure",
    date: "October 28, 2026",
    url: "https://www.investing.com/news/sec-filings/dropbox-announces-9-workforce-reduction-and-cto-departure-93CH-4979461",
    note: "About 9% of the workforce, roughly 200 roles in engineering, product, design and G&A. The filing does not attribute the cut to AI.",
  },
  {
    id: "dropbox-2023",
    publisher: "Fast Company",
    title: "Dropbox cuts 16% of workforce in shift to AI",
    date: "April 27, 2023",
    url: "https://www.fastcompany.com/90888639/dropbox-tech-industry-layoffs-ai-job-cuts",
    note: "About 500 roles. Drew Houston cited the need for different skills, particularly in AI.",
  },
  {
    id: "ibm",
    publisher: "Entrepreneur, citing The Wall Street Journal",
    title: "IBM replaced hundreds of HR workers with AI, according to its CEO",
    date: "May 2025",
    url: "https://www.entrepreneur.com/business-news/ibm-ceo-ai-replaced-hundreds-of-human-resources-staff/491341",
    note: "AI agents took over the work of a couple hundred HR roles. Total headcount rose as IBM hired more programmers and salespeople.",
  },
  {
    id: "klarna",
    publisher: "Tech.co",
    title: "Klarna reverses AI customer service overhaul",
    date: "May 2025",
    url: "https://tech.co/news/klarna-reverses-ai-overhaul",
    note: "In 2024 Klarna said its AI assistant did the work of 700 full-time agents, largely outsourced staff. In 2025 the CEO said the push went too far and the company began hiring human support again, moving to a hybrid model.",
  },
  {
    id: "amodei",
    publisher: "CNN",
    title: "The ‘white-collar bloodbath’ is all part of the AI hype machine",
    date: "May 30, 2025",
    url: "https://www.cnn.com/2025/05/30/business/anthropic-amodei-ai-jobs-nightcap",
    note: "Reports Dario Amodei’s Axios interview: AI could eliminate half of entry-level white-collar jobs within five years and push U.S. unemployment to 10% to 20%.",
  },
  {
    id: "farley",
    publisher: "TechRadar",
    title: "Ford CEO says AI will leave a lot of white-collar people behind",
    date: "July 2025",
    url: "https://www.techradar.com/pro/ai-will-leave-a-lot-of-white-collar-people-behind-ford-ceo-latest-to-claim-ai-will-wipe-out-millions-of-jobs",
    note: "Jim Farley at the Aspen Ideas Festival: AI will replace “literally half of all white-collar workers in the US.”",
  },
  {
    id: "hinton",
    publisher: "Yahoo News",
    title: "The godfather of AI on CEOs and job losses",
    date: "2025",
    url: "https://www.yahoo.com/news/articles/godfather-ai-doesnt-think-ceos-043442122.html",
    note: "Geoffrey Hinton has said mass unemployment is likely as AI advances.",
  },
  {
    id: "huang",
    publisher: "Axios",
    title: "Jensen vs. Dario: “There will be more jobs”",
    date: "July 14, 2025",
    url: "https://www.axios.com/2025/07/14/ai-jobs-nvidia-jensen-huang-dario-amodei",
    note: "Jensen Huang disputed the half-of-entry-level forecast at VivaTech in June 2025, arguing AI changes jobs and that more productive companies hire more.",
  },
  {
    id: "wef",
    publisher: "World Economic Forum",
    title: "The Future of Jobs Report 2025",
    date: "January 2025",
    url: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
    note: "Employer survey of more than 1,000 companies in 55 economies: 170 million jobs created and 92 million displaced by 2030, a net gain of 78 million. Planned changes reported by employers, not measured outcomes.",
  },
  {
    id: "altman",
    publisher: "Axios",
    title: "AI CEOs wrong about white-collar bloodbath",
    date: "June 30, 2026",
    url: "https://www.axios.com/2026/06/30/ai-job-loss-anthropic-dario",
    note: "Reports Sam Altman saying in May 2026 that he expected more entry-level white-collar job losses by then than have occurred.",
  },
  {
    id: "imf",
    publisher: "International Monetary Fund",
    title: "AI will transform the global economy. Let’s make sure it benefits humanity.",
    date: "January 14, 2024",
    url: "https://www.imf.org/en/Blogs/Articles/2024/01/14/ai-will-transform-the-global-economy-lets-make-sure-it-benefits-humanity",
    note: "About 40% of global employment is exposed to AI, about 60% in advanced economies. Exposure includes jobs that AI may complement as well as replace.",
  },
  {
    id: "bls",
    publisher: "U.S. Bureau of Labor Statistics",
    title: "Unemployment rate little changed at 4.2 percent in September 2026",
    date: "October 2026",
    url: "https://www.bls.gov/opub/ted/2026/unemployment-rate-little-changed-at-4-2-percent-in-september-2026.htm",
    note: "4.2% in September 2026, within a 4.1% to 4.3% range since March. Payrolls rose by 29,000.",
  },
  {
    id: "stanford",
    publisher: "Stanford Digital Economy Lab",
    title: "Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of AI",
    date: "August 2025; revised November 2025 and August 2026",
    url: "https://digitaleconomy.stanford.edu/news/canariesaug26/",
    note: "ADP payroll data. Employment of 22- to 25-year-olds in the most AI-exposed occupations relative to less-exposed peers: 13% lower (August 2025 paper), 16% (November 2025), 19% as of June 2026. Employment of experienced workers was stable, the effect operates mainly through reduced hiring, and no widespread displacement was found.",
  },
  {
    id: "nyfed",
    publisher: "Federal Reserve Bank of New York",
    title: "The Labor Market for Recent College Graduates",
    date: "Second quarter 2026",
    url: "https://www.newyorkfed.org/research/college-labor-market",
    note: "Recent graduates aged 22 to 27: unemployment about 5.6%, underemployment 42%.",
  },
  {
    id: "nyfed-remote",
    publisher: "CNBC",
    title: "Remote work is worsening youth unemployment, New York Fed finds",
    date: "June 1, 2026",
    url: "https://www.cnbc.com/2026/06/01/remote-work-youth-unemployment-new-york-fed.html",
    note: "New York Fed researchers estimate remote work can account for 64% of the recent rise in youth unemployment.",
  },
  {
    id: "msr",
    publisher: "Microsoft Research",
    title: "Working with AI: Measuring the Applicability of Generative AI to Occupations",
    date: "July 2025",
    url: "https://www.microsoft.com/en-us/research/publication/working-with-ai-measuring-the-occupational-implications-of-generative-ai/",
    note: "About 200,000 anonymized Bing Copilot conversations mapped to occupational tasks. Highest applicability in computer and mathematical, office and administrative support, and sales occupations; lowest in physical and care work, such as healthcare support (0.05) and cleaning (0.08).",
  },
  {
    id: "msr-cnbc",
    publisher: "CNBC",
    title: "These 10 jobs are the least AI-safe, according to a new Microsoft report",
    date: "August 5, 2025",
    url: "https://www.cnbc.com/make-it/2025/08/05/these-10-jobs-are-the-least-ai-safe-according-to-new-microsoft-report.html",
    note: "Five of the ten occupations with the highest applicability scores are in customer service. Writing, editing, sales and programming also score high.",
  },
];

// Two opposing camps. Claims are paraphrased from the cited coverage unless quoted.
export const forecasts = {
  cost: [
    {
      who: "Dario Amodei",
      role: "CEO, Anthropic",
      date: "May 2025",
      claim:
        "AI could eliminate half of entry-level white-collar jobs within five years and raise U.S. unemployment to 10% to 20%.",
      source: "amodei",
    },
    {
      who: "Jim Farley",
      role: "CEO, Ford",
      date: "June 2025",
      claim: "AI will replace “literally half of all white-collar workers in the US.”",
      source: "farley",
    },
    {
      who: "Andy Jassy",
      role: "CEO, Amazon",
      date: "June 2025",
      claim:
        "Generative AI will reduce Amazon’s corporate workforce over the next few years.",
      source: "amazon-ai",
    },
    {
      who: "Geoffrey Hinton",
      role: "AI researcher, Nobel laureate",
      date: "2025",
      claim: "Mass unemployment is likely as AI capabilities advance.",
      source: "hinton",
    },
  ],
  create: [
    {
      who: "Jensen Huang",
      role: "CEO, NVIDIA",
      date: "June 2025",
      claim:
        "AI will change nearly every job, and more productive companies hire more people, not fewer.",
      source: "huang",
    },
    {
      who: "World Economic Forum",
      role: "Future of Jobs Report",
      date: "January 2025",
      claim:
        "170 million jobs created and 92 million displaced by 2030: a net gain of 78 million.",
      source: "wef",
    },
    {
      who: "Sam Altman",
      role: "CEO, OpenAI",
      date: "May 2026",
      claim:
        "He expected more entry-level white-collar job losses by now than have occurred.",
      source: "altman",
    },
    {
      who: "IMF",
      role: "Kristalina Georgieva",
      date: "January 2024",
      claim:
        "About 40% of jobs worldwide are exposed to AI, and many of them will be complemented rather than replaced.",
      source: "imf",
    },
  ],
};

// kind: "cut" = announced layoff; "offer" = eligible pool for voluntary exit.
// link: how the employer connected the action to AI.
export const companies = [
  {
    id: "microsoft",
    name: "Microsoft",
    date: "Oct 26, 2026",
    sortDate: "2026-10-26",
    kind: "offer",
    people: 60000,
    peopleLabel: "~60,000",
    peopleNote: "eligible for voluntary exit",
    base: 223000,
    baseLabel: "global workforce",
    link: "spending",
    headline: "A buyout offer to about a quarter of the company.",
    detail:
      "Voluntary exit packages for employees at vice president level and below in the U.S., Canada, the U.K. and India. Microsoft has not said how many it expects to accept. This follows an April 2026 early-retirement offer to about 7% of its U.S. staff, and about 15,000 cuts in 2025 (roughly 7% of 228,000).",
    stated: "An efficiency push alongside record spending on AI infrastructure.",
    sources: ["msft-oct26", "msft-geekwire", "msft-2025"],
  },
  {
    id: "amazon",
    name: "Amazon",
    date: "Oct 2025 – Jan 2026",
    sortDate: "2026-01-28",
    kind: "cut",
    people: 30000,
    peopleLabel: "~30,000",
    peopleNote: "corporate roles in two rounds",
    base: 350000,
    baseLabel: "corporate workforce",
    altBase: 1560000,
    altBaseLabel: "total workforce, including warehouses",
    link: "forecast",
    headline: "The largest corporate reduction in Amazon’s history.",
    detail:
      "About 14,000 corporate roles in October 2025 and 16,000 in January 2026, followed by fewer than 1,000 in October 2026. Measured against the whole company, including fulfillment, the two rounds are about 2% of employees.",
    stated:
      "Andy Jassy said in June 2025 that generative AI will reduce the corporate workforce over the next few years.",
    sources: ["amazon-oct25", "amazon-jan26", "amazon-ai"],
  },
  {
    id: "meta",
    name: "Meta",
    date: "May 2026",
    sortDate: "2026-05-20",
    kind: "cut",
    people: 8000,
    peopleLabel: "~8,000",
    peopleNote: "employees",
    base: 80000,
    baseLabel: "workforce",
    share: 10,
    link: "spending",
    headline: "Budget moved from people to AI infrastructure.",
    detail:
      "About 10% of the workforce, with roughly 7,000 employees redirected into new AI-focused teams. Meta has cut about 25,000 roles since 2022, including Reality Labs reductions in January 2026.",
    stated: "Reallocating spending toward AI infrastructure.",
    sources: ["meta-2026", "meta-fortune"],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    date: "Sep 2025",
    sortDate: "2025-09-02",
    kind: "cut",
    people: 4000,
    peopleLabel: "~4,000",
    peopleNote: "customer support roles",
    base: 9000,
    baseLabel: "support organization",
    link: "direct",
    headline: "AI agents now handle a large share of support.",
    detail:
      "Support headcount fell from about 9,000 to about 5,000. The company said hundreds of people were redeployed into professional services, sales and customer success.",
    stated: "Marc Benioff: “I need less heads.”",
    sources: ["salesforce"],
  },
  {
    id: "accenture",
    name: "Accenture",
    date: "Jun – Aug 2025",
    sortDate: "2025-09-25",
    kind: "cut",
    people: 11000,
    peopleLabel: "11,000+",
    peopleNote: "roles over three months",
    base: 791000,
    baseLabel: "workforce at start of period",
    link: "reskill",
    headline: "Exits for staff the firm could not retrain.",
    detail:
      "Headcount fell from 791,000 to 779,000 as part of an $865 million restructuring. The firm also cited slower demand for consulting and said overall headcount would grow again.",
    stated:
      "Julie Sweet: the firm is exiting people for whom reskilling is not viable.",
    sources: ["accenture"],
  },
  {
    id: "dropbox",
    name: "Dropbox",
    date: "Oct 28, 2026",
    sortDate: "2026-10-28",
    kind: "cut",
    people: 200,
    peopleLabel: "~200",
    peopleNote: "roles",
    base: 2113,
    baseLabel: "workforce",
    share: 9,
    link: "none",
    headline: "Engineering, product, design and G&A.",
    detail:
      "About 9% of the workforce, with $27 million to $33 million in severance costs. The technology chief is leaving. In 2023 Dropbox cut 16% of staff and cited the need for AI skills; the 2026 filing does not cite AI.",
    stated: "No AI rationale in the filing.",
    sources: ["dropbox", "dropbox-2023"],
  },
  {
    id: "ibm",
    name: "IBM",
    date: "May 2025",
    sortDate: "2025-05-06",
    kind: "cut",
    people: 200,
    peopleLabel: "~200",
    peopleNote: "HR roles automated",
    base: null,
    baseLabel: "",
    link: "direct",
    headline: "Automated HR, then hired engineers and sellers.",
    detail:
      "AI agents took over the work of a couple hundred HR roles. Total headcount rose, because the savings were spent on programmers and salespeople.",
    stated: "Arvind Krishna: AI replaced HR work and funded hiring elsewhere.",
    sources: ["ibm"],
  },
  {
    id: "klarna",
    name: "Klarna",
    date: "2024, revised 2025",
    sortDate: "2025-05-15",
    kind: "reversed",
    people: 700,
    peopleLabel: "700",
    peopleNote: "agents’ worth of work, mostly outsourced",
    base: null,
    baseLabel: "",
    link: "reversed",
    headline: "Automation went too far, then partly came back.",
    detail:
      "Klarna said its assistant did the work of 700 full-time agents and paused hiring. In 2025 the CEO said quality had suffered, and the company began hiring human support again under a hybrid model.",
    stated: "Partly reversed after service quality declined.",
    sources: ["klarna"],
  },
];

export const linkTypes = {
  direct: { label: "AI named as the reason", color: "#D6502B" },
  forecast: { label: "AI named as a future driver", color: "#E08A2C" },
  spending: { label: "AI spending cited", color: "#2447F9" },
  reskill: { label: "AI skills cited", color: "#177E89" },
  none: { label: "AI not cited", color: "#9A958B" },
  reversed: { label: "Partly reversed", color: "#9A958B" },
};

// Announced U.S. cuts citing AI. 2024 is derived; 2026 is January to September.
export const challengerYears = [
  { year: "2023", value: 3900, period: "May–Dec", derived: false, source: "challenger-history" },
  { year: "2024", value: 13089, period: "Full year", derived: true, source: "challenger-history" },
  { year: "2025", value: 54836, period: "Full year", derived: false, source: "challenger-dec25" },
  { year: "2026", value: 120136, period: "Jan–Sep", derived: false, source: "challenger-sep26" },
];

export function cumulative(series = challengerYears) {
  let total = 0;
  return series.map((d) => ({ ...d, value: (total += d.value) }));
}

// Stanford: relative employment of ages 22–25 in the most AI-exposed jobs.
export const ladderReleases = [
  { label: "Late 2022", note: "Baseline before ChatGPT’s release", gap: 0 },
  { label: "Aug 2025", note: "First paper, data through mid-2025", gap: 13 },
  { label: "Nov 2025", note: "Revised paper", gap: 16 },
  { label: "Aug 2026", note: "Update, data through June 2026", gap: 19 },
];

export const ladderRungs = [
  { age: "50+", stage: "Leadership" },
  { age: "35–49", stage: "Senior" },
  { age: "31–34", stage: "Mid-career" },
  { age: "26–30", stage: "Early career" },
  { age: "22–25", stage: "Entry level", exposed: true },
];

export const labor = {
  forecastLow: 10,
  forecastHigh: 20,
  unemployment: 4.2,
  unemploymentRange: [4.1, 4.3],
  gradUnemployment: 5.6,
  gradUnderemployment: 42,
  remoteShare: 64,
};

export const industries = [
  {
    id: "software",
    label: "Software & IT",
    tier: "high",
    exposure:
      "Computer and mathematical occupations are among the highest AI applicability scores.",
    signal:
      "Microsoft, Meta and Amazon all reduced staff in 2025–26 while raising AI spending. Software developers aged 22 to 25 are one of the clearest declines in the Stanford data.",
    move: "Hire for review, architecture and integration. Entry-level roles change from writing code to checking and directing it.",
    sources: ["msr", "stanford"],
  },
  {
    id: "support",
    label: "Customer service",
    tier: "high",
    exposure:
      "Five of the ten occupations with the highest applicability scores are customer-service roles.",
    signal:
      "Salesforce cut support from about 9,000 to 5,000. Klarna went further, then partly reversed when quality fell.",
    move: "Automate routine contacts, measure resolution quality, and keep people on complex and high-value cases.",
    sources: ["msr-cnbc", "salesforce", "klarna"],
  },
  {
    id: "sales",
    label: "Sales",
    tier: "high",
    exposure: "Sales occupations score among the highest for AI applicability.",
    signal:
      "IBM and Salesforce both moved savings or staff into selling roles rather than cutting sales.",
    move: "Use AI for research, follow-up and proposals so sellers spend more time with buyers.",
    sources: ["msr", "ibm", "salesforce"],
  },
  {
    id: "media",
    label: "Writing, media & marketing",
    tier: "high",
    exposure:
      "Writers, authors and editors are among the occupations with the highest applicability scores.",
    signal:
      "The cost of producing a draft article, report or video has fallen sharply. Volume and consistency become easier to achieve.",
    move: "Publish more often, keep editorial judgment and original data in human hands, and measure what ranks and converts.",
    sources: ["msr-cnbc"],
  },
  {
    id: "admin",
    label: "Office & administration",
    tier: "high",
    exposure:
      "Office and administrative support is one of the highest-scoring occupation groups.",
    signal: "IBM moved the work of about 200 HR roles to AI agents.",
    move: "Map processes task by task and redeploy people toward exceptions, approvals and service.",
    sources: ["msr", "ibm"],
  },
  {
    id: "consulting",
    label: "Professional services",
    tier: "mixed",
    exposure:
      "Not scored as one group. Its core tasks of research, analysis and writing are high-applicability tasks.",
    signal:
      "Accenture exited more than 11,000 people it could not retrain, and also cited slower demand.",
    move: "Price for outcomes and expertise rather than hours, since hours of analysis are what AI compresses.",
    sources: ["accenture", "msr"],
  },
  {
    id: "health",
    label: "Healthcare support",
    tier: "low",
    exposure: "Healthcare support scored 0.05, among the lowest of any group.",
    signal: "Hands-on care work shows little overlap with current AI use.",
    move: "Apply AI to scheduling, documentation and billing around the care itself.",
    sources: ["msr"],
  },
  {
    id: "physical",
    label: "Physical & hands-on work",
    tier: "low",
    exposure:
      "Physical occupations score lowest. Cleaning and maintenance scored 0.08.",
    signal: "Current generative AI rarely performs the core tasks of these jobs.",
    move: "Look to quoting, dispatch and customer communication for the gains.",
    sources: ["msr"],
  },
];

export const tierInfo = {
  high: { label: "High applicability", level: 3 },
  mixed: { label: "Mixed", level: 2 },
  low: { label: "Low applicability", level: 1 },
};

// Acadia's planning estimates: hours to research, draft, edit and produce one piece.
// Not a study. Excludes strategy, approvals and distribution.
export const contentFormats = [
  { id: "article", label: "Research-backed article", before: 10, after: 3 },
  { id: "whitepaper", label: "White paper", before: 40, after: 12 },
  { id: "video", label: "Concept video", before: 24, after: 5 },
  { id: "social", label: "Set of 5 social posts", before: 5, after: 1.5 },
];

export const WEEKS_PER_MONTH = 52 / 12;

export function piecesPerMonth(hoursPerWeek, hoursPerPiece) {
  if (!(hoursPerWeek > 0) || !(hoursPerPiece > 0)) return 0;
  return Math.floor((hoursPerWeek * WEEKS_PER_MONTH) / hoursPerPiece + 1e-9);
}

export function shareOf(people, base) {
  if (!base || !people) return null;
  return Math.round((people / base) * 1000) / 10;
}

// Whole percentages at 10% and above; one decimal below.
export function displayShare(s) {
  if (s == null) return null;
  return s >= 10 ? Math.round(s) : s;
}

// Prefer the share the company or its filing reported; otherwise compute it.
export function companyShare(c, base = c.base) {
  if (base === c.base && c.share != null) return c.share;
  return shareOf(c.people, base);
}

export const narrative = {
  thesis: [
    "Between October 2025 and October 2026, Amazon, Meta, Microsoft and Salesforce each reduced staff and referred to artificial intelligence when they explained why. On October 26, Microsoft offered voluntary exits to about 60,000 employees, roughly a quarter of its workforce. Two days later, Dropbox announced a 9% reduction.",
    "These announcements test a debate that has run since 2023. One group of executives and researchers forecast large losses of white-collar work. Another forecast that AI would change jobs and increase total employment. This feature sets out both positions and compares them with the data available in October 2026.",
  ],
  forecasts: [
    "The first group expected rapid displacement, concentrated in office work. Their forecasts named specific magnitudes: half of entry-level white-collar jobs, unemployment of 10% to 20%, half of all white-collar workers.",
    "The second group expected AI to automate tasks inside jobs and to raise demand for labor overall, as earlier general-purpose technologies did. The World Economic Forum’s employer survey projected a net gain of 78 million jobs worldwide by 2030.",
  ],
  cuts: [
    "Company announcements are the most visible evidence and the hardest to interpret. Some name AI as the reason. Some cite AI spending, where the cost of data centers puts pressure on payroll. Some cite AI skills. Some do not mention AI at all.",
    "The denominator also matters. Amazon’s 30,000 corporate reductions are about 9% of corporate staff and about 2% of the entire company. Microsoft’s 60,000 is an eligible pool for voluntary exits, not a count of departures.",
  ],
  trend: [
    "Challenger, Gray & Christmas began recording AI as a reason for job cuts in 2023. The category has grown each year, and in several months of 2026 it was the most frequently cited reason for announced cuts.",
    "These figures count announcements, not completed separations, and the reason is whatever the employer reported. They are still the most consistent public series on how often employers attribute layoffs to AI.",
  ],
  rung: [
    "The aggregate labor market has not shown the losses the first group forecast. U.S. unemployment was 4.2% in September 2026 and has stayed between 4.1% and 4.3% since March.",
    "The clearest effect is at the start of careers. Using ADP payroll records, Stanford researchers found that employment of 22- to 25-year-olds in the most AI-exposed occupations fell relative to their peers in less-exposed work, while employment of experienced workers in the same occupations held steady. The gap has widened in each revision, and it operates mainly through fewer hires rather than more layoffs.",
    "Other factors contribute. The New York Fed estimates that remote work can account for 64% of the recent rise in youth unemployment. AI is one cause among several.",
  ],
  industry: [
    "Exposure varies widely by occupation. Microsoft Research mapped about 200,000 Copilot conversations to the tasks in each occupation. Knowledge work in computing, administration, sales, customer service and writing scored highest. Physical and care work scored lowest.",
    "High applicability does not mean a job disappears. It means a large share of the job’s tasks overlap with what AI is used for today. Whether that reduces headcount depends on whether demand for the work grows faster than productivity.",
  ],
  marketing: [
    "Marketing content is a high-applicability task. Research, drafting, editing and production now take a fraction of the time they did in 2023. At Acadia, the same team produces research-backed articles, white papers and concept videos on a schedule that was not practical before.",
    "When production cost falls, publishing frequency becomes a choice rather than a constraint. A company can publish to its blog every week for search, post to social channels daily, and build the long-form assets buyers request during evaluation.",
  ],
  conclusion: [
    "Both camps were partly right. The displacement forecasts have not appeared in aggregate unemployment. Announced cuts that cite AI have more than doubled each year, and hiring at the entry level of exposed occupations has fallen.",
    "The pattern is consistent across the evidence: AI changes how much work each person is expected to produce. Organizations are responding by hiring fewer people into routine roles and spending more on systems and experienced staff.",
  ],
};

const sectionTitles = {
  thesis: "The announcements",
  forecasts: "Two opposing camps",
  cuts: "Who is cutting",
  trend: "How often employers cite AI",
  rung: "Where the effect shows up",
  industry: "Exposure by occupation",
  marketing: "What changed in marketing",
  conclusion: "What the evidence supports",
};

const paragraphs = Object.entries(narrative)
  .map(([key, values]) => `## ${sectionTitles[key]}\n\n${values.join("\n\n")}`)
  .join("\n\n");

const fmtNum = (n) => new Intl.NumberFormat("en-US").format(n);

export const aiJobsPost = {
  id: 81,
  slug: "ai-layoffs-2026-where-did-the-jobs-go",
  title: "Fewer Hires. More Output. Where Did the Jobs Go?",
  excerpt:
    "Microsoft, Meta, Amazon and Dropbox cut staff in 2026. Compare the forecasts of AI job losses and AI job creation with the layoff data, the entry-level evidence and an interactive company atlas.",
  author: "Stan Altshuller",
  date: "2026-10-28",
  readTime: "14 min exploration",
  category: "Strategy",
  tags: ["AI", "Research", "Interactive", "Workforce"],
  image: "/img/ai-layoffs-research.png",
  content: `${paragraphs}\n\n## Company announcements\n\n${companies
    .map(
      (c) =>
        `### ${c.name} (${c.date})\n\n${c.peopleLabel} ${c.peopleNote}${
          c.base ? `, about ${displayShare(companyShare(c))}% of the ${c.baseLabel}` : ""
        }. ${c.detail} ${c.stated}\n\n${c.sources
          .map((id) => {
            const s = sources.find((x) => x.id === id);
            return `[${s.publisher}: ${s.title}](${s.url})`;
          })
          .join(" / ")}`,
    )
    .join(
      "\n\n",
    )}\n\n## Chart data and methods\n\nAnnounced U.S. job cuts citing AI (Challenger, Gray & Christmas): ${challengerYears
    .map((d) => `${d.year} ${d.period}: ${fmtNum(d.value)}${d.derived ? " (derived)" : ""}`)
    .join("; ")}. Stanford relative employment gap for ages 22 to 25 in the most AI-exposed occupations: ${ladderReleases
    .map((r) => `${r.label}: ${r.gap}%`)
    .join("; ")}. U.S. unemployment, September 2026: 4.2%. Recent graduates: 5.6% unemployment, 42% underemployment.\n\nThe publishing model uses Acadia’s planning estimates of hours per piece, including research, drafting, editing and production: ${contentFormats
    .map((f) => `${f.label} ${f.before} hours before AI, ${f.after} hours with AI`)
    .join("; ")}. Monthly output equals weekly hours times 52/12, divided by hours per piece, rounded down. These are working estimates, not a study.\n\n## What the evidence does not establish\n\nAnnounced cuts are not completed separations, and the reason given by an employer is not proof of cause. Company percentages depend on the denominator. No figure here measures AI’s net effect on total employment.\n\n## What do AI efficiencies mean for your industry?\n\n[Book 30 minutes with Stan](/book) to discuss what AI changes in your market and what a weekly publishing plan would take.\n\n## Sources\n\nReviewed October 28, 2026.\n\n${sources
    .map((s) => `- [${s.publisher}: ${s.title}](${s.url}). ${s.date}. ${s.note}`)
    .join("\n")}`,
};
