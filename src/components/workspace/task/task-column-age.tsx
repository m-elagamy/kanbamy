"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Clock3 } from "lucide-react";
import { STALE_TASK_DAYS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getTaskAgeDays } from "@/utils/task-helpers";

type TaskColumnAgeProps = {
  columnEnteredAt: string;
  compact?: boolean;
  className?: string;
  showIcon?: boolean;
  columnName?: string;
};

export default function TaskColumnAge({
  columnEnteredAt,
  compact = true,
  className,
  showIcon = true,
  columnName,
}: TaskColumnAgeProps) {
  const getDays = useCallback(() => {
    return getTaskAgeDays(columnEnteredAt);
  }, [columnEnteredAt]);
  const days = useSyncExternalStore(
    () => () => undefined,
    getDays,
    () => null,
  );

  if (days === null || days < STALE_TASK_DAYS) return null;

  const label = columnName
    ? `${days} ${days === 1 ? "day" : "days"} in ${columnName}`
    : `${days} ${days === 1 ? "day" : "days"} in stage`;

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-amber-600 dark:text-amber-400",
        compact && "text-xs",
        className,
      )}
      title={label}
      aria-label={label}
    >
      {showIcon && <Clock3 className="size-3 shrink-0" aria-hidden="true" />}
      {compact ? (
        <span>{days}d</span>
      ) : (
        <>
          <span className="max-sm:hidden">{label}</span>
          <span className="sm:hidden">
            {columnName ? `${days}d in ${columnName}` : `${days}d`}
          </span>
        </>
      )}
    </span>
  );
}
