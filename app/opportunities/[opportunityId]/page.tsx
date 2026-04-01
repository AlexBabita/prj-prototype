"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowRight,
  Bell,
  ChevronLeft,
  FolderOpen,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react"

import { AppSidebar, type SidebarPage } from "@/components/app-sidebar"
import { CreditConfirmOverlay } from "@/components/credit-confirm-overlay"
import { Button } from "@/components/ui/button"
import {
  DEALBREAKER_CREDITS,
  FIT_CREDITS,
  GAP_CREDITS,
} from "@/lib/engine-credits"
import {
  fitBundleCredits,
  gapBundleCredits,
  useOpportunities,
} from "@/lib/opportunities-context"
import { cn } from "@/lib/utils"
import { dealbreakerClass } from "@/lib/opportunity-data"

type OpportunityDetailTab = "Dealbreaker" | "Fit Assessment" | "Gap & Strategy"

function parseFitBreakdown(breakdown: string): { label: string; value: string }[] {
  if (!breakdown.trim() || !breakdown.includes("/")) return []
  return breakdown.split("/").map((part) => {
    const trimmed = part.trim()
    const m = trimmed.match(/^(.+?)\s+(\d+(?:\.\d+)?)%?$/)
    if (m) return { label: m[1].trim(), value: `${m[2]}%` }
    return { label: trimmed, value: "—" }
  })
}

function severityBadgeClass(severity: string): string {
  switch (severity) {
    case "High":
      return "bg-red-500/15 text-red-800 dark:bg-red-500/20 dark:text-red-300"
    case "Medium":
      return "bg-amber-500/15 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
    case "Low":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function riskBadgeClass(risk: string): string {
  switch (risk) {
    case "High":
      return "bg-red-500/15 text-red-800 dark:bg-red-500/20 dark:text-red-300"
    case "Moderate":
      return "bg-amber-500/15 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
    case "Low":
      return "bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function OpportunityDetailPage() {
  const params = useParams<{ opportunityId: string }>()
  const router = useRouter()
  const {
    getOpportunity,
    credits,
    creditLimit,
    commitDealbreakerRun,
    commitFitRunOnly,
    commitFitBundle,
    commitGapBundle,
    convertOpportunityToProject,
  } = useOpportunities()

  const opportunity = params.opportunityId
    ? getOpportunity(params.opportunityId)
    : undefined

  const fitBreakdownCards = opportunity
    ? parseFitBreakdown(opportunity.fitBreakdown)
    : []

  const [tab, setTab] = useState<OpportunityDetailTab>("Dealbreaker")
  const [showGapConfirmModal, setShowGapConfirmModal] = useState(false)
  const [showFitPrereqModal, setShowFitPrereqModal] = useState(false)

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push("/")
  }

  const handlePageChange = (_page: SidebarPage) => {
    router.push("/")
  }

  const runDealbreaker = () => {
    if (opportunity) {
      commitDealbreakerRun(opportunity.opportunityId)
    }
  }

  const requestFitAssessment = () => {
    if (!opportunity) return
    if (opportunity.dealbreaker === "NO-GO") return
    if (opportunity.fitEngineStatus === "done") return
    if (opportunity.dealbreaker === "Pending") {
      setShowFitPrereqModal(true)
      return
    }
    commitFitRunOnly(opportunity.opportunityId)
  }

  const confirmFitPrereqBundle = () => {
    if (!opportunity) return
    if (commitFitBundle(opportunity.opportunityId)) {
      setShowFitPrereqModal(false)
      setTab("Fit Assessment")
    }
  }

  const openGapAnalysis = () => {
    if (!opportunity || opportunity.gapEngineStatus === "done") return
    if (opportunity.dealbreaker === "NO-GO") return
    setShowGapConfirmModal(true)
  }

  const confirmGapAnalysis = () => {
    if (!opportunity) return
    if (commitGapBundle(opportunity.opportunityId)) {
      setShowGapConfirmModal(false)
      setTab("Gap & Strategy")
    }
  }

  const handleConvert = () => {
    if (opportunity) {
      convertOpportunityToProject(opportunity.opportunityId)
    }
  }

  if (!opportunity) {
    return (
      <div className="flex min-h-svh bg-background">
        <AppSidebar activePage="Projects" onPageChange={handlePageChange} />
        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Opportunity Details</p>
            </div>
          </header>
          <div className="p-4">
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-3 text-xs text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                  Projects
                </Link>
                <span className="px-2">/</span>
                <span>Pipeline</span>
                <span className="px-2">/</span>
                <span>Details</span>
              </div>
              <p className="text-lg font-semibold">Opportunity not found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The selected opportunity does not exist.
              </p>
              <Button
                variant="outline"
                className="mt-4 gap-2"
                onClick={handleBack}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh bg-background">
      <AppSidebar activePage="Projects" onPageChange={handlePageChange} />
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Opportunity Details</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
              <span>
                {credits}/{creditLimit} Credits
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
            <Button size="sm" className="h-8 gap-2 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Ask Tory
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              OB
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Projects
            </Link>
            <span className="px-2">/</span>
            <span>Pipeline</span>
            <span className="px-2">/</span>
            <span className="text-foreground">{opportunity.title}</span>
          </div>

          <section className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{opportunity.title}</p>
                <p className="text-xs text-muted-foreground">
                  {opportunity.opportunityId}
                  {opportunity.externalOpportunityId
                    ? ` · ${opportunity.externalOpportunityId}`
                    : null}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleConvert}
                disabled={Boolean(opportunity.linkedProjectName)}
              >
                {opportunity.linkedProjectName
                  ? "Converted to project"
                  : "Convert to project"}
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(
                ["Dealbreaker", "Fit Assessment", "Gap & Strategy"] as OpportunityDetailTab[]
              ).map((entry) => (
                <Button
                  key={entry}
                  variant={tab === entry ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => setTab(entry)}
                >
                  {entry}
                </Button>
              ))}
            </div>

            <div className="mt-4 rounded-lg border bg-background p-4">
              {tab === "Dealbreaker" ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Dealbreaker screening result
                      </p>
                      <span
                        className={cn(
                          "mt-1 inline-flex rounded-md px-2 py-1 text-xs font-semibold",
                          dealbreakerClass[opportunity.dealbreaker]
                        )}
                      >
                        {opportunity.dealbreaker}
                      </span>
                    </div>
                    {opportunity.dealbreaker === "NO-GO" ? (
                      <Button variant="destructive" size="sm">
                        Decline Opportunity
                      </Button>
                    ) : null}
                    {opportunity.dealbreaker === "Pending" ? (
                      <Button size="sm" onClick={runDealbreaker}>
                        Run Dealbreaker Screening
                      </Button>
                    ) : null}
                  </div>

                  {opportunity.dealbreaker === "NO-GO" ? (
                    <div className="mt-4 space-y-4">
                      {opportunity.dealbreakers.map((item, index) => (
                        <article key={item.title} className="rounded-lg border bg-card p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">
                              Dealbreaker {index + 1}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              Blocking
                            </span>
                          </div>
                          <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">
                            Policy requirement
                          </p>
                          <div className="mt-1 rounded-md border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm">
                            {item.requirement}
                          </div>
                          <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">
                            Conflicting requirement
                          </p>
                          <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                            {item.conflictReason}
                          </div>
                          <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">
                            Citations
                          </p>
                          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                            {item.citations.map((citation) => (
                              <li key={citation}>{citation}</li>
                            ))}
                          </ul>
                        </article>
                      ))}
                    </div>
                  ) : null}

                  {opportunity.dealbreaker === "GO" ? (
                    <div className="mt-6">
                      <div className="rounded-lg border bg-card p-6 text-center">
                        <p className="text-2xl">✓</p>
                        <p className="mt-2 text-xl font-semibold">
                          No Dealbreakers found.
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          This opportunity passes dealbreaker screening.
                        </p>
                      </div>

                      <div className="mt-4 rounded-lg border bg-card p-5">
                        <p className="text-lg font-semibold">
                          Assess Your Fit for This Opportunity
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Understand how well your organization is positioned to
                          win this bid.
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <span className="inline-flex rounded-md bg-muted px-3 py-1 text-sm font-medium">
                            Uses {FIT_CREDITS} credit
                          </span>
                          <Button
                            className="gap-2"
                            onClick={() => setTab("Fit Assessment")}
                            disabled={opportunity.fitEngineStatus === "done"}
                          >
                            Run Fit Assessment
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {opportunity.dealbreaker === "Pending" ? (
                    <div className="mt-4 rounded-lg border bg-card p-4">
                      <p className="text-sm font-semibold">Screening not completed</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Run dealbreaker screening to identify mandatory blocking
                        requirements before fit assessment.
                      </p>
                      <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                        {opportunity.dealbreakerNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              ) : null}

              {tab === "Fit Assessment" ? (
                <div className="space-y-4">
                  {opportunity.dealbreaker === "NO-GO" ? (
                    <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Target className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="mt-4 text-base font-semibold">Fit blocked</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Fit assessment is not available after a NO-GO dealbreaker result.
                        Resolve or decline the opportunity from the Dealbreaker tab.
                      </p>
                    </div>
                  ) : null}

                  {opportunity.dealbreaker !== "NO-GO" &&
                  opportunity.fitEngineStatus === "done" &&
                  opportunity.fitScore !== null ? (
                    <>
                      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="border-b bg-muted/40 px-5 py-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Overall fit
                          </p>
                          <div className="mt-1 flex flex-wrap items-end gap-2">
                            <span className="text-4xl font-bold tabular-nums tracking-tight">
                              {opportunity.fitScore}%
                            </span>
                            <span className="pb-1 text-sm text-muted-foreground">
                              composite score
                            </span>
                          </div>
                          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            {opportunity.fitBreakdown}
                          </p>
                        </div>
                      </div>

                      {fitBreakdownCards.length > 0 ? (
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Score breakdown
                          </p>
                          <div className="grid gap-3 sm:grid-cols-3">
                            {fitBreakdownCards.map((row) => (
                              <div
                                key={row.label}
                                className="rounded-xl border bg-card px-4 py-4 shadow-sm"
                              >
                                <p className="text-xs text-muted-foreground">{row.label}</p>
                                <p className="mt-1 text-2xl font-semibold tabular-nums">
                                  {row.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Highlights
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {opportunity.fitHighlights.length > 0 ? (
                            opportunity.fitHighlights.map((item) => (
                              <div
                                key={item}
                                className="flex gap-3 rounded-xl border bg-card p-4 shadow-sm"
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                  <ListChecks className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {item}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground sm:col-span-2">
                              No highlights were generated for this run.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border bg-gradient-to-br from-card to-muted/30 p-5 shadow-sm">
                        <p className="text-sm font-semibold">Next: Gap &amp; Strategy</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          We see gaps and risks. Run Gap analysis for evidence-backed
                          actions and strategy recommendations.
                        </p>
                        <Button className="mt-4 gap-2" onClick={openGapAnalysis}>
                          Review Gap &amp; Strategy
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : null}

                  {opportunity.dealbreaker !== "NO-GO" &&
                  opportunity.fitEngineStatus === "idle" ? (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Target className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold">Run fit assessment</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {opportunity.fitBreakdown}
                            </p>
                          </div>
                        </div>
                        <Button className="shrink-0 gap-2" onClick={requestFitAssessment}>
                          Run Fit Assessment
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {tab === "Gap & Strategy" ? (
                <div className="space-y-4">
                  {opportunity.dealbreaker === "NO-GO" ? (
                    <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Lightbulb className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="mt-4 text-base font-semibold">Gap analysis unavailable</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Gap &amp; Strategy is not available when the dealbreaker result is
                        NO-GO.
                      </p>
                    </div>
                  ) : null}

                  {opportunity.dealbreaker !== "NO-GO" &&
                  opportunity.gapEngineStatus === "idle" ? (
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">Run Gap &amp; Strategy analysis</p>
                          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                            Runs after Fit Assessment. You will confirm credit cost before
                            the engine executes.
                          </p>
                        </div>
                        <Button
                          variant="default"
                          className="shrink-0 gap-2"
                          onClick={openGapAnalysis}
                        >
                          Run Gap &amp; Strategy Analysis
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {opportunity.dealbreaker !== "NO-GO" &&
                  opportunity.gapEngineStatus === "done" ? (
                    <>
                      {opportunity.gapSummary ? (
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Summary
                          </p>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                              <p className="text-xs text-muted-foreground">Total gaps</p>
                              <p className="mt-1 text-2xl font-bold tabular-nums">
                                {opportunity.gapSummary.totalGaps}
                              </p>
                            </div>
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                              <p className="text-xs text-muted-foreground">Critical gaps</p>
                              <p className="mt-1 text-2xl font-bold tabular-nums text-red-700 dark:text-red-400">
                                {opportunity.gapSummary.criticalGaps}
                              </p>
                            </div>
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                              <p className="text-xs text-muted-foreground">Overall risk</p>
                              <div className="mt-2">
                                <span
                                  className={cn(
                                    "inline-flex rounded-md px-2.5 py-1 text-xs font-semibold",
                                    riskBadgeClass(opportunity.gapSummary.overallRisk)
                                  )}
                                >
                                  {opportunity.gapSummary.overallRisk}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Identified gaps
                        </p>
                        <div className="space-y-3">
                          {opportunity.gapItems.map((gap) => (
                            <article
                              key={gap.title}
                              className="rounded-xl border bg-card p-4 shadow-sm"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <p className="font-semibold leading-snug">{gap.title}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                    {gap.type}
                                  </span>
                                  <span
                                    className={cn(
                                      "rounded-md px-2 py-0.5 text-xs font-semibold",
                                      severityBadgeClass(gap.severity)
                                    )}
                                  >
                                    {gap.severity}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                {gap.description}
                              </p>
                              <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                                <span className="font-medium text-foreground">Impact:</span>{" "}
                                <span className="text-muted-foreground">{gap.impact}</span>
                              </div>
                              <p className="mt-3 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">Evidence:</span>{" "}
                                {gap.evidence}
                              </p>
                            </article>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Recommended actions
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {opportunity.gapActions.map((action) => (
                            <div
                              key={action.title}
                              className="rounded-xl border bg-card p-4 shadow-sm"
                            >
                              <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                {action.type}
                              </span>
                              <p className="mt-2 font-semibold leading-snug">{action.title}</p>
                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {action.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {opportunity.strategyRecommendation ? (
                        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                          <div className="flex items-center gap-2 border-b bg-muted/40 px-5 py-3">
                            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <p className="text-sm font-semibold">Strategy recommendation</p>
                          </div>
                          <div className="space-y-4 p-5">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Primary strategy
                              </p>
                              <p className="mt-1 text-base font-semibold leading-snug">
                                {opportunity.strategyRecommendation.primaryStrategy}
                              </p>
                            </div>
                            <div className="rounded-lg border bg-background/80 p-4 text-sm leading-relaxed text-muted-foreground">
                              {opportunity.strategyRecommendation.reasoning}
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Alternatives
                              </p>
                              <ul className="mt-2 space-y-2">
                                {opportunity.strategyRecommendation.alternatives.map(
                                  (alternative) => (
                                    <li
                                      key={alternative}
                                      className="flex gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
                                    >
                                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                      <span>{alternative}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          {showFitPrereqModal ? (
            <CreditConfirmOverlay
              title="Run Fit Assessment"
              description="Dealbreaker screening must run before Fit. Confirming will run Dealbreaker first, then Fit Assessment, and charge for both steps."
              rows={[
                { label: "Dealbreaker screening", value: `${DEALBREAKER_CREDITS} credits` },
                { label: "Fit assessment", value: `${FIT_CREDITS} credits` },
              ]}
              totalCredits={fitBundleCredits(opportunity)}
              balance={credits}
              afterBalance={Math.max(0, credits - fitBundleCredits(opportunity))}
              confirmLabel="Run Dealbreaker + Fit"
              confirmDisabled={credits < fitBundleCredits(opportunity)}
              onCancel={() => setShowFitPrereqModal(false)}
              onConfirm={confirmFitPrereqBundle}
            />
          ) : null}

          {showGapConfirmModal ? (
            <CreditConfirmOverlay
              title="Confirm Gap & Strategy Analysis"
              description="Gap analysis requires a completed Fit Assessment, which requires Dealbreaker screening when not yet run. Review the bundled cost before continuing."
              rows={[
                ...(opportunity.dealbreaker === "Pending"
                  ? [
                      {
                        label: "Dealbreaker screening",
                        value: `${DEALBREAKER_CREDITS} credits`,
                      },
                    ]
                  : []),
                ...(opportunity.fitEngineStatus !== "done"
                  ? [{ label: "Fit assessment", value: `${FIT_CREDITS} credits` }]
                  : []),
                {
                  label: "Gap & Strategy analysis",
                  value: `${GAP_CREDITS} credits`,
                },
              ]}
              totalCredits={gapBundleCredits(opportunity)}
              balance={credits}
              afterBalance={Math.max(0, credits - gapBundleCredits(opportunity))}
              confirmLabel="Run analysis"
              confirmDisabled={credits < gapBundleCredits(opportunity)}
              onCancel={() => setShowGapConfirmModal(false)}
              onConfirm={confirmGapAnalysis}
            />
          ) : null}
        </div>
      </main>
    </div>
  )
}
