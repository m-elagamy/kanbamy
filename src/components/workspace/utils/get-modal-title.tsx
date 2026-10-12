import type { EntityType, FormMode } from "@/lib/types";
import { CirclePlus, Edit, type LucideIcon } from "lucide-react";

const modalTitles: Record<
  EntityType,
  Record<FormMode, { icon: LucideIcon; text: string }>
> = {
  task: {
    create: { icon: CirclePlus, text: "New Task" },
    edit: { icon: Edit, text: "Edit Task" },
  },
  board: {
    create: { icon: CirclePlus, text: "New Board" },
    edit: { icon: Edit, text: "Edit Board" },
  },
  column: {
    create: { icon: CirclePlus, text: "New Column" },
    edit: { icon: Edit, text: "Edit Column" },
  },
};

export const getModalTitle = (type: EntityType, mode: FormMode) => {
  const { icon: Icon, text } = modalTitles[type]?.[mode] || {
    icon: null,
    text: "New Item",
  };
  return (
    <>
      {<Icon size={16} />}
      {text}
    </>
  );
};
