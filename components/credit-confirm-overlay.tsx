"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

type Row = { label: string; value: string }

export function CreditConfirmOverlay({
  title,
  description,
  children,
  rows,
  totalCredits,
  balance,
  afterBalance,
  confirmLabel,
  confirmDisabled,
  onCancel,
  onConfirm,
}: {
  title: string
  description: string
  children?: ReactNode
  rows: Row[]
  totalCredits: number
  balance: number
  afterBalance: number
  confirmLabel: string
  confirmDisabled: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-xl">
        <p className="text-base font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-4 space-y-2 rounded-md border bg-background p-3 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-2">
              <span>{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
          <div className="border-t pt-2 font-medium">
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span>{totalCredits} credits</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Current balance</span>
            <span>{balance} credits</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Remaining after run</span>
            <span>{afterBalance} credits</span>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" disabled={confirmDisabled} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
