import { cn } from "@/lib/utils";
import { TASK_TAG_OPTIONS } from "../data/task-tags";
import type { TaskTag } from "@/lib/constants";
import { X } from "lucide-react";

type TagBadgeProps = {
  tag: string;
  size?: "sm" | "default";
  showDot?: boolean;
  onRemove?: () => void;
  className?: string;
};

export default function TagBadge({
  tag,
  size = "sm",
  showDot = true,
  onRemove,
  className,
}: TagBadgeProps) {
  const option = TASK_TAG_OPTIONS[tag as TaskTag] ?? {
    id: tag,
    label: tag,
    className: "bg-muted/60 text-muted-foreground border-border/60",
    dotColor: "bg-muted-foreground/60",
  };

  const isSmall = size === "sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-md transition-colors",
        option.className,
        isSmall
          ? "text-[0.6875rem] px-1.5 py-0.5 leading-tight"
          : "text-xs px-2.5 py-1 leading-normal",
        className,
      )}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full shrink-0",
            option.dotColor,
            isSmall ? "size-1.5" : "size-2",
          )}
          aria-hidden="true"
        />
      )}
      <span className="truncate max-w-[120px]">{option.label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-current/60 hover:text-current ml-0.5 -mr-0.5 rounded-sm p-0.5 outline-none focus-visible:ring-1 focus-visible:ring-current"
          aria-label={`Remove ${option.label} tag`}
        >
          <X className={isSmall ? "size-2.5" : "size-3"} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
