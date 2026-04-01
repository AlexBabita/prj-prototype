import type { Opportunity } from "@/lib/opportunity-data"

type DealbreakerCard = Opportunity["dealbreakers"][number]
import { sampleGapActions, sampleGeneratedGaps } from "@/lib/gap-engine-samples"

const noGoTemplate: DealbreakerCard[] = [
  {
    title: "Dealbreaker 1",
    requirement: "Do not pursue opportunities involving restricted jurisdictions.",
    conflictReason:
      "The RFP requires deployment and data handling in a region that conflicts with internal policy.",
    citations: ["Section 2.1 Geography Scope", "Appendix C Compliance Region"],
  },
  {
    title: "Dealbreaker 2",
    requirement: "Exclude bids requiring restricted data residency zones.",
    conflictReason:
      "The document mandates in-country storage that violates internal hosting policy.",
    citations: ["Section 5.4 Data Residency", "Annex B Hosting Requirements"],
  },
]

export function runDealbreakerScreening(opp: Opportunity): Opportunity {
  if (opp.dealbreaker !== "Pending") return opp
  const go = Math.random() > 0.35
  if (go) {
    return {
      ...opp,
      dealbreaker: "GO",
      dealbreakerNotes: [
        "All mandatory compliance requirements are satisfied",
        "Timeline fits submission window",
      ],
      dealbreakers: [],
    }
  }
  return {
    ...opp,
    dealbreaker: "NO-GO",
    dealbreakerNotes: [
      "Dealbreaker screening found mandatory conflicts",
      "Recommend decline unless override is approved",
    ],
    dealbreakers: noGoTemplate.map((d) => ({
      ...d,
      citations: [...d.citations],
    })),
    fitScore: null,
    fitBreakdown: "Fit assessment blocked by NO-GO result",
    fitHighlights: [],
    fitEngineStatus: "idle",
  }
}

export function runFitAssessment(opp: Opportunity): Opportunity {
  if (opp.dealbreaker !== "GO" || opp.fitEngineStatus === "done") return opp
  const fitScore = Math.floor(62 + Math.random() * 32)
  return {
    ...opp,
    fitEngineStatus: "done",
    fitScore,
    fitBreakdown: `Tech ${fitScore + 2} / Domain ${fitScore - 4} / Compliance ${fitScore - 1}`,
    fitHighlights: [
      "Technical architecture match evaluated",
      "Relevant delivery references matched",
      "Compliance package reviewed",
    ],
  }
}

export function runGapAnalysis(opp: Opportunity): Opportunity {
  if (opp.fitEngineStatus !== "done" || opp.gapEngineStatus === "done") return opp
  const criticalCount = sampleGeneratedGaps.filter((item) => item.severity === "High").length
  return {
    ...opp,
    gapEngineStatus: "done",
    gapCount: sampleGeneratedGaps.length,
    highSeverityCount: criticalCount,
    gapItems: sampleGeneratedGaps,
    gapActions: sampleGapActions,
    gapList: sampleGeneratedGaps.map((item) => ({
      item: item.title,
      severity: item.severity,
    })),
    mitigationActions: sampleGapActions.map((item) => item.title),
    strategyRecommendation: {
      primaryStrategy: "Partner-led bid with phased delivery scope",
      reasoning:
        "Compliance readiness is the main blocker. A certified partner combined with phased scope reduces qualification and timeline risk while preserving win potential.",
      alternatives: [
        "Delay bid to build internal compliance ownership",
        "Skip opportunity if partner economics are not acceptable",
      ],
    },
    gapSummary: {
      totalGaps: sampleGeneratedGaps.length,
      criticalGaps: criticalCount,
      overallRisk: criticalCount > 0 ? "High" : "Moderate",
    },
  }
}
