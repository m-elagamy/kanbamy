import { Folder, FolderOpen, Inbox, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SidebarGroupLabel, SidebarMenuButton } from "@/components/ui/sidebar";
import BoardModal from "@/components/workspace/board/board-modal";
import { BoardSearch } from "@/components/workspace/board/board-search";

const SidebarLabel = ({
  boardsCount,
  isOpen = true,
  onToggle,
}: {
  boardsCount?: number;
  isOpen?: boolean;
  onToggle?: () => void;
}) => {
  const FolderIcon = isOpen ? FolderOpen : Folder;

  return (
    <>
      {boardsCount ? (
        <SidebarMenuButton
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Collapse boards" : "Expand boards"}
          tooltip={`Boards (${boardsCount})`}
          className="hidden group-data-[collapsible=icon]:flex"
        >
          <FolderIcon className="size-4 shrink-0" aria-hidden="true" />
        </SidebarMenuButton>
      ) : null}
      <SidebarGroupLabel
        className={`${boardsCount ? "flex-row justify-between pr-0 group-data-[collapsible=icon]:hidden" : "h-auto flex-col justify-center gap-2 pt-4"} uppercase`}
      >
        {boardsCount ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="hover:text-sidebar-foreground focus-visible:ring-sidebar-ring flex cursor-pointer items-center gap-1.5 rounded-sm text-xs font-medium uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:invisible"
          >
            <FolderIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Boards</span>
            <Badge
              variant="outline"
              className="h-5 rounded-md px-[7px] text-[0.690rem]"
              animate={false}
            >
              {boardsCount}
            </Badge>
          </button>
        ) : (
          <span className="flex items-center gap-2">
            <Inbox className="size-4" /> Your list is empty
          </span>
        )}
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
    </>
  );
};

export default SidebarLabel;
