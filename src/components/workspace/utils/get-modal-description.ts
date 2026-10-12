import type { EntityType, FormMode } from "@/lib/types";

export const getModalDescription = (type: EntityType, mode: FormMode) => {
  const descriptions: Record<EntityType, Record<FormMode, string>> = {
    board: {
      create: "Organize tasks and streamline your workflow with a new board.",
      edit: "Update your board details to keep everything organized and relevant.",
    },
    task: {
      create:
        "Define a task to outline your work and track progress effortlessly.",
      edit: "Refine your task details to better align with your goals.",
    },
    column: {
      create:
        "Assign a status to define how tasks progress through your workflow.",
      edit: "Refine the column details to better align with your workflow.",
    },
  };
  return descriptions[type]?.[mode] || "";
};
