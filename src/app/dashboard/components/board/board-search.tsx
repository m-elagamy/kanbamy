"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  getBoardTasksPageAction,
  getWorkspaceTasksPageAction,
} from "@/actions/task";
import { getUserBoardsPageAction } from "@/actions/user";
import type { ClientTask, TaskSearchPage, TaskSearchResult } from "@/lib/types";
import type { BoardWithStats } from "@/lib/types/stores/board";
import { TASKS_PAGE_SIZE } from "@/lib/constants";
import dynamic from "next/dynamic";
import TaskModal from "../task/task-modal";
import { BoardSearchDialog } from "./board-search-dialog";

const TaskDetailSheet = dynamic(() => import("../task/task-detail-sheet"), {
  ssr: false,
});

export type TaskSearchState = TaskSearchPage & {
  key: string;
  error: string | null;
};

export type BoardSearchState = {
  key: string;
  items: BoardWithStats[];
  page: number;
  totalCount: number;
  error: string | null;
};

export function BoardSearch({
  scope = "board",
  boardId: providedBoardId,
  compact = false,
  mobileCompact = false,
  workspaceTabs = "all",
  enableShortcut = false,
  initialBoards,
  initialBoardsTotalCount,
  basePath = "/dashboard",
}: {
  scope?: "board" | "workspace";
  boardId?: string | null;
  compact?: boolean;
  mobileCompact?: boolean;
  workspaceTabs?: "all" | "boards";
  enableShortcut?: boolean;
  initialBoards?: BoardWithStats[];
  initialBoardsTotalCount?: number;
  basePath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"tasks" | "boards">("boards");
  const [taskSearch, setTaskSearch] = useState<TaskSearchState | null>(null);
  const [boardSearch, setBoardSearch] = useState<BoardSearchState | null>(null);
  const [retry, setRetry] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [hasDetailMounted, setHasDetailMounted] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const pendingTaskRef = useRef<ClientTask | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const boardId = scope === "board" ? (providedBoardId ?? null) : null;
  const canSearch = scope === "workspace" || Boolean(boardId);
  const normalizedQuery = query.trim();
  const taskSearchKey = `${scope}:${boardId ?? "all"}:${normalizedQuery}`;
  const boardSearchKey = `workspace:${normalizedQuery}`;
  const currentTaskSearch =
    taskSearch?.key === taskSearchKey ? taskSearch : null;
  const storedBoardSearch =
    boardSearch?.key === boardSearchKey ? boardSearch : null;
  const currentBoardSearch = useMemo(
    () =>
      storedBoardSearch && normalizedQuery === "" && initialBoards
        ? {
            ...storedBoardSearch,
            items:
              storedBoardSearch.page === 1
                ? initialBoards
                : storedBoardSearch.items.map(
                    (board) =>
                      initialBoards.find(
                        (initialBoard) => initialBoard.id === board.id,
                      ) ?? board,
                  ),
            totalCount:
              initialBoardsTotalCount ?? storedBoardSearch.totalCount,
          }
        : storedBoardSearch,
    [
      initialBoards,
      initialBoardsTotalCount,
      normalizedQuery,
      storedBoardSearch,
    ],
  );
  const boardsOnly = scope === "workspace" && workspaceTabs === "boards";
  const isBoardTab =
    boardsOnly || (scope === "workspace" && activeTab === "boards");
  const nextCursor = currentTaskSearch?.nextCursor ?? null;
  const hasMoreBoards = Boolean(
    currentBoardSearch &&
    currentBoardSearch.items.length < currentBoardSearch.totalCount,
  );

  useEffect(() => {
    if (!enableShortcut) return;

    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) {
        return;
      }

      event.preventDefault();
      setOpen((current) => !current);
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [enableShortcut]);

  useEffect(() => {
    if (!open || !canSearch) return;
    const currentSearch = isBoardTab ? currentBoardSearch : currentTaskSearch;
    if (currentSearch && !currentSearch.error) return;

    let cancelled = false;
    const timeout = setTimeout(
      async () => {
        try {
          if (scope === "workspace" && isBoardTab && initialBoards) {
            const filteredBoards = initialBoards.filter((board) => {
              const searchText = `${board.title} ${board.description ?? ""}`.toLowerCase();
              return searchText.includes(normalizedQuery.toLowerCase());
            });

            if (cancelled) return;
            setBoardSearch({
              key: boardSearchKey,
              items: filteredBoards,
              page: 1,
              totalCount: filteredBoards.length,
              error: null,
            });
            return;
          }

          if (scope === "workspace") {
            const initialBoardPage =
              normalizedQuery === "" && initialBoards
                ? {
                    boards: initialBoards,
                    totalCount: initialBoardsTotalCount ?? initialBoards.length,
                  }
                : null;
            const [boardsResult, tasksResult] = await Promise.all([
              isBoardTab
                ? initialBoardPage
                  ? Promise.resolve({
                      success: true as const,
                      message: "",
                      fields: initialBoardPage,
                    })
                  : getUserBoardsPageAction(1, normalizedQuery)
                : Promise.resolve(null),
              !isBoardTab
                ? getWorkspaceTasksPageAction(
                    normalizedQuery,
                    null,
                    TASKS_PAGE_SIZE,
                  )
                : Promise.resolve(null),
            ]);
            if (cancelled) return;

            const nextBoardSearch = boardsResult
              ? {
                  key: boardSearchKey,
                  items: boardsResult.success
                    ? (boardsResult.fields?.boards ?? [])
                    : [],
                  page: 1,
                  totalCount: boardsResult.success
                    ? (boardsResult.fields?.totalCount ?? 0)
                    : 0,
                  error: boardsResult.success ? null : boardsResult.message,
                }
              : null;
            const nextTaskSearch = tasksResult
              ? {
                  key: taskSearchKey,
                  items: tasksResult.success
                    ? (tasksResult.fields?.items ?? [])
                    : [],
                  nextCursor: tasksResult.success
                    ? (tasksResult.fields?.nextCursor ?? null)
                    : null,
                  error: tasksResult.success ? null : tasksResult.message,
                }
              : null;

            if (nextBoardSearch) setBoardSearch(nextBoardSearch);
            if (nextTaskSearch) setTaskSearch(nextTaskSearch);
          } else {
            const result = await getBoardTasksPageAction(
              boardId!,
              normalizedQuery,
              null,
              TASKS_PAGE_SIZE,
            );
            if (cancelled) return;
            setTaskSearch({
              key: taskSearchKey,
              items: result.success ? (result.fields?.items ?? []) : [],
              nextCursor: result.success
                ? (result.fields?.nextCursor ?? null)
                : null,
              error: result.success ? null : result.message,
            });
          }
        } catch {
          if (!cancelled) {
            if (scope === "workspace") {
              setBoardSearch({
                key: boardSearchKey,
                items: [],
                page: 1,
                totalCount: 0,
                error: "Search failed. Please try again.",
              });
            }
            setTaskSearch({
              key: taskSearchKey,
              items: [],
              nextCursor: null,
              error: "Search failed. Please try again.",
            });
          }
        }
      },
      normalizedQuery ? 250 : 0,
    );

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [
    boardId,
    boardSearchKey,
    canSearch,
    currentBoardSearch,
    currentTaskSearch,
    isBoardTab,
    normalizedQuery,
    open,
    retry,
    scope,
    taskSearchKey,
    boardsOnly,
    initialBoards,
    initialBoardsTotalCount,
  ]);

  const resetSearchState = useCallback(() => {
    setQuery("");
    setActiveTab("boards");
  }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
  }, []);

  const handleSelect = useCallback(
    (task: TaskSearchResult) => {
      const clientTask: ClientTask = {
        id: task.id,
        createdAt: task.createdAt,
        title: task.title,
        description: task.description,
        priority: task.priority,
        order: task.order,
        columnId: task.columnId,
        columnEnteredAt: task.columnEnteredAt,
      };
      if (scope === "workspace") {
        setOpen(false);
        router.push(`${basePath}/${task.board.slug}?task=${task.id}`);
      } else {
        pendingTaskRef.current = clientTask;
        setOpen(false);
      }
    },
    [basePath, router, scope],
  );

  const handleBoardSelect = useCallback(
    (board: BoardWithStats) => {
      setOpen(false);
      router.push(basePath === "/demo" ? "/demo" : `${basePath}/${board.slug}`);
    },
    [basePath, router],
  );

  const handleLoadMore = useCallback(async () => {
    if (
      !canSearch ||
      isLoadingMore ||
      (isBoardTab ? !hasMoreBoards : !nextCursor)
    )
      return;

    setIsLoadingMore(true);
    const requestedKey = isBoardTab ? boardSearchKey : taskSearchKey;
    try {
      if (isBoardTab) {
        const nextPage = (currentBoardSearch?.page ?? 1) + 1;
        const result = await getUserBoardsPageAction(nextPage, normalizedQuery);
        if (!result.success || !result.fields) {
          setBoardSearch((current) =>
            current?.key === requestedKey
              ? { ...current, error: result.message }
              : current,
          );
          return;
        }
        const page = result.fields;

        setBoardSearch((current) => {
          if (current?.key !== requestedKey) return current;
          const existingIds = new Set(current.items.map((board) => board.id));
          return {
            ...current,
            items: [
              ...current.items,
              ...page.boards.filter((board) => !existingIds.has(board.id)),
            ],
            page: nextPage,
            totalCount: page.totalCount,
            error: null,
          };
        });
        return;
      }

      const result =
        scope === "workspace"
          ? await getWorkspaceTasksPageAction(
              normalizedQuery,
              nextCursor,
              TASKS_PAGE_SIZE,
            )
          : await getBoardTasksPageAction(
              boardId!,
              normalizedQuery,
              nextCursor,
              TASKS_PAGE_SIZE,
            );
      if (!result.success || !result.fields) {
        setTaskSearch((current) =>
          current?.key === requestedKey
            ? { ...current, error: result.message }
            : current,
        );
        return;
      }
      const page = result.fields;

      setTaskSearch((current) => {
        if (current?.key !== requestedKey) return current;
        const existingIds = new Set(current.items.map((task) => task.id));
        return {
          ...current,
          items: [
            ...current.items,
            ...page.items.filter((task) => !existingIds.has(task.id)),
          ],
          nextCursor: page.nextCursor,
          error: null,
        };
      });
    } catch {
      if (isBoardTab) {
        setBoardSearch((current) =>
          current?.key === requestedKey
            ? { ...current, error: "Search failed. Please try again." }
            : current,
        );
      } else {
        setTaskSearch((current) =>
          current?.key === requestedKey
            ? { ...current, error: "Search failed. Please try again." }
            : current,
        );
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    boardId,
    boardSearchKey,
    canSearch,
    currentBoardSearch,
    hasMoreBoards,
    isBoardTab,
    isLoadingMore,
    nextCursor,
    normalizedQuery,
    scope,
    taskSearchKey,
  ]);

  useEffect(() => {
    const target = loadMoreRef.current;
    const error = isBoardTab
      ? currentBoardSearch?.error
      : currentTaskSearch?.error;
    const hasMore = isBoardTab ? hasMoreBoards : Boolean(nextCursor);
    if (!target || !hasMore || isLoadingMore || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void handleLoadMore();
      },
      {
        root: target.closest("[cmdk-list]"),
        rootMargin: "80px",
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    currentBoardSearch?.error,
    currentTaskSearch?.error,
    handleLoadMore,
    hasMoreBoards,
    isBoardTab,
    isLoadingMore,
    nextCursor,
  ]);

  const currentSearch = isBoardTab ? currentBoardSearch : currentTaskSearch;
  const isPending = Boolean(open && canSearch && !currentSearch);
  const taskResults = currentTaskSearch?.items ?? [];
  const boardResults = currentBoardSearch?.items ?? [];
  const trigger = compact ? (
    <SidebarMenuButton
      ref={triggerRef}
      className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground !size-6 justify-center !gap-0 !p-0 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2"
      tooltip="Search boards"
      aria-label="Search boards"
      onClick={() => setOpen(true)}
    >
      <Search size={14} aria-hidden="true" />
    </SidebarMenuButton>
  ) : (
    <Button
      ref={triggerRef}
      variant="outline"
      className={`text-muted-foreground min-w-0 justify-start gap-2 pr-2 pl-3 text-sm font-normal ${scope === "workspace" ? "h-11 w-full" : "h-9 sm:w-50 md:w-62.5"} ${mobileCompact ? "max-[639px]:size-9 max-[639px]:justify-center max-[639px]:gap-0 max-[639px]:p-0" : ""}`}
      aria-label={mobileCompact ? "Search tasks" : undefined}
      onClick={() => setOpen(true)}
    >
      <Search size={14} aria-hidden="true" />
      <span className={`min-w-0 flex-1 truncate text-left ${mobileCompact ? "max-[639px]:hidden" : ""}`}>
        {scope === "workspace" ? "Search workspace..." : "Search tasks..."}
      </span>
      <kbd className="bg-muted pointer-events-none hidden rounded border px-1.5 py-0.5 font-mono text-[0.625rem] select-none md:inline-flex">
        Ctrl/Cmd K
      </kbd>
    </Button>
  );

  return (
    <>
      {trigger}

      <BoardSearchDialog
        open={open}
        scope={scope}
        boardId={boardId}
        boardsOnly={boardsOnly}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        query={query}
        setQuery={setQuery}
        normalizedQuery={normalizedQuery}
        isBoardTab={isBoardTab}
        isPending={isPending}
        currentSearch={currentSearch}
        taskResults={taskResults}
        boardResults={boardResults}
        hasMoreBoards={hasMoreBoards}
        nextCursor={nextCursor}
        isLoadingMore={isLoadingMore}
        loadMoreRef={loadMoreRef}
        setTaskSearch={setTaskSearch}
        setBoardSearch={setBoardSearch}
        setRetry={setRetry}
        onTaskSelect={handleSelect}
        onBoardSelect={handleBoardSelect}
        onLoadMore={() => void handleLoadMore()}
        onOpenChange={handleOpenChange}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
          const pendingTask = pendingTaskRef.current;
          if (pendingTask) {
            pendingTaskRef.current = null;
            setSelectedTask(pendingTask);
            setHasDetailMounted(true);
            setIsDetailOpen(true);
            const params = new URLSearchParams(searchParams.toString());
            params.set("focus", pendingTask.id);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
          }
          resetSearchState();
        }}
      />

      {scope === "board" && selectedTask && (
        <>
          {hasDetailMounted && (
            <TaskDetailSheet
              task={selectedTask}
              columnId={selectedTask.columnId}
              open={isDetailOpen}
              onOpenChange={(isOpen) => {
                setIsDetailOpen(isOpen);
                if (!isOpen) {
                  setTimeout(() => {
                    setHasDetailMounted(false);
                    if (!isEditOpen) setSelectedTask(null);
                  }, 350);
                }
              }}
              onEdit={() => {
                setIsDetailOpen(false);
                setIsEditOpen(true);
                setTimeout(() => {
                  setHasDetailMounted(false);
                }, 350);
              }}
            />
          )}
          {isEditOpen && (
            <TaskModal
              mode="edit"
              task={selectedTask}
              columnId={selectedTask.columnId}
              open={isEditOpen}
              onOpenChange={(isOpen) => {
                setIsEditOpen(isOpen);
                if (!isOpen) setSelectedTask(null);
              }}
            />
          )}
        </>
      )}
    </>
  );
}
