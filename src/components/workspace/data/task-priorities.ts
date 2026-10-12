import { ChevronDown, ChevronUp, Minus, type LucideIcon } from "lucide-react";

export type TaskPriorityOption = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const taskPriorities: TaskPriorityOption[] = [
  {
    id: "low",
    label: "Low",
    icon: ChevronDown,
  },
  {
    id: "medium",
    label: "Medium",
    icon: Minus,
  },
  {
    id: "high",
    label: "High",
    icon: ChevronUp,
  },
];

export default taskPriorities;
