export type EngineStatus = "idle" | "done"
export type OpportunityDecision = "Pending" | "Proceed" | "Declined"
export type DealbreakerResult = "GO" | "NO-GO" | "Pending"
export type GapSeverity = "Low" | "Medium" | "High"
export type GapType =
  | "Compliance"
  | "Capability"
  | "Capacity"
  | "Relationship"
  | "Commercial"
export type ActionType = "Partner" | "Scope" | "Positioning" | "Delay" | "Skip"
export type GapItem = {
  title: string
  type: GapType
  severity: GapSeverity
  description: string
  impact: string
  evidence: string
}
export type GapAction = {
  title: string
  type: ActionType
  explanation: string
}
export type StrategyRecommendation = {
  primaryStrategy: string
  reasoning: string
  alternatives: string[]
}
export type GapSummary = {
  totalGaps: number
  criticalGaps: number
  overallRisk: "Low" | "Moderate" | "High"
}

export type Opportunity = {
  opportunityId: string
  /** Optional CRM / external reference; UI shows "—" when unset. */
  externalOpportunityId?: string
  title: string
  createdOn: string
  /** Set when the user converts this opportunity into a project. */
  linkedProjectName?: string | null
  dealbreaker: DealbreakerResult
  dealbreakerNotes: string[]
  fitScore: number | null
  fitBreakdown: string
  fitHighlights: string[]
  gapCount: number
  highSeverityCount: number
  mitigationActions: string[]
  gapList: Array<{ item: string; severity: GapSeverity }>
  gapItems: GapItem[]
  gapActions: GapAction[]
  strategyRecommendation: StrategyRecommendation | null
  gapSummary: GapSummary | null
  fitEngineStatus: EngineStatus
  gapEngineStatus: EngineStatus
  decision: OpportunityDecision
  dealbreakers: Array<{
    title: string
    requirement: string
    conflictReason: string
    citations: string[]
  }>
}

export const initialOpportunities: Opportunity[] = [
  {
    opportunityId: "opp-1001",
    title: "Federal Digital Workplace RFP.pdf",
    createdOn: "March 27, 2026",
    linkedProjectName: null,
    dealbreaker: "Pending",
    dealbreakerNotes: ["Awaiting dealbreaker screening before fit assessment"],
    fitScore: null,
    fitBreakdown: "Run Fit & Alignment Engine",
    fitHighlights: [],
    gapCount: 0,
    highSeverityCount: 0,
    mitigationActions: [],
    gapList: [],
    gapItems: [],
    gapActions: [],
    strategyRecommendation: null,
    gapSummary: null,
    fitEngineStatus: "idle",
    gapEngineStatus: "idle",
    decision: "Pending",
    dealbreakers: [],
  },
  {
    opportunityId: "opp-1000",
    externalOpportunityId: "CRM-88421",
    title: "State Health Data Platform RFP.docx",
    createdOn: "March 26, 2026",
    linkedProjectName: null,
    dealbreaker: "GO",
    dealbreakerNotes: [
      "All mandatory compliance requirements are satisfied",
      "Timeline fits submission window",
    ],
    fitScore: 78,
    fitBreakdown: "Tech 82 / Domain 75 / Compliance 77",
    fitHighlights: [
      "Strong cloud modernization references",
      "Good past-performance alignment",
      "Reporting workstream staffing assumptions validated",
    ],
    gapCount: 3,
    highSeverityCount: 1,
    mitigationActions: ["Partner for SOC2 controls", "Expand BI staffing"],
    gapList: [
      { item: "SOC2 operational controls", severity: "High" },
      { item: "Bilingual support bench", severity: "Medium" },
      { item: "Regional delivery SLA proof", severity: "Low" },
    ],
    gapItems: [
      {
        title: "SOC2 operational controls not in current scope",
        type: "Compliance",
        severity: "High",
        description:
          "RFP requests audit-ready SOC2 evidence, while current workspace profile indicates SOC2 controls are partially documented.",
        impact:
          "Missing certification evidence can disqualify the bid during compliance review.",
        evidence: "RFP Section 6.2 Security Controls; Fit factor: Compliance evidence",
      },
      {
        title: "Limited bilingual support bench",
        type: "Capacity",
        severity: "Medium",
        description:
          "RFP requires bilingual service desk support but current staffing plan has no dedicated bilingual rotation.",
        impact:
          "Response quality and SLA confidence may be scored lower versus competitors.",
        evidence: "RFP Section 3.5 Support Model; Fit factor: Team coverage",
      },
      {
        title: "Regional SLA proof is weak",
        type: "Relationship",
        severity: "Low",
        description:
          "Proposal references are strong globally but include limited proof points in the client's target region.",
        impact:
          "Can reduce evaluator confidence in local delivery maturity.",
        evidence: "RFP Appendix A Evaluation Criteria; Fit factor: Past performance",
      },
    ],
    gapActions: [
      {
        title: "Partner with SOC2-certified delivery vendor",
        type: "Partner",
        explanation:
          "Close compliance exposure quickly by attaching partner controls and shared delivery accountability.",
      },
      {
        title: "Scope phased bilingual support ramp",
        type: "Scope",
        explanation:
          "Commit to minimum viable bilingual coverage at launch and expand by milestone.",
      },
      {
        title: "Reposition with regional subcontractor references",
        type: "Positioning",
        explanation:
          "Strengthen narrative with local proof points and named subcontracted experts.",
      },
    ],
    strategyRecommendation: {
      primaryStrategy: "Partner-led bid with scoped rollout",
      reasoning:
        "Primary risk is compliance readiness; combining certified partner coverage with a phased delivery scope protects win probability while keeping timeline intact.",
      alternatives: [
        "Delay submission to build internal compliance package",
        "Skip opportunity if partner terms are not commercially viable",
      ],
    },
    gapSummary: {
      totalGaps: 3,
      criticalGaps: 1,
      overallRisk: "High",
    },
    fitEngineStatus: "done",
    gapEngineStatus: "done",
    decision: "Pending",
    dealbreakers: [],
  },
  {
    opportunityId: "opp-0999",
    title: "AI-Based Retail Analytics (RFP_NG).pdf",
    createdOn: "March 23, 2026",
    linkedProjectName: null,
    dealbreaker: "NO-GO",
    dealbreakerNotes: [
      "Dealbreaker screening found mandatory conflicts",
      "Recommend decline unless override is approved",
    ],
    fitScore: null,
    fitBreakdown: "Fit assessment blocked by NO-GO result",
    fitHighlights: [],
    gapCount: 0,
    highSeverityCount: 0,
    mitigationActions: [],
    gapList: [],
    gapItems: [],
    gapActions: [],
    strategyRecommendation: null,
    gapSummary: null,
    fitEngineStatus: "idle",
    gapEngineStatus: "idle",
    decision: "Pending",
    dealbreakers: [
      {
        title: "Dealbreaker 1",
        requirement: "Do not pursue opportunities involving Chinese agencies.",
        conflictReason:
          "The RFP requires platform deployment across China and engagement with regional government entities.",
        citations: ["Section 2.1 Geography Scope", "Appendix C Compliance Region"],
      },
      {
        title: "Dealbreaker 2",
        requirement: "Exclude bids requiring restricted foreign data residency zones.",
        conflictReason:
          "The document mandates in-country storage in a restricted jurisdiction that violates internal policy.",
        citations: ["Section 5.4 Data Residency", "Annex B Hosting Requirements"],
      },
    ],
  },
]

export const dealbreakerClass: Record<DealbreakerResult, string> = {
  GO: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300",
  "NO-GO":
    "bg-red-500/15 text-red-700 dark:bg-red-500/25 dark:text-red-300",
  Pending:
    "bg-muted text-muted-foreground dark:bg-muted/60 dark:text-muted-foreground",
}
