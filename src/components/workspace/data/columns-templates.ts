import { Bug, Layers, Sliders, UserRoundCheck } from "lucide-react";
import { BOARD_TEMPLATE_STATUSES } from "@/lib/constants";

const columnsTemplates = [
  {
    id: "personal",
    label: "Personal Productivity",
    icon: UserRoundCheck,
    status: [...BOARD_TEMPLATE_STATUSES.personal],
  },
  {
    id: "agile",
    label: "Agile Development",
    icon: Layers,
    status: [...BOARD_TEMPLATE_STATUSES.agile],
  },
  {
    id: "bug-tracking",
    label: "Bug Tracking",
    icon: Bug,
    status: [...BOARD_TEMPLATE_STATUSES["bug-tracking"]],
  },
  {
    id: "custom",
    label: "Custom Workflow",
    icon: Sliders,
    status: [...BOARD_TEMPLATE_STATUSES.custom],
  },
];

export default columnsTemplates;
