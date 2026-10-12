"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import { CornerDownLeft, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import EmptyResultsIllustration from "@/components/ui/empty-results-illustration";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskModal from "../task/task-modal";
import type { TaskSearchResult } from "@/lib/types";
import type { BoardWithStats } from "@/lib/types/stores/board";
import type { BoardSearchState, TaskSearchState } from "./board-search";
import {
  BoardSearchResultItem,
  TaskSearchResultItem,
} from "./board-search-items";

type BoardSearchDialogProps = {
  open: boolean;
  scope: "board" | "workspace";
  boardId: string | null;
  boardsOnly: boolean;
  activeTab: "tasks" | "boards";
  setActiveTab: (value: "tasks" | "boards") => void;
  query: string;
  setQuery: (value: string) => void;
  normalizedQuery: string;
  isBoardTab: boolean;
  isPending: boolean;
  currentSearch: TaskSearchState | BoardSearchState | null;
  taskResults: TaskSearchResult[];
  boardResults: BoardWithStats[];
  hasMoreBoards: boolean;
  nextCursor: string | null;
  isLoadingMore: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  setTaskSearch: Dispatch<SetStateAction<TaskSearchState | null>>;
  setBoardSearch: Dispatch<SetStateAction<BoardSearchState | null>>;
  setRetry: (value: (current: number) => number) => void;
  onTaskSelect: (task: TaskSearchResult) => void;
  onBoardSelect: (board: BoardWithStats) => void;
  onLoadMore: () => void;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}

export function BoardSearchDialog({
  open,
  scope,
  boardId,
  boardsOnly,
  activeTab,
  setActiveTab,
  query,
  setQuery,
  normalizedQuery,
  isBoardTab,
  isPending,
  currentSearch,
  taskResults,
  boardResults,
  hasMoreBoards,
  nextCursor,
  isLoadingMore,
  loadMoreRef,
  setTaskSearch,
  setBoardSearch,
  setRetry,
  onTaskSelect,
  onBoardSelect,
  onLoadMore,
  onOpenChange,
  onCloseAutoFocus,
}: BoardSearchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-xl md:p-0 [&>button]:top-1 [&>button]:right-2"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>
            {scope === "workspace" ? "Search workspace" : "Search tasks"}
          </DialogTitle>
          <DialogDescription>
            {scope === "workspace"
              ? "Search for boards and tasks by title or description"
              : "Search for tasks by title or description"}
          </DialogDescription>
        </DialogHeader>
        <Command
          shouldFilter={false}
          className="[&_[data-slot=command-input-wrapper]]:bg-input/30 rounded-none"
        >
          <Tabs
            value={scope === "workspace" ? activeTab : "tasks"}
            onValueChange={(value) =>
              setActiveTab(value as "tasks" | "boards")
            }
            className="gap-0"
          >
            <CommandInput
              placeholder={
                isBoardTab
                  ? "Search boards..."
                  : "Search tasks by title or description..."
              }
              className="pr-8"
              value={query}
              onValueChange={setQuery}
            />
            {scope === "workspace" && !boardsOnly && (
              <TabsList className="border-border/70 bg-muted/60 mx-3 mt-3 grid w-auto grid-cols-2 border">
                <TabsTrigger
                  value="boards"
                  className="data-[state=active]:border-border/80 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  Boards
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:border-border/80 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  Tasks
                </TabsTrigger>
              </TabsList>
            )}
            <CommandList>
              {isPending ? (
                <div
                  className="space-y-2 p-3"
                  aria-label={`Searching ${isBoardTab ? "boards" : "tasks"}`}
                >
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-md p-2">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-5 w-14 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : currentSearch?.error && (isBoardTab ? boardResults : taskResults).length === 0 ? (
                <div role="alert" className="space-y-2 py-6 text-center text-sm">
                  <p>{currentSearch.error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (isBoardTab) setBoardSearch(null);
                      else setTaskSearch(null);
                      setRetry((value) => value + 1);
                    }}
                  >
                    Retry
                  </Button>
                </div>
              ) : (isBoardTab ? boardResults : taskResults).length === 0 && !normalizedQuery ? (
                <EmptyState
                  size="compact"
                  className="min-h-56 py-6"
                  illustration={<EmptyResultsIllustration />}
                  title={isBoardTab ? "No boards to search" : "No tasks to search"}
                  description={
                    isBoardTab
                      ? "Create a board, then use search to find it quickly."
                      : "Create a task, then use search to find it quickly."
                  }
                  action={
                    boardId ? (
                      <TaskModal
                        mode="create"
                        boardId={boardId}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                          >
                            <Plus aria-hidden="true" /> Add task
                          </Button>
                        }
                      />
                    ) : undefined
                  }
                />
              ) : (isBoardTab ? boardResults : taskResults).length === 0 ? (
                <EmptyState
                  size="compact"
                  className="min-h-44 py-6"
                  illustration={<EmptyResultsIllustration />}
                  title={isBoardTab ? "No matching boards" : "No matching tasks"}
                  description="Try a different title, keyword, or description."
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
                      Clear search
                    </Button>
                  }
                />
              ) : (
                <CommandGroup heading={isBoardTab ? "Boards" : "Tasks"}>
                  {isBoardTab
                    ? boardResults.map((board) => (
                        <BoardSearchResultItem
                          key={board.id}
                          board={board}
                          onSelect={onBoardSelect}
                        />
                      ))
                    : taskResults.map((task) => (
                        <TaskSearchResultItem
                          key={task.id}
                          task={task}
                          onSelect={onTaskSelect}
                          showBoard={scope === "workspace"}
                        />
                      ))}
                  {(isBoardTab ? hasMoreBoards : Boolean(nextCursor)) && (
                    <div
                      ref={loadMoreRef}
                      className="text-muted-foreground flex min-h-8 items-center justify-center py-1 text-xs"
                      aria-live="polite"
                    >
                      {isLoadingMore ? "Loading more..." : null}
                    </div>
                  )}
                  {currentSearch?.error && (
                    <div className="space-y-1 py-2 text-center">
                      <p className="text-destructive text-xs">{currentSearch.error}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (isBoardTab) {
                            setBoardSearch((current) =>
                              current ? { ...current, error: null } : current,
                            );
                          } else {
                            setTaskSearch((current) =>
                              current ? { ...current, error: null } : current,
                            );
                          }
                          onLoadMore();
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Tabs>
          <div className="text-muted-foreground flex items-center justify-end gap-4 border-t px-3 py-2 text-[0.625rem]">
            <span>Up/Down Navigate</span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="size-3" aria-hidden="true" /> Open
            </span>
            <span>Esc Close</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
