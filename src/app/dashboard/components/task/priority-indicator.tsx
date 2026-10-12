import { cn } from "@/lib/utils";
import taskPriorities from "../../data/task-priorities";
import getPriorityIconColor from "@/utils/forms/get-priority-icon-color";
import type { LucideIcon } from "lucide-react";

type PriorityIndicatorProps = {
  priority: string;
  showLabel?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  iconSize?: number;
};

export default function PriorityIndicator({
  priority,
  showLabel = true,
  className,
  icon: IconOverride,
  iconClassName,
  iconSize = 14,
}: PriorityIndicatorProps) {
  const option = taskPriorities.find((item) => item.id === priority);
  const PriorityIcon = IconOverride ?? option?.icon ?? taskPriorities[1].icon;
  const label = option?.label ?? priority;

  return (
    <span
      className={cn(
        "text-muted-foreground inline-flex items-center gap-1 text-xs",
        className,
      )}
      title={`${label} priority`}
      aria-label={`${label} priority`}
    >
      <PriorityIcon
        size={iconSize}
        className={cn(getPriorityIconColor(priority), iconClassName)}
        aria-hidden="true"
      />
      <span className={showLabel ? undefined : "sr-only"}>{label}</span>
    </span>
  );
}
