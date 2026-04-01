import type { GapAction, GapItem } from "@/lib/opportunity-data"

export const sampleGeneratedGaps: GapItem[] = [
  {
    title: "No named ISO 27001-certified security lead",
    type: "Compliance",
    severity: "High",
    description:
      "The RFP requires an ISO 27001 certified lead during implementation, but the current workspace profile has no named certified owner.",
    impact:
      "Compliance scoring drops and proposal can fail mandatory qualification review.",
    evidence: "RFP Section 4.2 Security Leadership; Fit signal: Missing named compliance owner",
  },
  {
    title: "Limited migration squad capacity for timeline",
    type: "Capacity",
    severity: "Medium",
    description:
      "Requested delivery window is 14 weeks while current plan indicates only one migration squad is available.",
    impact: "Increases schedule risk and lowers confidence in delivery feasibility.",
    evidence: "RFP Section 2.4 Delivery Timeline; Fit factor: Delivery capacity",
  },
  {
    title: "Weak incumbent relationship and references",
    type: "Relationship",
    severity: "Low",
    description:
      "Opportunity prefers teams with prior relationship context and local references; current profile shows limited named local partners.",
    impact: "Can reduce evaluator confidence compared to known vendors.",
    evidence: "RFP Evaluation Matrix (Collaboration); Fit factor: Account context",
  },
]

export const sampleGapActions: GapAction[] = [
  {
    title: "Partner with certified security specialist",
    type: "Partner",
    explanation:
      "Attach an ISO-certified partner as accountable lead for compliance workstream coverage.",
  },
  {
    title: "Adjust scope to phased migration plan",
    type: "Scope",
    explanation:
      "Propose phased go-live with milestone acceptance to de-risk timeline and resource constraints.",
  },
  {
    title: "Position with local subcontractor references",
    type: "Positioning",
    explanation:
      "Strengthen trust by adding local references and named delivery advisors.",
  },
]
