"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import useBoardStore from "@/stores/board";
import deslugify from "@/utils/deslugify";

const DashboardBreadcrumb = () => {
  const pathname = usePathname();
  const { boards, activeBoardId } = useBoardStore(
    useShallow((state) => ({
      boards: state.boards,
      activeBoardId: state.activeBoardId,
    })),
  );
  const boardSlug = pathname.match(/^\/dashboard\/(.+)/)?.[1];

  const boardName = boardSlug
    ? (activeBoardId && boards[activeBoardId]?.title) ||
      deslugify(decodeURIComponent(boardSlug))
    : null;

  return (
    <div className="text-muted-foreground flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-sm">
      <Link
        href="/dashboard"
        className="hover:text-primary flex shrink-0 items-center gap-1 whitespace-nowrap transition-colors"
      >
        <Home size={14} />
        <span>Dashboard</span>
      </Link>
      {boardName && (
        <>
          <ChevronRight size={14} />
          <span className="text-foreground min-w-0 max-w-[45vw] truncate whitespace-nowrap font-medium capitalize sm:max-w-64">
            {boardName}
          </span>
        </>
      )}
    </div>
  );
};

export default DashboardBreadcrumb;
