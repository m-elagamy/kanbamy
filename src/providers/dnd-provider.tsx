"use client";

import { createContext, ReactNode, use, useCallback, useEffect, useState } from "react";
import { browser, createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import TaskCard from "@/app/dashboard/components/task/task-card";
import ColumnDragOverlay from "@/app/dashboard/components/column/column-drag-overlay";
import useDndHandlers from "@/hooks/use-dnd-handlers";
import useColumnDndHandlers from "@/hooks/use-column-dnd-handlers";
import {
  dndAnnouncements,
  screenReaderInstructions,
} from "@/utils/dnd-announcements";
import { taskCollisionDetection } from "@/utils/dnd-collision";

type DndProviderProps = {
  children: ReactNode;
  boardId: string;
};

export const DndTaskMoveSuccessContext = createContext<string | null>(null);

const isColumnDrag = (event: { active: { data: { current?: unknown } } }) =>
  (event.active.data.current as { type?: string } | undefined)?.type ===
  "column";

export const DndProvider = ({ children, boardId }: DndProviderProps) => {
  use(browser());
  const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(
    null,
  );
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    }),
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
      handleColumnDragStart(event);
    } else {
      handleTaskDragStart(event);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (isColumnDrag(event)) return;
    handleTaskDragOver(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (isColumnDrag(event)) {
      handleColumnDragEnd(event);
    } else {
      handleTaskDragEnd(event);
    }
  };

  const handleDragCancel = () => {
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
      <DndTaskMoveSuccessContext.Provider value={recentlyMovedTaskId}>
        {children}
      </DndTaskMoveSuccessContext.Provider>
      {createPortal(
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging />}
          {activeColumn && <ColumnDragOverlay column={activeColumn} />}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
};
