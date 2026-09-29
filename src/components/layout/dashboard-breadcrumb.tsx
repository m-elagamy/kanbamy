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
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <Link
        href="/dashboard"
        className="hover:text-primary flex items-center gap-1 transition-colors"
      >
        <Home size={14} />
        <span>Dashboard</span>
      </Link>
      {boardName && (
        <>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium capitalize">
            {boardName}
          </span>
        </>
      )}
    </div>
  );
};

export default DashboardBreadcrumb;
