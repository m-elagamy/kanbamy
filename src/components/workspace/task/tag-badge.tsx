import { cn } from "@/lib/utils";
import type { TagOption } from "@/lib/types";
import { getTaskTagOption } from "../data/task-tags";
import { X } from "lucide-react";

type TagBadgeProps = {
  tag: string;
  option?: TagOption;
  size?: "sm" | "default";
  variant?: "default" | "muted";
  showDot?: boolean;
  onRemove?: () => void;
  className?: string;
};

export default function TagBadge({
  tag,
  option: optionOverride,
  size = "sm",
  variant = "muted",
  showDot = true,
  onRemove,
  className,
}: TagBadgeProps) {
  const option = optionOverride ?? getTaskTagOption(tag);

  const isSmall = size === "sm";
  const isMuted = variant === "muted";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border transition-colors",
        isMuted
          ? "border-border/60 bg-muted/40 font-normal text-muted-foreground hover:border-border hover:text-foreground"
          : cn("font-medium", option.className),
        isSmall
          ? "px-1.5 py-0.5 text-[0.6875rem] leading-tight"
          : "px-2.5 py-1 text-xs leading-normal",
        className,
      )}
    >
      {showDot && (
        <span
          className={cn(
            "shrink-0 rounded-full",
            option.dotColor,
            isSmall ? "size-[5px]" : "size-2",
          )}
          aria-hidden="true"
        />
      )}
      <span className="max-w-[120px] truncate">{option.label}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }
          }}
          className="flex size-3 cursor-pointer items-center justify-center rounded-xs text-current/60 transition-colors hover:bg-current/15 hover:text-current"
          aria-label={`Remove ${option.label} tag`}
        >
          <X className="size-3! shrink-0" aria-hidden="true" />
        </span>
      )}
    </span>
  );
}
