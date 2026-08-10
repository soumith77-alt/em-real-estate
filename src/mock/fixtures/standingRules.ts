export interface StandingRule {
  id: string;
  title: string;
  body: string;
  appliedIn: string[];
}

export const standingRules: StandingRule[] = [
  {
    id: "rule-cap-rate-range",
    title: "Target cap-rate range",
    body: "For strip- and community-centres, target a going-in capitalization rate between 7.0% and 8.5% on stabilized in-place NOI. Deals underwritten below 6.75% should carry an explicit note explaining the exception (e.g., anchor covenant strength, redevelopment upside).",
    appliedIn: ["Acquisitions", "Underwriting", "IC Memos"],
  },
  {
    id: "rule-min-dscr",
    title: "Minimum debt service coverage ratio",
    body: "Minimum debt service coverage ratio (DSCR) of 1.25x on Year 1 stabilized NOI. Deals below 1.25x DSCR must be flagged as an exception in the IC memo.",
    appliedIn: ["Acquisitions", "Financing"],
  },
  {
    id: "rule-preferred-anchors",
    title: "Preferred anchors",
    body: "Preferred anchors are Walmart Supercentre, Loblaws (including Maxi, Provigo, Real Canadian Superstore), Metro (including Super C), Sobeys (including IGA), and Canadian Tire. Non-preferred anchors require a written explanation of tenant covenant strength and store performance.",
    appliedIn: ["Acquisitions", "Tenant Search"],
  },
  {
    id: "rule-leasehold-qc",
    title: "Leasehold interests in Quebec",
    body: "Do not acquire leasehold interests in Quebec absent a bankable ground lease with at least 60 years of remaining term, no fair-market rent resets in the first 20 years, and unqualified mortgageability language reviewed by external counsel.",
    appliedIn: ["Acquisitions"],
  },
  {
    id: "rule-provinces-in-scope",
    title: "Provinces in scope",
    body: "In-scope provinces are Quebec (QC), Ontario (ON — Eastern Ontario only), New Brunswick (NB), Nova Scotia (NS), Prince Edward Island (PE) and Newfoundland and Labrador (NL). Assets outside these provinces (BC, AB, SK, MB, YT, NT, NU) are out of scope absent a Board-approved exception.",
    appliedIn: ["Acquisitions", "Portfolio Strategy"],
  },
  {
    id: "rule-report-tone",
    title: "Report tone",
    body: "All memos and reports are written in a neutral, evidence-first tone. Every claim is sourced to a page in the data room or a named third-party report. Avoid promotional language; call out risks alongside positives.",
    appliedIn: ["IC Memos", "Underwriting Reports", "Tenant Search"],
  },
  {
    id: "rule-units",
    title: "Units of measurement",
    body: "All measurements in reports are in imperial units. Areas are expressed in square feet (sq ft) rounded to the nearest hundred. Frontage is in feet. Ceiling heights are in feet and inches.",
    appliedIn: ["Underwriting Reports", "Tenant Search", "Data Room"],
  },
  {
    id: "rule-currency",
    title: "Currency",
    body: "All financial figures are expressed in Canadian dollars (CAD) unless the original source is in another currency, in which case the source currency is shown alongside the CAD conversion at the noon exchange rate on the effective date.",
    appliedIn: ["Underwriting Reports", "IC Memos"],
  },
  {
    id: "rule-environmental-flag",
    title: "When to flag environmental risk",
    body: "Automatically flag any Phase II ESA mention, any prior fuel-station or dry-cleaner use on-site, any recognized environmental condition (REC), and any UST — removed or in-place — in the CIM, PCA or environmental reports. Escalate high-severity environmental findings to the environmental advisor before IC.",
    appliedIn: ["Data Room Ingestion", "Red Flags"],
  },
  {
    id: "rule-anchor-covenants",
    title: "Tenant covenants required for anchors",
    body: "For any anchor tenant (>= 20,000 sq ft) the file must include a current corporate financial statement, a signed estoppel, and if the anchor is a franchisee, a corporate guarantee. Missing documents trigger a red flag on the IC memo.",
    appliedIn: ["Underwriting Reports", "Data Room Ingestion"],
  },
  {
    id: "rule-capex-holdback",
    title: "Capex reserve holdback",
    body: "Underwrite a minimum capex reserve of $0.35 per sq ft per year for centres over 20 years old and $0.20 per sq ft per year for centres under 20 years old. Roof and parking lot conditions may increase the reserve.",
    appliedIn: ["Underwriting"],
  },
  {
    id: "rule-broker-fees",
    title: "Broker fees on new leasing",
    body: "Standard leasing commissions are 5% on the initial term and 2.5% on renewal options exercised. Commissions above these levels require asset manager sign-off.",
    appliedIn: ["Leasing", "Underwriting"],
  },
];
