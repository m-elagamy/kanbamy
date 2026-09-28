import { useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { updateTaskPositionAction } from "@/actions/task";
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import type { ClientTask } from "@/lib/types";
import { useTaskStore } from "@/stores/task";
import { findColumnIdByTaskId } from "@/utils/task-helpers";
import useTaskStateComparison from "./use-task-position-comparison";
import handleOnError from "@/utils/handle-on-error";
import useLoadingStore from "@/stores/loading";

type TaskMoveSuccessHandler = (taskId: string) => void;

const useDndHandlers = (onTaskMoveSuccess?: TaskMoveSuccessHandler) => {
  const dragOperationRef = useRef<string | null>(null);
  const {
    getTask,
    moveTaskBetweenColumns,
    reorderTaskWithinColumn,
    activeTaskId,
    setActiveTask,
    rollback,
    captureSnapshot,
    clearSnapshot,
  } = useTaskStore(
    useShallow((state) => ({
      getTask: state.getTask,
      moveTaskBetweenColumns: state.moveTaskBetweenColumns,
      reorderTaskWithinColumn: state.reorderTaskWithinColumn,
      activeTaskId: state.activeTaskId,
      setActiveTask: state.setActiveTask,
      rollback: state.rollback,
      captureSnapshot: state.captureSnapshot,
      clearSnapshot: state.clearSnapshot,
    })),
  );

  const activeTask = activeTaskId ? getTask(activeTaskId) : null;
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);
  const { captureInitialPosition, hasTaskPositionChanged } =
    useTaskStateComparison();

  const getTasksByColumnId = () => {
    const taskStore = useTaskStore.getState();
    return Object.keys(taskStore.columnTaskIds).reduce(
      (acc, columnId) => {
        acc[columnId] = taskStore.getColumnTasks(columnId);
        return acc;
      },
      {} as Record<string, ClientTask[]>,
    );
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (!active?.id) return;
    const task = getTask(String(active.id));

    if (!task) return;

    setActiveTask(task);
    dragOperationRef.current = captureSnapshot(String(active.id));
    captureInitialPosition(getTasksByColumnId());
  };

  const processDragEvent = (
    activeId: string,
    overId: string,
    isEnd = false,
  ) => {
    const taskStore = useTaskStore.getState();
    const { columnTaskIds } = taskStore;
    const fromColumnId = findColumnIdByTaskId(columnTaskIds, activeId);
    const isOverTask = !!taskStore.getTask(overId);
    const toColumnId = isOverTask
      ? findColumnIdByTaskId(columnTaskIds, overId)
      : overId;
    if (!fromColumnId || !toColumnId) return;

    if (fromColumnId === toColumnId) {
      if (isEnd && isOverTask) {
        reorderTaskWithinColumn(fromColumnId, activeId, overId);
      }
    } else {
      moveTaskBetweenColumns(
        activeId,
        fromColumnId,
        toColumnId,
        isOverTask ? overId : undefined,
        true,
      );
    }

    if (isEnd) {
      const updatedTaskOrder =
        useTaskStore.getState().columnTaskIds[toColumnId] || [];
      if (
        hasTaskPositionChanged(getTasksByColumnId(), fromColumnId, toColumnId)
      ) {
        const taskIndex = updatedTaskOrder.indexOf(activeId);
        const previousTaskId = updatedTaskOrder[taskIndex - 1] ?? null;
        const nextTaskId = updatedTaskOrder[taskIndex + 1] ?? null;
        setIsLoading("task", "updating", true, activeId);
        updateTaskPositionAction(
          activeId,
          toColumnId,
          previousTaskId,
          nextTaskId,
        )
          .then((result) => {
            if (!result.success) {
              handleOnError(result.message, "Failed to move task");
              rollback(dragOperationRef.current ?? undefined);
            } else {
              if (result.fields) {
                useTaskStore
                  .getState()
                  .updateTask(activeId, result.fields);
              }
              onTaskMoveSuccess?.(activeId);
              useTaskStore.getState().clearSnapshot(dragOperationRef.current ?? undefined);
            }
          })
          .catch((error) => {
            handleOnError(error, "Failed to move task");
            rollback(dragOperationRef.current ?? undefined);
          })
          .finally(() => {
            setIsLoading("task", "updating", false, activeId);
          });
      }
      if (
        !hasTaskPositionChanged(getTasksByColumnId(), fromColumnId, toColumnId)
      ) {
        clearSnapshot(dragOperationRef.current ?? undefined);
        dragOperationRef.current = null;
      }
      setActiveTask(null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Drag-over is preview-only. The store is updated once on drop so the
    // sortable list does not repeatedly mutate while the pointer moves.
    void event;
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!active?.id || !over?.id) {
      rollback(dragOperationRef.current ?? undefined);
      setActiveTask(null);
      dragOperationRef.current = null;
      return;
    }

    processDragEvent(String(active.id), String(over.id), true);
  };

  return {
    activeTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel: () => {
      rollback(dragOperationRef.current ?? undefined);
      setActiveTask(null);
      dragOperationRef.current = null;
    },
  };
};

export default useDndHandlers;
