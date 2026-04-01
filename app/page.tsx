"use client"

import Link from "next/link"
import { type ChangeEvent, useRef, useState } from "react"
import {
  Bell,
  CircleEllipsis,
  FileUp,
  FolderOpen,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react"

import { AppSidebar, type SidebarPage } from "@/components/app-sidebar"
import { CreditConfirmOverlay } from "@/components/credit-confirm-overlay"
import { Button } from "@/components/ui/button"
import {
  DEALBREAKER_CREDITS,
  FIT_CREDITS,
  FULL_V8_PIPELINE_CREDITS,
  GAP_CREDITS,
} from "@/lib/engine-credits"
import {
  type CreateOpportunityEngineMode,
  fitBundleCredits,
  gapBundleCredits,
  useOpportunities,
} from "@/lib/opportunities-context"
import { dealbreakerClass } from "@/lib/opportunity-data"
import type { ProjectRow } from "@/lib/projects-data"
import { cn } from "@/lib/utils"

type ListTab = "Projects" | "Pipeline"

type HomeModal =
  | { kind: "create-project" }
  | {
      kind: "new-opportunity"
      fileName: string
      runMode: CreateOpportunityEngineMode
    }
  | { kind: "db-run"; opportunityId: string }
  | { kind: "fit-prereq"; opportunityId: string }
  | { kind: "gap-run"; opportunityId: string }
  | null

const projectStatusClass: Record<ProjectRow["status"], string> = {
  Missed:
    "bg-orange-500/15 text-orange-700 dark:bg-orange-500/25 dark:text-orange-300",
  New: "bg-blue-500/15 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300",
  "In Progress":
    "bg-amber-500/15 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300",
  Failed: "bg-red-500/15 text-red-700 dark:bg-red-500/25 dark:text-red-300",
  Completed:
    "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300",
}

export default function Page() {
  const {
    opportunities,
    projects,
    credits,
    creditLimit,
    createOpportunityWithEngineRuns,
    deleteOpportunity,
    commitDealbreakerRun,
    commitFitBundle,
    commitGapBundle,
  } = useOpportunities()

  const [activePage, setActivePage] = useState<SidebarPage>("Projects")
  const [listTab, setListTab] = useState<ListTab>("Projects")
  const [modal, setModal] = useState<HomeModal>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openOpportunityFilePicker = () => {
    fileInputRef.current?.click()
  }

  const onOpportunityFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setListTab("Pipeline")
    setActivePage("Projects")
    setModal({
      kind: "new-opportunity",
      fileName: file.name,
      runMode: "dealbreaker-only",
    })
  }

  const handleRunDealbreaker = (opportunityId: string) => {
    setModal({ kind: "db-run", opportunityId })
  }

  const handleRunFit = (opportunityId: string) => {
    const opp = opportunities.find((o) => o.opportunityId === opportunityId)
    if (!opp || opp.dealbreaker === "NO-GO" || opp.fitEngineStatus === "done") {
      return
    }
    if (opp.dealbreaker === "Pending") {
      setModal({ kind: "fit-prereq", opportunityId })
      return
    }
    commitFitBundle(opportunityId)
  }

  const handleRunGap = (opportunityId: string) => {
    const opp = opportunities.find((o) => o.opportunityId === opportunityId)
    if (!opp || opp.dealbreaker === "NO-GO" || opp.gapEngineStatus === "done") {
      return
    }
    setModal({ kind: "gap-run", opportunityId })
  }

  const handleDelete = (opportunityId: string) => {
    if (window.confirm("Delete this opportunity from Pipeline?")) {
      deleteOpportunity(opportunityId)
    }
  }

  const modalOpp =
    modal &&
    modal.kind !== "create-project" &&
    modal.kind !== "new-opportunity"
      ? opportunities.find((o) => o.opportunityId === modal.opportunityId)
      : undefined

  const newOppTotalCredits =
    modal?.kind === "new-opportunity"
      ? modal.runMode === "dealbreaker-only"
        ? DEALBREAKER_CREDITS
        : FULL_V8_PIPELINE_CREDITS
      : 0

  const newOppCreditRows =
    modal?.kind === "new-opportunity"
      ? modal.runMode === "dealbreaker-only"
        ? [{ label: "Dealbreaker screening", value: `${DEALBREAKER_CREDITS} credits` }]
        : [
            { label: "Dealbreaker screening", value: `${DEALBREAKER_CREDITS} credits` },
            { label: "Fit assessment", value: `${FIT_CREDITS} credits` },
            { label: "Gap & Strategy analysis", value: `${GAP_CREDITS} credits` },
          ]
      : []

  const showProjectWorkspace = activePage === "Projects"
  const pageTitle = activePage

  return (
    <div className="flex min-h-svh bg-background">
      <AppSidebar activePage={activePage} onPageChange={setActivePage} />

      <main className="flex min-w-0 flex-1 flex-col">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          aria-hidden
          onChange={onOpportunityFileChange}
        />
        <header className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">{pageTitle}</p>
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
          {showProjectWorkspace ? (
            <>
              <div className="flex items-center gap-2">
                {(["Projects", "Pipeline"] as const).map((tab) => (
                  <Button
                    key={tab}
                    variant={listTab === tab ? "default" : "outline"}
                    size="sm"
                    className="h-8"
                    onClick={() => setListTab(tab)}
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    placeholder={
                      listTab === "Projects" ? "Search projects" : "Search pipeline"
                    }
                    className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none ring-ring/50 transition focus-visible:ring-[3px]"
                  />
                </div>
                {listTab === "Projects" ? (
                  <Button
                    size="sm"
                    className="h-9"
                    onClick={() => setModal({ kind: "create-project" })}
                  >
                    Create Project
                  </Button>
                ) : (
                  <Button size="sm" className="h-9 gap-2" onClick={openOpportunityFilePicker}>
                    <FileUp className="h-4 w-4" />
                    Create opportunity
                  </Button>
                )}
              </div>

              {listTab === "Pipeline" ? (
                <div className="overflow-hidden rounded-lg border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1040px] text-sm">
                      <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">
                            Opportunity
                          </th>
                          <th className="px-3 py-2 text-left font-medium">
                            Dealbreaker
                          </th>
                          <th className="px-3 py-2 text-left font-medium">Fit</th>
                          <th className="px-3 py-2 text-left font-medium">Gap</th>
                          <th className="px-3 py-2 text-left font-medium">
                            Converted to project
                          </th>
                          <th className="px-3 py-2 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {opportunities.map((opportunity) => (
                          <tr
                            key={opportunity.opportunityId}
                            className="border-b last:border-0"
                          >
                            <td className="px-3 py-2.5 font-medium">
                              <Link
                                href={`/opportunities/${opportunity.opportunityId}`}
                                className="hover:underline"
                              >
                                {opportunity.title}
                              </Link>
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className={cn(
                                  "inline-flex rounded-md px-2 py-1 text-xs font-semibold",
                                  dealbreakerClass[opportunity.dealbreaker]
                                )}
                              >
                                {opportunity.dealbreaker}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              {opportunity.fitScore === null ? (
                                <span className="text-xs text-muted-foreground">
                                  Not run
                                </span>
                              ) : (
                                <span className="text-xs font-semibold">
                                  {opportunity.fitScore}%
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-xs">
                              {opportunity.gapEngineStatus === "idle"
                                ? "Not run"
                                : `${opportunity.gapCount} gaps (${opportunity.highSeverityCount} high)`}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-muted-foreground">
                              {opportunity.linkedProjectName ?? "—"}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex flex-wrap gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  disabled={opportunity.dealbreaker !== "Pending"}
                                  onClick={() =>
                                    handleRunDealbreaker(opportunity.opportunityId)
                                  }
                                >
                                  Run DB
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  disabled={
                                    opportunity.dealbreaker === "NO-GO" ||
                                    opportunity.fitEngineStatus === "done"
                                  }
                                  onClick={() => handleRunFit(opportunity.opportunityId)}
                                >
                                  Run Fit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  disabled={
                                    opportunity.dealbreaker === "NO-GO" ||
                                    opportunity.gapEngineStatus === "done"
                                  }
                                  onClick={() => handleRunGap(opportunity.opportunityId)}
                                >
                                  Run Gap
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(opportunity.opportunityId)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-sm">
                      <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">
                            Project Name
                          </th>
                          <th className="px-3 py-2 text-left font-medium">Created On</th>
                          <th className="px-3 py-2 text-left font-medium">Status</th>
                          <th className="px-3 py-2 text-left font-medium">Deadline</th>
                          <th className="px-3 py-2 text-left font-medium">Progress</th>
                          <th className="px-3 py-2 text-left font-medium">%</th>
                          <th className="w-10 px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((project) => (
                          <tr key={project.id} className="border-b last:border-0">
                            <td className="px-3 py-2.5 font-medium">{project.name}</td>
                            <td className="px-3 py-2.5 text-muted-foreground">
                              {project.createdOn}
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className={cn(
                                  "inline-flex rounded-md px-2 py-1 text-xs font-semibold",
                                  projectStatusClass[project.status]
                                )}
                              >
                                {project.status}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground">
                              {project.deadline}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="w-44 space-y-1">
                                <div className="h-2 rounded-full bg-muted">
                                  <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{ width: project.percent }}
                                  />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {project.phase} - {project.remaining}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground">
                              {project.percent}
                            </td>
                            <td className="px-3 py-2.5">
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <CircleEllipsis className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-end gap-3 border-t px-3 py-2 text-xs">
                    <span className="text-muted-foreground">Page 1 of 3</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border bg-card p-10">
              <p className="text-sm font-semibold">{activePage}</p>
              <p className="text-sm text-muted-foreground">
                Foundation view ready. Projects now contains Projects/Opportunities tabs.
              </p>
            </div>
          )}
        </div>
      </main>

      {modal?.kind === "create-project" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-xl">
            <p className="text-base font-semibold">Create project</p>
            <p className="mt-2 text-sm text-muted-foreground">
              In this prototype, new work starts in the Pipeline. Switch to the Pipeline
              tab and use{" "}
              <span className="font-medium text-foreground">Create opportunity</span> to
              upload a file, then run the V8 engines and convert to a project when you are
              ready.
            </p>
            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={() => setModal(null)}>
                OK
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {modal?.kind === "new-opportunity" ? (
        <CreditConfirmOverlay
          title="Create opportunity"
          description={`File: ${modal.fileName}. Choose how to run the V8 engine. You are charged the total shown below; the full pipeline runs Dealbreaker, then Fit (if GO), then Gap (if Fit completes).`}
          rows={newOppCreditRows}
          totalCredits={newOppTotalCredits}
          balance={credits}
          afterBalance={Math.max(0, credits - newOppTotalCredits)}
          confirmLabel="Create & run"
          confirmDisabled={credits < newOppTotalCredits}
          onCancel={() => setModal(null)}
          onConfirm={() => {
            if (
              createOpportunityWithEngineRuns(modal.fileName, modal.runMode)
            ) {
              setModal(null)
            }
          }}
        >
          <div className="space-y-2">
            <button
              type="button"
              onClick={() =>
                setModal((m) =>
                  m?.kind === "new-opportunity"
                    ? { ...m, runMode: "dealbreaker-only" }
                    : m
                )
              }
              className={cn(
                "w-full rounded-lg border p-3 text-left text-sm transition outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
                modal.runMode === "dealbreaker-only"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40"
              )}
            >
              <p className="font-medium">Dealbreaker only</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Run screening first. Run Fit and Gap later from the Pipeline.
              </p>
              <p className="mt-2 text-xs font-semibold text-primary">
                {DEALBREAKER_CREDITS} credit
              </p>
            </button>
            <button
              type="button"
              onClick={() =>
                setModal((m) =>
                  m?.kind === "new-opportunity" ? { ...m, runMode: "full-v8" } : m
                )
              }
              className={cn(
                "w-full rounded-lg border p-3 text-left text-sm transition outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
                modal.runMode === "full-v8"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40"
              )}
            >
              <p className="font-medium">Full pipeline</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Run Dealbreaker, then Fit, then Gap in sequence (later steps skip if
                Dealbreaker is NO-GO). Bundle price is charged upfront.
              </p>
              <p className="mt-2 text-xs font-semibold text-primary">
                {FULL_V8_PIPELINE_CREDITS} credits total
              </p>
            </button>
          </div>
        </CreditConfirmOverlay>
      ) : null}

      {modal?.kind === "db-run" && modalOpp ? (
        <CreditConfirmOverlay
          title="Run Dealbreaker screening"
          description="Dealbreaker screening uses credits. Confirm to run and deduct from your balance."
          rows={[
            { label: "Dealbreaker screening", value: `${DEALBREAKER_CREDITS} credits` },
          ]}
          totalCredits={DEALBREAKER_CREDITS}
          balance={credits}
          afterBalance={Math.max(0, credits - DEALBREAKER_CREDITS)}
          confirmLabel="Run Dealbreaker"
          confirmDisabled={credits < DEALBREAKER_CREDITS}
          onCancel={() => setModal(null)}
          onConfirm={() => {
            if (commitDealbreakerRun(modal.opportunityId)) {
              setModal(null)
            }
          }}
        />
      ) : null}

      {modal?.kind === "fit-prereq" && modalOpp ? (
        <CreditConfirmOverlay
          title="Run Fit Assessment"
          description="Dealbreaker screening must run before Fit. Confirming will run Dealbreaker first, then Fit Assessment, and charge for both steps."
          rows={[
            { label: "Dealbreaker screening", value: `${DEALBREAKER_CREDITS} credits` },
            { label: "Fit assessment", value: `${FIT_CREDITS} credits` },
          ]}
          totalCredits={fitBundleCredits(modalOpp)}
          balance={credits}
          afterBalance={Math.max(0, credits - fitBundleCredits(modalOpp))}
          confirmLabel="Run Dealbreaker + Fit"
          confirmDisabled={credits < fitBundleCredits(modalOpp)}
          onCancel={() => setModal(null)}
          onConfirm={() => {
            if (commitFitBundle(modal.opportunityId)) {
              setModal(null)
            }
          }}
        />
      ) : null}

      {modal?.kind === "gap-run" && modalOpp ? (
        <CreditConfirmOverlay
          title="Confirm Gap & Strategy Analysis"
          description="Gap analysis requires a completed Fit Assessment, which requires Dealbreaker screening when not yet run. Review the bundled cost before continuing."
          rows={[
            ...(modalOpp.dealbreaker === "Pending"
              ? [
                  {
                    label: "Dealbreaker screening",
                    value: `${DEALBREAKER_CREDITS} credits`,
                  },
                ]
              : []),
            ...(modalOpp.fitEngineStatus !== "done"
              ? [{ label: "Fit assessment", value: `${FIT_CREDITS} credits` }]
              : []),
            {
              label: "Gap & Strategy analysis",
              value: `${GAP_CREDITS} credits`,
            },
          ]}
          totalCredits={gapBundleCredits(modalOpp)}
          balance={credits}
          afterBalance={Math.max(0, credits - gapBundleCredits(modalOpp))}
          confirmLabel="Run analysis"
          confirmDisabled={credits < gapBundleCredits(modalOpp)}
          onCancel={() => setModal(null)}
          onConfirm={() => {
            if (commitGapBundle(modal.opportunityId)) {
              setModal(null)
            }
          }}
        />
      ) : null}
    </div>
  )
}
