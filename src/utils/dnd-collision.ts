import {
  pointerWithin,
  rectIntersection,
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
