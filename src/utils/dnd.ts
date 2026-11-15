import {
  pointerWithin,
  rectIntersection,
  closestCenter,
  type Collision,
  type CollisionDetection,
  type Announcements,
  type ScreenReaderInstructions,
} from "@dnd-kit/core";
import { useTaskStore } from "@/stores/task";
import { useColumnStore } from "@/stores/column";
import useBoardStore from "@/stores/board";
import { findColumnIdByTaskId } from "@/utils/task-helpers";

type DroppableType = "task" | "column";

const getDroppableType = (collision: Collision): DroppableType | undefined =>
  (
    collision.data?.droppableContainer.data.current as
      | { type?: DroppableType }
      | undefined
  )?.type;

export const taskCollisionDetection: CollisionDetection = (args) => {
  const activeType = (args.active.data.current as { type?: string } | undefined)
    ?.type;

  if (activeType === "column") {
    const pointerCollisions = pointerWithin(args);
    const columnCollision = pointerCollisions.find(
      (collision) => getDroppableType(collision) === "column",
    );
    if (columnCollision) return [columnCollision];

    const centerCollisions = closestCenter(args);
    const centerColumn = centerCollisions.find(
      (collision) => getDroppableType(collision) === "column",
    );
    return centerColumn ? [centerColumn] : rectIntersection(args);
  }

  if (activeType !== "task" || !args.pointerCoordinates) {
    return rectIntersection(args);
  }

  const pointerCollisions = pointerWithin(args);
  const taskCollision = pointerCollisions.find(
    (collision) => getDroppableType(collision) === "task",
  );

  if (taskCollision) return [taskCollision];

  const columnCollision = pointerCollisions.find(
    (collision) => getDroppableType(collision) === "column",
  );

  return columnCollision ? [columnCollision] : [];
};

const getTaskTitle = (taskId: string): string =>
  useTaskStore.getState().tasks[taskId]?.title ?? "task";

const resolveColumnId = (overId: string): string | undefined => {
  const { columnTaskIds } = useTaskStore.getState();
  if (columnTaskIds[overId]) return overId;
  return findColumnIdByTaskId(columnTaskIds, overId);
};

const getColumnStatus = (columnId: string | undefined): string | null => {
  if (!columnId) return null;
  const boardId = useBoardStore.getState().activeBoardId;
  if (!boardId) return null;
  return (
    useColumnStore.getState().columnsByBoard[boardId]?.[columnId]?.status ??
    null
  );
};

const getPositionInColumn = (
  taskId: string,
  columnId: string,
): { index: number; total: number } | null => {
  const taskIds = useTaskStore.getState().columnTaskIds[columnId];
  if (!taskIds) return null;

  const index = taskIds.indexOf(taskId);
  if (index === -1) return null;

  return { index: index + 1, total: taskIds.length };
};

const describeDrop = (taskId: string, overId: string | undefined): string => {
  const title = getTaskTitle(taskId);
  const columnId = overId ? resolveColumnId(overId) : undefined;
  const status = getColumnStatus(columnId);

  if (!columnId || !status) return `Task "${title}".`;

  const position = getPositionInColumn(taskId, columnId);
  if (!position) return `Task "${title}" in the "${status}" column.`;

  return `Task "${title}" in the "${status}" column, position ${position.index} of ${position.total}.`;
};

const getColumnPosition = (
  columnId: string,
): { index: number; total: number } | null => {
  const boardId = useBoardStore.getState().activeBoardId;
  if (!boardId) return null;

  const columns = useColumnStore.getState().columnsByBoard[boardId];
  if (!columns) return null;

  const sorted = Object.values(columns).sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((column) => column.id === columnId);
  if (index === -1) return null;

  return { index: index + 1, total: sorted.length };
};

const describeColumnDrop = (columnId: string): string => {
  const status = getColumnStatus(columnId) ?? "column";
  const position = getColumnPosition(columnId);

  if (!position) return `Column "${status}".`;

  return `Column "${status}", position ${position.index} of ${position.total}.`;
};

const isColumnDrag = (active: { data: { current?: unknown } }) =>
  (active.data.current as { type?: string } | undefined)?.type === "column";

export const screenReaderInstructions: ScreenReaderInstructions = {
  draggable: `
    To pick up a task or column, press space.
    While dragging a task, use the arrow keys to move it over another task or column.
    While dragging a column, use the arrow keys to move it over another column to reorder it.
    Press space again to drop it in its new position, or press escape to cancel.
  `,
};

export const dndAnnouncements: Announcements = {
  onDragStart({ active }) {
    if (isColumnDrag(active)) {
      return `Picked up ${describeColumnDrop(String(active.id))}`;
    }
    return `Picked up ${describeDrop(String(active.id), undefined)}`;
  },
  onDragOver({ active, over }) {
    if (!over) return undefined;
    if (isColumnDrag(active)) {
      return `${describeColumnDrop(String(active.id))} is over the drop target.`;
    }
    return `${describeDrop(String(active.id), String(over.id))} is over the drop target.`;
  },
  onDragEnd({ active, over }) {
    if (isColumnDrag(active)) {
      return `${describeColumnDrop(String(active.id))} was dropped.`;
    }
    if (!over)
      return `${describeDrop(String(active.id), undefined)} was dropped.`;
    return `${describeDrop(String(active.id), String(over.id))} was dropped.`;
  },
  onDragCancel({ active }) {
    if (isColumnDrag(active)) {
      return `Dragging ${describeColumnDrop(String(active.id))} was cancelled.`;
    }
    return `Dragging ${describeDrop(String(active.id), undefined)} was cancelled.`;
  },
};
