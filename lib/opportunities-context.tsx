"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  CREDIT_LIMIT,
  DEALBREAKER_CREDITS,
  FIT_CREDITS,
  GAP_CREDITS,
  STARTING_CREDITS,
} from "@/lib/engine-credits"
import { initialOpportunities, type Opportunity } from "@/lib/opportunity-data"
import {
  runDealbreakerScreening,
  runFitAssessment,
  runGapAnalysis,
} from "@/lib/opportunity-engine"
import { initialProjects, type ProjectRow } from "@/lib/projects-data"

export function fitBundleCredits(opp: Opportunity): number {
  if (opp.dealbreaker === "Pending") {
    return DEALBREAKER_CREDITS + FIT_CREDITS
  }
  return FIT_CREDITS
}

export function gapBundleCredits(opp: Opportunity): number {
  let total = GAP_CREDITS
  if (opp.fitEngineStatus !== "done") total += FIT_CREDITS
  if (opp.dealbreaker === "Pending") total += DEALBREAKER_CREDITS
  return total
}

function applyFitPrerequisiteChain(opp: Opportunity): Opportunity {
  let o = opp
  if (o.dealbreaker === "Pending") {
    o = runDealbreakerScreening(o)
  }
  if (o.dealbreaker === "GO" && o.fitEngineStatus === "idle") {
    o = runFitAssessment(o)
  }
  return o
}

function applyGapPrerequisiteChain(opp: Opportunity): Opportunity {
  let o = applyFitPrerequisiteChain(opp)
  if (o.fitEngineStatus === "done" && o.gapEngineStatus === "idle") {
    o = runGapAnalysis(o)
  }
  return o
}

type OpportunitiesContextValue = {
  opportunities: Opportunity[]
  projects: ProjectRow[]
  credits: number
  creditLimit: number
  setCredits: (n: number | ((c: number) => number)) => void
  getOpportunity: (id: string) => Opportunity | undefined
  createOpportunityFromRfp: () => void
  deleteOpportunity: (id: string) => void
  convertOpportunityToProject: (id: string) => void
  updateOpportunity: (id: string, updater: (o: Opportunity) => Opportunity) => void
  /** Dealbreaker when Pending. Returns false if not applicable or insufficient credits. */
  commitDealbreakerRun: (id: string) => boolean
  /** Fit when GO and idle; 1 credit. Returns false if blocked. */
  commitFitRunOnly: (id: string) => boolean
  /** Dealbreaker (if needed) + Fit. Deducts `fitBundleCredits`. */
  commitFitBundle: (id: string) => boolean
  /** Full chain for Gap. Deducts `gapBundleCredits`. */
  commitGapBundle: (id: string) => boolean
}

const OpportunitiesContext = createContext<OpportunitiesContextValue | null>(null)

export function OpportunitiesProvider({ children }: { children: ReactNode }) {
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>(initialOpportunities)
  const [projects, setProjects] = useState<ProjectRow[]>(initialProjects)
  const [credits, setCredits] = useState(STARTING_CREDITS)

  const getOpportunity = useCallback(
    (id: string) => opportunities.find((o) => o.opportunityId === id),
    [opportunities]
  )

  const updateOpportunity = useCallback(
    (id: string, updater: (o: Opportunity) => Opportunity) => {
      setOpportunities((prev) =>
        prev.map((o) => (o.opportunityId === id ? updater(o) : o))
      )
    },
    []
  )

  const createOpportunityFromRfp = useCallback(() => {
    const now = new Date()
    const idSuffix = `${now.getTime()}`.slice(-4)
    const newOpportunity: Opportunity = {
      opportunityId: `opp-${idSuffix}`,
      title: `Uploaded RFP ${idSuffix}.pdf`,
      createdOn: now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      linkedProjectName: null,
      dealbreaker: "Pending",
      dealbreakerNotes: ["Awaiting dealbreaker screening before fit assessment"],
      fitScore: null,
      fitBreakdown: "Run Fit & Alignment Engine after dealbreaker GO",
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
    }
    setOpportunities((previous) => [newOpportunity, ...previous])
  }, [])

  const deleteOpportunity = useCallback((id: string) => {
    setOpportunities((prev) => prev.filter((o) => o.opportunityId !== id))
  }, [])

  const convertOpportunityToProject = useCallback((id: string) => {
    const now = new Date()
    const createdOn = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    setOpportunities((prev) => {
      const opp = prev.find((o) => o.opportunityId === id)
      if (!opp) return prev
      const projectName = opp.title.replace(/\.(pdf|docx)$/i, "") || opp.title
      const projectId = `proj-${id}`
      setProjects((p) => {
        if (p.some((row) => row.id === projectId)) return p
        return [
          {
            id: projectId,
            name: projectName,
            createdOn,
            status: "New",
            deadline: "—",
            phase: "A1-1",
            remaining: "Remaining 5",
            percent: "0.00%",
          },
          ...p,
        ]
      })
      return prev.map((o) =>
        o.opportunityId === id ? { ...o, linkedProjectName: projectName } : o
      )
    })
  }, [])

  const commitDealbreakerRun = useCallback((id: string) => {
    const opp = opportunities.find((o) => o.opportunityId === id)
    if (!opp || opp.dealbreaker !== "Pending") return false
    if (credits < DEALBREAKER_CREDITS) return false
    setCredits((c) => c - DEALBREAKER_CREDITS)
    updateOpportunity(id, (o) => runDealbreakerScreening(o))
    return true
  }, [credits, opportunities, updateOpportunity])

  const commitFitRunOnly = useCallback((id: string) => {
    const opp = opportunities.find((o) => o.opportunityId === id)
    if (!opp || opp.dealbreaker !== "GO" || opp.fitEngineStatus === "done") {
      return false
    }
    if (credits < FIT_CREDITS) return false
    setCredits((c) => c - FIT_CREDITS)
    updateOpportunity(id, (o) => runFitAssessment(o))
    return true
  }, [credits, opportunities, updateOpportunity])

  const commitFitBundle = useCallback((id: string) => {
    const opp = opportunities.find((o) => o.opportunityId === id)
    if (!opp || opp.dealbreaker === "NO-GO") return false
    const cost = fitBundleCredits(opp)
    if (credits < cost) return false
    if (opp.dealbreaker === "Pending" && opp.fitEngineStatus === "idle") {
      setCredits((c) => c - cost)
      updateOpportunity(id, (o) => applyFitPrerequisiteChain(o))
      return true
    }
    if (opp.dealbreaker === "GO" && opp.fitEngineStatus === "idle") {
      if (credits < FIT_CREDITS) return false
      setCredits((c) => c - FIT_CREDITS)
      updateOpportunity(id, (o) => runFitAssessment(o))
      return true
    }
    return false
  }, [credits, opportunities, updateOpportunity])

  const commitGapBundle = useCallback((id: string) => {
    const opp = opportunities.find((o) => o.opportunityId === id)
    if (!opp || opp.dealbreaker === "NO-GO" || opp.gapEngineStatus === "done") {
      return false
    }
    const cost = gapBundleCredits(opp)
    if (credits < cost) return false
    setCredits((c) => c - cost)
    updateOpportunity(id, (o) => applyGapPrerequisiteChain(o))
    return true
  }, [credits, opportunities, updateOpportunity])

  const value = useMemo<OpportunitiesContextValue>(
    () => ({
      opportunities,
      projects,
      credits,
      creditLimit: CREDIT_LIMIT,
      setCredits,
      getOpportunity,
      createOpportunityFromRfp,
      deleteOpportunity,
      convertOpportunityToProject,
      updateOpportunity,
      commitDealbreakerRun,
      commitFitRunOnly,
      commitFitBundle,
      commitGapBundle,
    }),
    [
      opportunities,
      projects,
      credits,
      getOpportunity,
      createOpportunityFromRfp,
      deleteOpportunity,
      convertOpportunityToProject,
      updateOpportunity,
      commitDealbreakerRun,
      commitFitRunOnly,
      commitFitBundle,
      commitGapBundle,
    ]
  )

  return (
    <OpportunitiesContext.Provider value={value}>
      {children}
    </OpportunitiesContext.Provider>
  )
}

export function useOpportunities() {
  const ctx = useContext(OpportunitiesContext)
  if (!ctx) {
    throw new Error("useOpportunities must be used within OpportunitiesProvider")
  }
  return ctx
}
