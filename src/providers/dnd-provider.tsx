"use client";

import { createContext, ReactNode, use, useCallback, useEffect, useState } from "react";
import { browser, createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import TaskCard from "@/components/workspace/task/task-card";
import ColumnDragOverlay from "@/components/workspace/column/column-drag-overlay";
import useDndHandlers from "@/hooks/use-dnd-handlers";
import useColumnDndHandlers from "@/hooks/use-column-dnd-handlers";
import {
  dndAnnouncements,
  screenReaderInstructions,
  taskCollisionDetection,
} from "@/utils/dnd";

type DndProviderProps = {
  children: ReactNode;
  boardId: string;
};

export const DndTaskMoveSuccessContext = createContext<string | null>(null);
export const DndTaskMoveSuccessTriggerContext = createContext<
  (taskId: string) => void
>(() => {});
export const DndActiveDragTypeContext = createContext<"task" | "column" | null>(
  null,
);
export const DndIsOverTaskContext = createContext<boolean>(false);

const isColumnDrag = (event: { active: { data: { current?: unknown } } }) =>
  (event.active.data.current as { type?: string } | undefined)?.type ===
  "column";

const isOverTaskTarget = (event: { over: { data: { current?: unknown } } | null }) =>
  (event.over?.data.current as { type?: string } | undefined)?.type === "task";

export const DndProvider = ({ children, boardId }: DndProviderProps) => {
  use(browser());
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(
    null,
  );
  const [activeDragType, setActiveDragType] = useState<
    "task" | "column" | null
  >(null);
  const [isOverTask, setIsOverTask] = useState(false);
  const showTaskMoveSuccess = useCallback((taskId: string) => {
    setRecentlyMovedTaskId(taskId);
  }, []);

  useEffect(() => {
    if (!recentlyMovedTaskId) return;
    const timeout = window.setTimeout(
      () => setRecentlyMovedTaskId(null),
      1200,
    );
    return () => window.clearTimeout(timeout);
  }, [recentlyMovedTaskId]);

  const {
    activeTask,
    handleDragStart: handleTaskDragStart,
    handleDragOver: handleTaskDragOver,
    handleDragEnd: handleTaskDragEnd,
    handleDragCancel: handleTaskDragCancel,
  } = useDndHandlers(showTaskMoveSuccess);

  const {
    activeColumn,
    handleColumnDragStart,
    handleColumnDragEnd,
    handleColumnDragCancel,
  } = useColumnDndHandlers(boardId);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: ["Space"],
        end: ["Space"],
        cancel: ["Escape"],
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (isColumnDrag(event)) {
      setActiveDragType("column");
      setIsOverTask(false);
      handleColumnDragStart(event);
    } else {
      setActiveDragType("task");
      setIsOverTask(false);
      handleTaskDragStart(event);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (isColumnDrag(event)) return;
    setIsOverTask(isOverTaskTarget(event));
    handleTaskDragOver(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null);
    setIsOverTask(false);
    if (isColumnDrag(event)) {
      handleColumnDragEnd(event);
    } else {
      handleTaskDragEnd(event);
    }
  };

  const handleDragCancel = () => {
    setActiveDragType(null);
    setIsOverTask(false);
    handleTaskDragCancel();
    handleColumnDragCancel();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={taskCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      accessibility={{
        announcements: dndAnnouncements,
        screenReaderInstructions,
      }}
    >
      <DndActiveDragTypeContext.Provider value={activeDragType}>
        <DndIsOverTaskContext.Provider value={isOverTask}>
          <DndTaskMoveSuccessTriggerContext.Provider value={showTaskMoveSuccess}>
            <DndTaskMoveSuccessContext.Provider value={recentlyMovedTaskId}>
              {children}
            </DndTaskMoveSuccessContext.Provider>
          </DndTaskMoveSuccessTriggerContext.Provider>
        </DndIsOverTaskContext.Provider>
      </DndActiveDragTypeContext.Provider>
      {createPortal(
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging />}
          {activeColumn && <ColumnDragOverlay column={activeColumn} boardId={boardId} />}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
};
