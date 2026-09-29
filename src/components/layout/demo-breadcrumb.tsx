"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DemoBreadcrumb({ boardTitle }: { boardTitle: string }) {
  const pathname = usePathname();
  const isOverview = pathname === "/demo/overview";
  const isTasks = pathname === "/demo/tasks";

  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <Link
        href="/demo/overview"
        className="hover:text-primary flex items-center gap-1 transition-colors"
      >
        <Home size={14} />
        <span>Workspace</span>
      </Link>
      <ChevronRight size={14} />
      <span className="text-foreground max-w-48 truncate font-medium" dir="auto">
        {isOverview ? "Overview" : isTasks ? "Tasks" : boardTitle}
      </span>
    </div>
  );
}
