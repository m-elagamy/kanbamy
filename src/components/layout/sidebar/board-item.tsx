import Link from "next/link";
import BoardActions from "@/app/dashboard/components/board/board-actions";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { SimplifiedBoard } from "@/lib/types/stores/board";
import { getBoardIdentity } from "@/lib/utils/board-identity";

type BoardItemProps = {
  board: SimplifiedBoard;
  isActive: boolean;
  href: string;
  hideWhenCollapsed?: boolean;
};

export default function BoardItem({
  board,
  isActive,
  href,
  hideWhenCollapsed,
}: BoardItemProps) {
  const identity = getBoardIdentity(board.title, board.id);

  return (
    <SidebarMenuItem
      key={board.id}
      className={`flex ${hideWhenCollapsed ? "group-data-[collapsible=icon]:hidden" : ""}`}
    >
      <SidebarMenuButton
        tooltip={board.title}
        isActive={isActive}
        className="data-[active=true]:!bg-sidebar-accent data-[active=true]:!text-sidebar-accent-foreground"
        asChild
      >
        <Link href={href} className="gap-1!" aria-label={`Go to board ${board.title}`}>
          <span
            className={`${identity.className} relative right-0.5 flex size-5 shrink-0 items-center justify-center rounded-lg text-[10px] leading-none font-semibold`}
            aria-hidden="true"
          >
            {identity.initial}
          </span>
          <span dir="auto">{board.title}</span>
        </Link>
      </SidebarMenuButton>
      <BoardActions board={board} isSidebarTrigger />
    </SidebarMenuItem>
  );
}
