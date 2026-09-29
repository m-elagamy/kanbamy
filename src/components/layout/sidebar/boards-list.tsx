"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SidebarMenu, SidebarMenuSubButton } from "@/components/ui/sidebar";
import type { SimplifiedBoard } from "@/lib/types/stores/board";
import BoardItem from "./board-item";

type BoardsListProps = {
  boards: SimplifiedBoard[];
  totalCount: number;
};

const SIDEBAR_VISIBLE_BOARDS = 6;

export function BoardsList({ boards, totalCount }: BoardsListProps) {
  const pathname = usePathname();
  const isAllBoardsPage = pathname === "/dashboard/boards";

  const isActiveBoard = (boardSlug: string) => {
    return decodeURIComponent(pathname) === `/dashboard/${boardSlug}`;
  };

  const visibleBoardIds = new Set(
    boards.slice(0, SIDEBAR_VISIBLE_BOARDS).map((board) => board.id),
  );
  const activeBoard = boards.find((board) => isActiveBoard(board.slug));

  if (activeBoard && !visibleBoardIds.has(activeBoard.id)) {
    const lastVisibleBoard = boards[SIDEBAR_VISIBLE_BOARDS - 1];
    if (lastVisibleBoard) visibleBoardIds.delete(lastVisibleBoard.id);
    visibleBoardIds.add(activeBoard.id);
  }

  const visibleBoards = boards.filter((board) => visibleBoardIds.has(board.id));
  return (
    <>
      <SidebarMenu>
        {visibleBoards.map((board) => {
          const isActive = isActiveBoard(board.slug);
          const href = `/dashboard/${board.slug}`;

          return (
            <BoardItem
              key={board.id}
              board={board}
              isActive={isActive}
              href={href}
            />
          );
        })}
      </SidebarMenu>

      {totalCount > visibleBoards.length && (
        <SidebarMenuSubButton
          asChild
          isActive={isAllBoardsPage}
          className="text-muted-foreground group/link hover:text-primary mt-2 w-fit cursor-pointer gap-[2px] hover:underline hover:underline-offset-2"
          size="sm"
        >
          <Link
            href="/dashboard/boards"
            aria-current={isAllBoardsPage ? "page" : undefined}
            className="flex items-center gap-1"
          >
            View all
            <ChevronRight className="group-hover/link:text-foreground !size-[14px] transition-all group-hover/link:translate-x-[2px]" />
          </Link>
        </SidebarMenuSubButton>
      )}
    </>
  );
}
