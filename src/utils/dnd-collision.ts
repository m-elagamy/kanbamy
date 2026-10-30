import {
  pointerWithin,
  rectIntersection,
  closestCenter,
  type Collision,
  type CollisionDetection,
} from "@dnd-kit/core";

type DroppableType = "task" | "column";

const getDroppableType = (collision: Collision): DroppableType | undefined =>
  (collision.data?.droppableContainer.data.current as
    | { type?: DroppableType }
    | undefined
  )?.type;

export const taskCollisionDetection: CollisionDetection = (args) => {
  const activeType = (args.active.data.current as { type?: string } | undefined)
    ?.type;

  // ??? ??? ????? ????? (Column Drag)
  if (activeType === "column") {
    // ????? ????? ?? ???? ???? ?????? ?????? ??????? ???????
    const pointerCollisions = pointerWithin(args);
    const columnCollision = pointerCollisions.find(
      (collision) => getDroppableType(collision) === "column",
    );
    if (columnCollision) return [columnCollision];

    // ??? ??? ?????? ?? ????? ????? ?? ??? ???????? ?????? closestCenter
    const centerCollisions = closestCenter(args);
    const centerColumn = centerCollisions.find(
      (collision) => getDroppableType(collision) === "column",
    );
    return centerColumn ? [centerColumn] : rectIntersection(args);
  }

  // ??? ??? ????? ????? (Task Drag)
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
