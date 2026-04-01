"use client"

import { useState } from "react"
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Folder,
  LayoutGrid,
  Library,
  Shield,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const pages = [
  { key: "Dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "Projects", label: "Projects", icon: Folder },
  { key: "Library", label: "Library", icon: Library },
  { key: "Teams", label: "Teams", icon: Users },
] as const

export type SidebarPage = (typeof pages)[number]["key"]

type AppSidebarProps = {
  activePage: SidebarPage
  onPageChange: (page: SidebarPage) => void
}

export function AppSidebar({ activePage, onPageChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "group/sidebar relative flex h-svh flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-16" : "w-72"
      )}
    >
      <div className="flex h-14 items-center justify-between px-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-accent/40">
            <ClipboardList className="h-5 w-5 text-sidebar-foreground" />
          </div>
          <div
            className={cn(
              "min-w-0 transition-opacity",
              collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <p className="truncate text-lg font-semibold">Projectory.ai</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <ul className="space-y-1">
          {pages.map(({ key, label, icon: Icon }) => (
            <li key={label}>
              <Button
                variant="ghost"
                onClick={() => onPageChange(key)}
                className={cn(
                  "h-10 w-full justify-start gap-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  activePage === key &&
                    "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-3">
        <Button
          variant="ghost"
          className={cn(
            "h-10 w-full justify-start gap-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          <Shield className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Admin Center</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "mt-1 h-10 w-full justify-start gap-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          <CircleHelp className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Need Help?</span>}
        </Button>
      </div>
    </aside>
  )
}
