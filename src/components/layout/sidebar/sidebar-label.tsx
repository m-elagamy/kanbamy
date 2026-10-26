import { Inbox, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SidebarGroupLabel } from "@/components/ui/sidebar";
import BoardModal from "@/components/workspace/board/board-modal";
import { BoardSearch } from "@/components/workspace/board/board-search";

const SidebarLabel = ({ boardsCount }: { boardsCount?: number }) => {
  return (
    <SidebarGroupLabel
      className={`${boardsCount ? "flex-row justify-between pr-0" : "h-auto flex-col justify-center gap-2 pt-4"} uppercase`}
    >
      <span className="flex items-center gap-2">
        {boardsCount ? (
          "Boards"
        ) : (
          <>
            <Inbox className="size-4"/> Your list is empty
          </>
        )}
        {boardsCount ? (
          <Badge
            variant="outline"
            className="h-5 rounded-md px-[7px] text-[0.690rem]"
            animate={false}
          >
            {boardsCount}
          </Badge>
        ) : null}
      </span>
      <span
        className={
          boardsCount ? "flex items-center gap-1" : "flex w-full items-center"
        }
      >
        {boardsCount ? (
          <BoardSearch
            scope="workspace"
            workspaceTabs="boards"
            compact
            enableShortcut={false}
          />
        ) : null}
        <BoardModal
          mode="create"
          variant="ghost"
          size={boardsCount ? "icon" : "sm"}
          trigger={
            <button
              type="button"
              aria-label="Create board"
              title="Create board"
              className={`${
                boardsCount ? "!size-6 !p-0" : "h-8 w-full"
              } text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent focus-visible:ring-sidebar-ring inline-flex cursor-pointer items-center justify-center !gap-0 rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none`}
            >
              <Plus className="size-4" />
            </button>
          }
        />
      </span>
    </SidebarGroupLabel>
  );
};

export default SidebarLabel;
