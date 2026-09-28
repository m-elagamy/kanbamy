"use client";

import { ReactNode, use } from "react";
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

const isColumnDrag = (event: { active: { data: { current?: unknown } } }) =>
  (event.active.data.current as { type?: string } | undefined)?.type ===
  "column";

export const DndProvider = ({ children, boardId }: DndProviderProps) => {
  use(browser());

  const {
    activeTask,
    handleDragStart: handleTaskDragStart,
    handleDragOver: handleTaskDragOver,
    handleDragEnd: handleTaskDragEnd,
    handleDragCancel: handleTaskDragCancel,
  } = useDndHandlers();

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
      {children}
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
