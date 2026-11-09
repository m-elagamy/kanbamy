"use client";

import { Check, ChevronDown, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import taskPriorities from "../data/task-priorities";
import getPriorityIconColor from "@/utils/forms/get-priority-icon-color";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type PriorityValue = "low" | "medium" | "high";

const priorityBadgeStyles: Record<string, string> = {
  high: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  low: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export type PrioritySelectorProps = {
  priority: string;
  showLabel?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  iconSize?: number;
  variant?: "inline" | "badge" | "ghost" | "outline";
  size?: "xs" | "sm" | "default";
  onChange?: (priority: PriorityValue) => void;
  disabled?: boolean;
  onRemove?: () => void;
  align?: "start" | "center" | "end";
};

export default function PrioritySelector({
  priority,
  showLabel = true,
  className,
  icon: IconOverride,
  iconClassName,
  iconSize = 14,
  variant = "inline",
  size = "sm",
  onChange,
  disabled = false,
  onRemove,
  align = "start",
}: PrioritySelectorProps) {
  const option = taskPriorities.find((item) => item.id === priority);
  const PriorityIcon = IconOverride ?? option?.icon ?? taskPriorities[1].icon;
  const label = option?.label ?? priority;

  const renderInner = (hasChevron = false) => (
    <>
      <PriorityIcon
        size={iconSize}
        className={cn(getPriorityIconColor(priority), iconClassName)}
        aria-hidden="true"
      />
      {showLabel ? (
        <span className="truncate capitalize">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
      {hasChevron && (
        <ChevronDown className="size-3 opacity-50" aria-hidden="true" />
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-muted-foreground hover:text-foreground -mr-0.5 ml-0.5 inline-flex size-3.5 items-center justify-center rounded-xs transition-colors"
          aria-label={`Remove ${label} priority filter`}
        >
          <X className="size-2.5" />
        </button>
      )}
    </>
  );

  if (!onChange) {
    if (variant === "badge") {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border font-medium transition-colors",
            priorityBadgeStyles[priority],
            size === "xs"
              ? "px-1.5 py-0.5 text-[0.6875rem] leading-tight"
              : "px-2.5 py-1 text-xs leading-normal",
            className,
          )}
          title={`${label} priority`}
          aria-label={`${label} priority`}
        >
          {renderInner()}
        </span>
      );
    }

    return (
      <span
        className={cn(
          "text-muted-foreground inline-flex items-center gap-1 text-xs",
          className,
        )}
        title={`${label} priority`}
        aria-label={`${label} priority`}
      >
        {renderInner()}
      </span>
    );
  }

  const getInteractiveButtonClasses = () => {
    if (variant === "badge") {
      return cn("border font-medium", priorityBadgeStyles[priority]);
    }
    if (variant === "outline") {
      return "border border-border/70 bg-muted/30 hover:bg-muted/70 hover:border-border text-foreground/80 hover:text-foreground shadow-2xs";
    }
    return "text-muted-foreground hover:text-foreground";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-6.5 rounded-md text-xs font-normal transition-colors",
            showLabel ? "gap-1.5 px-2" : "gap-1 px-1.5",
            getInteractiveButtonClasses(),
            className,
          )}
          disabled={disabled}
          title={`Priority: ${label} (Click to change)`}
          aria-label={`Priority: ${label}`}
        >
          {renderInner(true)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[124px] p-1">
        {taskPriorities.map((item) => {
          const isSelected = item.id === priority;
          return (
            <DropdownMenuItem
              key={item.id}
              className={cn(
                "flex cursor-pointer items-center justify-between py-1.5 text-xs",
                isSelected && "bg-accent font-medium",
              )}
              onClick={() => onChange(item.id as PriorityValue)}
            >
              <span className="flex items-center gap-2">
                <item.icon
                  className={cn("size-3.5", getPriorityIconColor(item.id))}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </span>
              {isSelected && (
                <Check className="text-primary size-3" aria-hidden="true" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { PrioritySelector as PrioritySelector };
