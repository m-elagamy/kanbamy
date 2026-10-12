import { Inbox, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SidebarGroupLabel } from "@/components/ui/sidebar";
import BoardModal from "@/components/workspace/board/board-modal";
import { BoardSearch } from "@/components/workspace/board/board-search";

const SidebarLabel = ({ boardsCount }: { boardsCount?: number }) => {
  return (
    <SidebarGroupLabel
      className={`${boardsCount ? "flex-row justify-between pr-0" : "flex-col justify-center gap-2 pt-4"} uppercase`}
    >
      <span className={boardsCount ? "flex items-center gap-2" : "flex items-center gap-2"}>
        {boardsCount ? "Boards" : <><Inbox /> Your list is empty</>}
        {boardsCount ? (
          <Badge variant="outline" className="h-5 rounded-md px-[7px] text-[0.690rem]" animate={false}>
            {boardsCount}
          </Badge>
        ) : null}
      </span>
      <span className="flex items-center gap-1">
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
        size="icon"
        trigger={
          <button
            type="button"
            aria-label="Create board"
            title="Create board"
            className="!size-6 !gap-0 !p-0 text-sidebar-foreground/70 hover:text-sidebar-foreground inline-flex items-center justify-center rounded-md transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
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
