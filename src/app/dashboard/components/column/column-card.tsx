import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useShallow } from "zustand/react/shallow";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { SimplifiedColumn } from "@/lib/types/stores/column";
import type { PriorityFilterValue } from "@/lib/types/stores/task";
import type { ClientTask } from "@/lib/types";
import { useTaskStore } from "@/stores/task";
import ColumnHeader from "./column-header";
import NoTasksMessage from "../task/no-tasks-message";
import TaskCard from "../task/task-card";
import { getColumnTasksPageAction } from "@/actions/task";
import { TASKS_PAGE_SIZE, TERMINAL_COLUMN_STATUSES } from "@/lib/constants";
import useLoadingStore from "@/stores/loading";
import QuickAddTask from "../task/quick-add-task";

type ColumnCardProps = {
  boardId: string;
  column: SimplifiedColumn;
  focusedTaskId?: string;
  initialTasks?: ClientTask[];
  hasInitialData?: boolean;
  priorityFilter: PriorityFilterValue;
};

const EMPTY_TASK_IDS: string[] = [];

const ColumnCard = ({
  boardId,
  column,
  focusedTaskId,
  initialTasks = [],
  hasInitialData = false,
  priorityFilter,
}: ColumnCardProps) => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isReordering = useLoadingStore((state) =>
    state.isLoading("column", "updating"),
  );
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
    isDragging,
  } = useSortable({
    id: column.id,
    disabled: isReordering,
    data: { type: "column" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const {
    activeBoardId: taskBoardId,
    taskIds: loadedTaskIds,
    tasksById,
    page,
    replaceColumnTaskPage,
    appendColumnTaskPage,
    setColumnPageLoading,
    setColumnPageError,
  } = useTaskStore(
    useShallow((state) => ({
      activeBoardId: state.activeBoardId,
      taskIds: state.columnTaskIds[column.id] ?? EMPTY_TASK_IDS,
      tasksById: state.tasks,
      page: state.columnPages[column.id],
      replaceColumnTaskPage: state.replaceColumnTaskPage,
      appendColumnTaskPage: state.appendColumnTaskPage,
      setColumnPageLoading: state.setColumnPageLoading,
      setColumnPageError: state.setColumnPageError,
    })),
  );
  const tasks = useMemo(
    () =>
      taskBoardId === boardId
        ? loadedTaskIds.map((id) => tasksById[id]).filter(Boolean)
        : initialTasks,
    [boardId, initialTasks, loadedTaskIds, taskBoardId, tasksById],
  );
  const activePriority = priorityFilter === "all" ? null : priorityFilter;
  const activePage = taskBoardId === boardId ? page : undefined;
  const isCurrentPage = activePage?.filter === priorityFilter;
  const taskPage = activePage ?? {
    nextCursor: null,
    totalCount: 0,
    isLoading: false,
    error: null,
    filter: priorityFilter,
  };
  const matchesPriority = (task: ClientTask) =>
    priorityFilter === "all" || task.priority === priorityFilter;
  const visibleTasks = activePage
    ? isCurrentPage
      ? tasks
      : tasks.filter(matchesPriority)
    : initialTasks.filter(matchesPriority);
  const nextCursor = isCurrentPage ? activePage.nextCursor : null;

  const loadFirstPage = useCallback(async () => {
    setColumnPageLoading(column.id, true);
    try {
      const result = await getColumnTasksPageAction(
        column.id,
        null,
        TASKS_PAGE_SIZE,
        activePriority,
      );
      if (useTaskStore.getState().activeBoardId !== boardId) return;
      if (!result.success || !result.fields) {
        replaceColumnTaskPage(column.id, [], null, priorityFilter, 0);
        setColumnPageError(column.id, result.message);
        return;
      }
      replaceColumnTaskPage(
        column.id,
        result.fields.items,
        result.fields.nextCursor,
        priorityFilter,
        result.fields.totalCount,
      );
    } catch {
      replaceColumnTaskPage(column.id, [], null, priorityFilter, 0);
      setColumnPageError(column.id, "Failed to load tasks.");
    }
  }, [
    activePriority,
    boardId,
    column.id,
    priorityFilter,
    replaceColumnTaskPage,
    setColumnPageError,
    setColumnPageLoading,
  ]);

  useEffect(() => {
    if (hasInitialData && !activePage) return;
    if (isCurrentPage) return;
    void loadFirstPage();
  }, [activePage, hasInitialData, isCurrentPage, loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || activePage?.isLoading) return;
    setColumnPageLoading(column.id, true);

    try {
      const result = await getColumnTasksPageAction(
        column.id,
        nextCursor,
        TASKS_PAGE_SIZE,
        activePriority,
      );
      if (useTaskStore.getState().activeBoardId !== boardId) return;
      if (!result.success || !result.fields) {
        setColumnPageError(column.id, result.message);
        return;
      }
      appendColumnTaskPage(
        column.id,
        result.fields.items,
        result.fields.nextCursor,
      );
    } catch {
      setColumnPageError(column.id, "Failed to load more tasks.");
    }
  }, [
    activePriority,
    appendColumnTaskPage,
    boardId,
    column.id,
    nextCursor,
    activePage?.isLoading,
    setColumnPageError,
    setColumnPageLoading,
  ]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !nextCursor || activePage?.isLoading || activePage?.error)
      return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void loadMore();
      },
      { root: scrollContainerRef.current, rootMargin: "120px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore, nextCursor, activePage?.error, activePage?.isLoading]);

  const taskIds = visibleTasks.map((task) => task.id);
  const isInitialLoading =
    !hasInitialData &&
    Boolean(activePage) &&
    (!isCurrentPage || (taskPage.isLoading && !tasks.length));

  return (
    <Card
      className={`board-lane group/column border-border/80 hover:border-border relative h-full min-h-0 w-[calc(100vw-4.5rem)] max-w-72 shrink-0 snap-start gap-0 overflow-hidden rounded-lg border py-0 transition-[border-color,transform] duration-200 md:w-84 md:max-w-none ${
        isOver
          ? "ring-primary/20 border-primary/40 bg-primary/[0.03] shadow-md ring-2"
          : ""
      }`}
      ref={setNodeRef}
      style={style}
    >
      <ColumnHeader
        column={column}
        tasksCount={
          isCurrentPage
            ? (activePage?.totalCount ?? tasks.length)
            : visibleTasks.length
        }
        dragHandleProps={{ attributes, listeners }}
        onQuickAdd={() => setIsQuickAddOpen(true)}
      />

      <CardContent
        ref={scrollContainerRef}
        className="board-lane-body scrollbar-thumb-border flex-1 scrollbar-thin scrollbar-track-transparent space-y-2.5 overflow-y-auto p-3"
      >
        {isInitialLoading ? (
          <div className="space-y-3" aria-label="Loading tasks">
            {[0, 1, 2].map((item) => (
              <Skeleton
                key={item}
                className="border-border/80 border-s-border/50 bg-card h-20 w-full rounded-lg border-s-2"
              />
            ))}
          </div>
        ) : taskPage.error && visibleTasks.length === 0 ? (
          <div className="space-y-2 py-8 text-center text-sm">
            <p className="text-muted-foreground">{taskPage.error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void loadFirstPage()}
            >
              Retry
            </Button>
          </div>
        ) : taskPage.totalCount === 0 ? (
          !isQuickAddOpen && (
            <NoTasksMessage
              onQuickAdd={() => setIsQuickAddOpen(true)}
              isFiltered={priorityFilter !== "all"}
            />
          )
        ) : visibleTasks.length === 0 ? (
          !isQuickAddOpen && (
            <NoTasksMessage
              onQuickAdd={() => setIsQuickAddOpen(true)}
              isFiltered={priorityFilter !== "all"}
            />
          )
        ) : (
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2.5">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  columnId={column.id}
                  isFocused={task.id === focusedTaskId}
                  showColumnAge={
                    !TERMINAL_COLUMN_STATUSES.includes(column.status)
                  }
                />
              ))}
              {nextCursor && !taskPage.error && (
                <div
                  ref={loadMoreRef}
                  className="text-muted-foreground flex min-h-8 items-center justify-center text-xs"
                  aria-live="polite"
                >
                  {taskPage.isLoading ? "Loading more..." : null}
                </div>
              )}
              {nextCursor && taskPage.error && (
                <div className="space-y-1 text-center">
                  <p className="text-destructive text-xs">
                    {activePage?.error}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void loadMore()}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </SortableContext>
        )}
        {isQuickAddOpen && (
          <QuickAddTask
            columnId={column.id}
            onClose={() => setIsQuickAddOpen(false)}
            priorityFilter={priorityFilter}
          />
        )}
        {!isInitialLoading && !isQuickAddOpen && taskPage.totalCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-8 w-full justify-start opacity-100 transition-opacity md:opacity-0 md:group-focus-within/column:opacity-100 md:group-hover/column:opacity-100"
            onClick={() => setIsQuickAddOpen(true)}
          >
            <Plus aria-hidden="true" />
            Create
          </Button>
        )}
      </CardContent>

      <div className="from-background/50 pointer-events-none absolute right-0 bottom-0 left-0 h-4 bg-gradient-to-t to-transparent" />
    </Card>
  );
};

export default ColumnCard;
