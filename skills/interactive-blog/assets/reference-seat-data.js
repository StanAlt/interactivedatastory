// Public-source review, 2026-10-08. Each numerical claim has a source below.
export const sources = [
  {
    id: "anthropic",
    publisher: "Anthropic",
    title: "Economic Index: economic primitives, Figure 1.3",
    date: "January 2026; samples through November 2025",
    url: "https://www-cdn.anthropic.com/096d94c1a91c6480806d8f24b2344c7e2a4bc666.pdf",
    note: "Observed Claude usage. Rounded automation / augmentation shares, including residual categories. The report restates earlier samples on a consistent basis.",
  },
  {
    id: "stanford",
    publisher: "Stanford HAI",
    title: "2025 AI Index: research and development",
    date: "2025; prices from November 2022 and October 2024",
    url: "https://hai.stanford.edu/ai-index/2025-ai-index-report/research-and-development",
    note: "Cost to query a model reaching GPT-3.5-level MMLU performance: $20 to $0.07 per million tokens. A benchmark-specific comparison, not a price index for all AI.",
  },
  {
    id: "support",
    publisher: "Brynjolfsson, Li & Raymond",
    title: "Generative AI at Work",
    date: "arXiv version revised November 6, 2024",
    url: "https://arxiv.org/abs/2304.11771",
    note: "Staggered rollout among 5,172 customer-support agents; 15% average increase in issues resolved per hour. This is an assistance study, not a study of autonomous agents or seat cancellation.",
  },
  {
    id: "metr",
    publisher: "METR",
    title: "Early-2025 AI and experienced developer productivity",
    date: "July 10, 2025",
    url: "https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf",
    note: "Randomized trial: 16 developers, 246 tasks in familiar open-source repositories. AI access increased completion time by 19%.",
  },
  {
    id: "metr-update",
    publisher: "METR",
    title: "Changing the developer productivity experiment",
    date: "February 24, 2026",
    url: "https://metr.org/blog/2026-02-24-uplift-update/",
    note: "Later results suggest improvement, but selection effects prevent a reliable estimate of the size. Concurrent agent use also complicates time measurement.",
  },
  {
    id: "salesforce-launch",
    publisher: "Salesforce",
    title: "New flexible Agentforce pricing",
    date: "May 15, 2025",
    url: "https://www.salesforce.com/in/news/press-releases/2025/05/15/agentforce-flexible-pricing-news/",
    note: "Introduces action-based Flex Credits and a Flex Agreement that can shift investment between user licenses and credits.",
  },
  {
    id: "salesforce",
    publisher: "Salesforce",
    title: "Agentforce pricing",
    date: "Pricing page reviewed October 8, 2026",
    url: "https://www.salesforce.com/agentforce/pricing/",
    note: "Flex Credits, conversations, user licenses and flat-fee access coexist. Options are not all interchangeable; base products and other consumption costs can apply.",
  },
  {
    id: "intercom",
    publisher: "Intercom",
    title: "Fin AI Agent outcomes",
    date: "Help page reviewed October 8, 2026",
    url: "https://www.intercom.com/help/en/articles/8205718-fin-ai-agent-outcomes",
    note: "$0.99 for resolutions and specified other outcomes; qualifications are $9.99. A resolution may be confirmed or assumed. At most one billed outcome per conversation.",
  },
  {
    id: "intercom-platform",
    publisher: "Intercom",
    title: "Intercom plans and pricing",
    date: "Pricing page reviewed October 8, 2026",
    url: "https://www.intercom.com/pricing",
    note: "Helpdesk seats and Fin usage are separate layers. Fin on an existing helpdesk has a different commercial structure.",
  },
  {
    id: "zendesk-launch",
    publisher: "Zendesk",
    title: "Outcome-based pricing for AI agents",
    date: "August 28, 2024",
    url: "https://www.zendesk.com/newsroom/articles/zendesk-outcome-based-pricing/",
    note: "Introduces automated-resolution pricing alongside existing support products. Not evidence that Zendesk abolished human seats.",
  },
  {
    id: "zendesk-flex",
    publisher: "Zendesk",
    title: "AI Dynamic Pricing Plan",
    date: "November 11, 2024",
    url: "https://www.zendesk.com/newsroom/press-releases/ai-dynamic-pricing-plan/",
    note: "Describes shifting investment between human agents and AI agents over time.",
  },
  {
    id: "hubspot",
    publisher: "HubSpot",
    title: "HubSpot Credits",
    date: "Pricing page reviewed October 8, 2026",
    url: "https://www.hubspot.com/products/artificial-intelligence/credits",
    note: "Customer Agent uses 50 credits ($0.50) per conversation resolved without human assistance. Credits power multiple features with different rates.",
  },
  {
    id: "hubspot-launch",
    publisher: "HubSpot",
    title: "Expanding Customer Agent with HubSpot Credits",
    date: "May 2025 announcement; expansion June 2, 2025",
    url: "https://ir.hubspot.com/news-releases/news-release-details/hubspot-credits",
    note: "Expands usage-metered agents across Pro and Enterprise hubs; does not retire platform subscriptions.",
  },
  {
    id: "microsoft",
    publisher: "Microsoft",
    title: "Copilot Studio plans and pricing",
    date: "Pricing page reviewed October 8, 2026",
    url: "https://www.microsoft.com/en-us/copilot/pricing/copilot-studio",
    note: "$200 per month for 25,000 tenant-wide credits; pay-as-you-go and pre-purchase alternatives. Some internal agent use is included with Microsoft 365 Copilot; capabilities and harness affect metering.",
  },
  {
    id: "n8n",
    publisher: "n8n",
    title: "Plans and pricing",
    date: "Pricing page reviewed October 8, 2026",
    url: "https://n8n.io/pricing/",
    note: "Unlimited users and workflows. Subscription tiers meter monthly workflow executions, with separate concurrency and other limits.",
  },
  {
    id: "zapier",
    publisher: "Zapier",
    title: "How Agents usage is measured",
    date: "Updated October 1, 2026",
    url: "https://help.zapier.com/hc/en-us/articles/26559132765325-How-is-Zapier-Agents-usage-measured",
    note: "Legacy Agents activities include actions, knowledge lookups and browsing. The page explicitly says Agents is moving to AI by Zapier.",
  },
  {
    id: "devin",
    publisher: "Cognition",
    title: "New self-serve plans for Devin",
    date: "April 14, 2026",
    url: "https://cognition.com/blog/new-self-serve-plans-for-devin",
    note: "Moves self-serve overage pricing from ACUs to dollars linked to underlying model use; enterprise retains ACUs. Teams has an $80 monthly minimum in the announcement.",
  },
  {
    id: "sierra",
    publisher: "Sierra",
    title: "Outcome-based pricing for AI agents",
    date: "Public policy reviewed October 8, 2026",
    url: "https://sierra.ai/blog/outcome-based-pricing-for-ai-agents",
    note: "Charges for agreed outcomes and describes blended alternatives. No universal public dollar rate in this source.",
  },
  {
    id: "zylo",
    publisher: "Zylo",
    title: "SaaS predictions from its 2026 Management Index",
    date: "2026 report commentary",
    url: "https://zylo.com/blog/saas-predictions-for-2026-signal-a-shift-in-spend-and-governance",
    note: "Reports an 8% increase in annual SaaS spend in its observed sample. Spend is not a constant-quality price index and the customer sample is not the whole market.",
  },
];

export const usageData = [
  { period: "Jan 2025", automation: 41, augmentation: 55, other: 4 },
  { period: "Mar 2025", automation: 42, augmentation: 55, other: 3 },
  {
    period: "Aug 2025",
    automation: 49,
    augmentation: 47,
    other: 4,
    apiAutomation: 77,
    apiAugmentation: 12,
    apiOther: 11,
  },
  {
    period: "Nov 2025",
    automation: 45,
    augmentation: 52,
    other: 3,
    apiAutomation: 75,
    apiAugmentation: 14,
    apiOther: 11,
  },
];

export const vendors = [
  {
    id: "salesforce",
    name: "Salesforce",
    product: "Agentforce",
    group: "Established SaaS",
    meters: ["Seats", "Actions"],
    primary: "Actions",
    rate: "$0.10",
    unit: "per standard action",
    headline: "The pioneer of seats now sells a menu of meters.",
    description:
      "Flex Credits cost $500 per 100,000; a standard action uses 20. Conversations are also offered at $2. Flat-fee employee access is listed at $125 per user/month. Human licenses still matter.",
    transition: "Added a work meter",
    caution:
      "An action is not a verified outcome. Other licenses, voice rates and data services can add cost. Flex Credits and conversation pricing cannot be combined in the same org.",
    sourceIds: ["salesforce", "salesforce-launch"],
  },
  {
    id: "intercom",
    name: "Intercom",
    product: "Fin",
    group: "Established SaaS",
    meters: ["Seats", "Outcomes"],
    primary: "Outcomes",
    rate: "$0.99",
    unit: "per resolution",
    headline: "Human seats on one line. AI outcomes on another.",
    description:
      "Intercom keeps per-teammate helpdesk plans and separately meters Fin. Specified handoffs and disqualifications also cost $0.99; sales qualifications cost $9.99. Fin on an existing helpdesk is another option.",
    transition: "Added an outcome meter",
    caution:
      "A billed resolution can be inferred when a customer leaves without requesting more help. “Outcome” does not always mean an explicitly verified success.",
    sourceIds: ["intercom", "intercom-platform"],
  },
  {
    id: "zendesk",
    name: "Zendesk",
    product: "AI agents",
    group: "Established SaaS",
    meters: ["Seats", "Outcomes"],
    primary: "Outcomes",
    rate: "By resolution",
    unit: "commercial terms vary",
    headline: "The contract can move with the work.",
    description:
      "Zendesk introduced automated-resolution pricing in August 2024. Its November 2024 Dynamic Pricing Plan allows investment to shift between human and AI agents.",
    transition: "Added an outcome meter",
    caution:
      "These announcements describe an AI pricing layer and flexible allocation, not the removal of all human-seat subscriptions. No universal rate is asserted here.",
    sourceIds: ["zendesk-launch", "zendesk-flex"],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    product: "Customer Agent",
    group: "Established SaaS",
    meters: ["Seats", "Outcomes"],
    primary: "Outcomes",
    rate: "$0.50",
    unit: "per resolved conversation",
    headline: "A credit is the currency. A resolution is the unit.",
    description:
      "Customer Agent uses 50 credits when it resolves a conversation without a human. HubSpot platform subscriptions remain, with included credits and additional usage.",
    transition: "Added an outcome meter",
    caution:
      "Other agents and features burn credits at different rates. Comparing one vendor’s “credit” with another’s tells you little about a finished job.",
    sourceIds: ["hubspot", "hubspot-launch"],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    product: "Copilot Studio",
    group: "Established SaaS",
    meters: ["Seats", "Actions"],
    primary: "Actions",
    rate: "$200",
    unit: "per 25,000 credits / month",
    headline: "Internal copilots and autonomous work have different economics.",
    description:
      "Standalone Studio offers tenant-wide credit packs, pay-as-you-go and pre-purchase options. Some internal-agent use is included in a licensed Microsoft 365 Copilot seat.",
    transition: "Different meters by use case",
    caution:
      "One credit is not one task. Rates depend on the capability used; some harnesses consume credits even for licensed users. Check the applicable licensing guide.",
    sourceIds: ["microsoft"],
  },
  {
    id: "n8n",
    name: "n8n",
    product: "Workflow automation",
    group: "Agent & workflow platforms",
    meters: ["Executions"],
    primary: "Executions",
    rate: "Unlimited",
    unit: "users; executions are metered",
    headline: "The workflow runs. The people count does not.",
    description:
      "Subscriptions scale with monthly workflow executions, and a run can contain many steps. Users and workflows are unlimited, with plan-specific limits on concurrency and other capabilities.",
    transition: "A different starting model",
    caution:
      "This is an alternative to seat pricing, not evidence of a recent migration away from it. An execution also does not guarantee a successful business result.",
    sourceIds: ["n8n"],
  },
  {
    id: "zapier",
    name: "Zapier",
    product: "Legacy Agents",
    group: "Agent & workflow platforms",
    meters: ["Actions"],
    primary: "Actions",
    rate: "Activities",
    unit: "per monthly plan allowance",
    headline: "An agent’s actions can matter more than the number of agents.",
    description:
      "Legacy Agents meters activities such as actions, knowledge lookups and web searches. Activities are separate from Zapier task usage. Its October 1 help page flags migration to AI by Zapier.",
    transition: "A model in transition",
    caution:
      "Shown as a documented legacy model, not a recommendation for a new purchase. The migration may change the applicable product and meter.",
    sourceIds: ["zapier"],
  },
  {
    id: "devin",
    name: "Cognition",
    product: "Devin",
    group: "Agent & workflow platforms",
    meters: ["Compute"],
    primary: "Compute",
    rate: "$80",
    unit: "Teams monthly minimum, April 2026",
    headline: "The compute is real, even when the worker is software.",
    description:
      "The April 2026 update gives self-serve plans included usage and dollar-denominated overages tied to model cost. Enterprise continues to use Agent Compute Units.",
    transition: "Repriced its agent plans",
    caution:
      "This is a dated announcement, not a universal current quote. Compute charges track resources consumed, not correctness or accepted code.",
    sourceIds: ["devin"],
  },
  {
    id: "sierra",
    name: "Sierra",
    product: "Customer-service agents",
    group: "Agent & workflow platforms",
    meters: ["Outcomes"],
    primary: "Outcomes",
    rate: "Agreed outcomes",
    unit: "custom commercial terms",
    headline: "Define success first. Attach the invoice second.",
    description:
      "Sierra describes pricing around agreed results such as resolved conversations or retained customers. It also allows blended approaches for interactions better suited to conversation pricing.",
    transition: "A different starting model",
    caution:
      "There is no universal public dollar rate in the cited policy. Outcome definitions and exceptions are contractual, not interchangeable across vendors.",
    sourceIds: ["sierra"],
  },
];

export const timeline = [
  {
    date: "Aug 2024",
    company: "Zendesk",
    text: "Introduces automated-resolution pricing for AI agents.",
    source: "zendesk-launch",
  },
  {
    date: "Nov 2024",
    company: "Zendesk",
    text: "Adds flexibility to move investment between human and AI agents.",
    source: "zendesk-flex",
  },
  {
    date: "May 2025",
    company: "Salesforce",
    text: "Adds Flex Credits and an agreement to shift spend between licenses and credits.",
    source: "salesforce-launch",
  },
  {
    date: "Jun 2025",
    company: "HubSpot",
    text: "Expands Customer Agent access across paid hubs through credits.",
    source: "hubspot-launch",
  },
  {
    date: "Apr 2026",
    company: "Cognition",
    text: "Reworks self-serve Devin plans around included usage and dollar overages.",
    source: "devin",
  },
];

export const narrative = {
  thesis: [
    "A seat used to be a useful shortcut. Count the people who can use the software and you have a rough idea of the work it can do. An agent breaks that shortcut. One person can commission, supervise and approve work happening in several places at once.",
    "That does not make the person irrelevant. It makes the login an incomplete measure of production. The pressure is on seat-only pricing: the assumption that revenue should grow mainly by adding humans to an account.",
    "Our earlier essay made the case for moving beyond seats. Here we examine the receipts: public pricing terms, documented commercial changes, observed AI usage and studies of actual work. The result is a more interesting story than the death of a subscription.",
  ],
  usage: [
    "The clearest divide is between talking to an assistant and embedding a model in a workflow. In Anthropic’s November 2025 sample, automation accounted for 45% of Claude.ai interactions and 75% of first-party API interactions. The same model provider, used in two quite different ways.",
    "These are shares of classified interaction patterns, not shares of jobs eliminated. The samples are selected users of one provider. Still, the commercial implication is straightforward: a system can do substantial work without another person opening another tab.",
  ],
  pricing: [
    "The public record shows established vendors adding new meters and agent companies starting with different ones. It does not show a single replacement winning. A credit can buy an action, model computation or a resolution. The label on the currency is less important than the event that spends it.",
    "Explore nine deliberately selected examples below. This is a map of commercial choices, not a market-share survey. Human seats, usage commitments and outcomes can coexist inside the same vendor’s product family.",
  ],
  simulation: [
    "The threat to seat revenue is conditional. Automation must reduce the number of licensed people required, and contracts must allow that reduction. If freed capacity serves more customers instead, seats can hold steady or grow.",
    "This model makes the assumption visible. Hold work constant and automate more of it: required human capacity falls. Grow demand fast enough and the seat count recovers. A meter based on work follows that second variable directly.",
  ],
  meters: [
    "Suppose one analyst asks a system to prepare one company brief. The system can use one agent or divide the assignment among several. It can run cleanly or retry a failed step. The finished deliverable can stay the same while the count of agents, actions and compute changes.",
    "Charging per agent can turn software architecture into a billing decision. Charging for time on the platform can punish a faster product. Compute time is a defensible cost meter, but it is different from a customer’s time saved. Outcomes get closer to value only when the buyer and seller can agree on what counts.",
  ],
  evidence: [
    "More automation is not proof of better work. A study of 5,172 customer-support agents found that AI assistance increased issues resolved per hour by 15% on average. In a very different setting, METR’s randomized trial of 16 experienced open-source developers found that early-2025 AI tools increased completion time by 19%. Those are different tasks, populations and metrics; they should not be averaged.",
    "METR’s February 2026 follow-up suggests newer tools may help more, but selection effects prevent a reliable estimate of how much. That is exactly why activity is an unsafe synonym for value. An agent that retries for an hour can run up consumption without producing an acceptable answer.",
  ],
  conclusion: [
    "For fintech vendors, the opportunity is to price the capability a firm depends on: entities monitored, portfolios covered, reconciliations accepted or validated research delivered. A platform fee can pay for the data rights, controls and availability. A work allowance can fund the activity. A measurable outcome can justify expansion.",
    "Be careful with investment performance as the outcome. Market returns depend on capital, risk, timing and decisions outside a vendor’s control. A verifiable workflow result is often easier to attribute than portfolio alpha.",
    "Before changing the contract, run a shadow invoice against real customer usage. Define retries, duplicate outputs, human review, refunds and budget limits. Then show the buyer the bill they would have received. Pricing becomes credible when the customer can reproduce it.",
    "The seat still tells you who has access. Increasingly, it does not tell you how much work the software did. That is the decline worth paying attention to.",
  ],
};

export function calculateScenario(automation = 60, demand = 100) {
  const work = (10000 * demand) / 100;
  const humans = Math.ceil((work / 100) * (1 - automation / 100) - 1e-9);
  return {
    work,
    humans,
    seats: humans * 100,
    usage: work,
    hybrid: 2500 + work * 0.75,
  };
}

export function calculateMeters(agents = 4, retries = 1, accepted = true) {
  // One brief, 8 actions and 12 total active compute-minutes per full attempt.
  // Parallel agent count does not change assumed total effort in this example.
  const attempts = retries + 1;
  return {
    seats: 1,
    agents,
    actions: 8 * attempts,
    minutes: 12 * attempts,
    outcomes: accepted ? 1 : 0,
  };
}

const sectionTitles = {
  thesis: "When the login stops measuring the work",
  usage: "Work is moving beyond the chat window",
  pricing: "What companies actually charge for",
  simulation: "When productivity becomes a pricing problem",
  meters: "One job. Five very different meters.",
  evidence: "An agent working is not the same as work that works",
  conclusion: "Sell the capability. Make the unit legible.",
};
const paragraphs = Object.entries(narrative)
  .map(([key, values]) => `## ${sectionTitles[key]}\n\n${values.join("\n\n")}`)
  .join("\n\n");
export const seatPricingPost = {
  id: 77,
  slug: "one-person-ten-agents-what-is-a-seat",
  title: "One Person. Ten Agents. What Is a Seat?",
  excerpt:
    "AI agents are breaking the link between people and software value. Explore nine pricing models, the evidence, and an interactive seat-pricing simulator.",
  author: "Stan Altshuller",
  date: "2026-10-08",
  readTime: "12 min exploration",
  category: "Strategy",
  tags: ["AI", "Pricing", "Research", "Interactive"],
  image: "/img/seat-pricing-research.png",
  content: `${paragraphs}\n\n## The price of intelligence changed\n\nStanford’s 2025 AI Index records a fall from $20 to $0.07 per million tokens for GPT-3.5-level MMLU performance between November 2022 and October 2024. That is about 286 times more tokens for the same money. It is a narrow benchmark comparison, not a forecast of agent profitability.\n\n## Published pricing examples\n\n${vendors
    .map(
      (v) =>
        `### ${v.name}: ${v.product}\n\n${v.rate} ${v.unit}. ${v.description} ${v.caution}\n\n${v.sourceIds
          .map((id) => {
            const s = sources.find((x) => x.id === id);
            return `[${s.publisher}: ${s.title}](${s.url})`;
          })
          .join(" / ")}`,
    )
    .join(
      "\n\n",
    )}\n\n## Chart data and methods\n\nAnthropic report Figure 1.3: Claude.ai automation/augmentation/other shares: ${usageData.map((d) => `${d.period}: ${d.automation}/${d.augmentation}/${d.other}%`).join("; ")}. First-party API: August 2025 77/12/11%; November 2025 75/14/11%. Rounded shares; residual is neither plotted mode. Historical samples, not an October 2026 market estimate.\n\nThe illustrative simulator starts with 10,000 monthly work units and 100 human seats, each able to handle 100 units. Seats cost $100/month, work-only pricing is $1/unit, and hybrid pricing is $2,500/month plus $0.75/unit, so all three cost $10,000 at the no-automation baseline. Human capacity rounds up, and no minimum staffing or review burden is modeled. This is a sensitivity analysis, not a forecast or vendor quote.\n\nThe meter lab assumes one brief, eight actions and twelve total active compute-minutes per attempt. More agents divide the same total work; each retry repeats the full job. Outcome payment requires an accepted brief. These simplified terms do not represent any vendor’s actual billing.\n\n## What the evidence does not establish\n\nThere is no representative SaaS seat-cancellation dataset in this article and no estimate of AI’s causal effect on total SaaS revenue. Zylo reports annual SaaS spend rose 8% in its 2026 sample: a weaker seat metric does not imply lower software bills. This is observed spend, not a price index.\n\n## What does your pricing explain?\n\n[Book 30 minutes with Stan](/book) to talk through your pricing, your positioning and your next stage of growth.\n\n## Sources\n\nPricing reviewed October 8, 2026. Nine selected vendors; no inferred market shares. Public list terms exclude taxes, negotiated discounts and implementation.\n\n${sources.map((s) => `- [${s.publisher}: ${s.title}](${s.url}). ${s.date}. ${s.note}`).join("\n")}\n\n[Read the earlier Acadia essay](/blog/per-seat-pricing-dead-fintech-value-based)`,
};
