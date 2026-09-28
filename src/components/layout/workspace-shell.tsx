"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import KeyboardShortcuts from "@/components/layout/keyboard-shortcuts";

type WorkspaceShellProps = {
  children: ReactNode;
  sidebar: ReactNode;
  breadcrumb: ReactNode;
  offlineStatus?: ReactNode;
  defaultOpen?: boolean;
};

export default function WorkspaceShell({
  children,
  sidebar,
  breadcrumb,
  offlineStatus,
  defaultOpen = false,
}: WorkspaceShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen} className="bg-muted">
      {sidebar}
      <SidebarInset className="border-border/60 min-h-0 min-w-0 border">
        <header className="border-border/60 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 flex h-12 shrink-0 items-center gap-3 border-b px-4 backdrop-blur md:rounded-t-xl">
          <SidebarTrigger />
          {breadcrumb}
          <div className="ml-auto">
            <KeyboardShortcuts />
          </div>
        </header>
        {offlineStatus}
        <div className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
