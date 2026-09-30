"use client";

import { useState } from "react";
import { ListFilter, LoaderCircle, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PriorityFilterValue } from "@/lib/types/stores/task";
import taskPriorities from "../../data/task-priorities";
import getPriorityIconColor from "../../utils/get-priority-icon-color";

type TaskPriorityFilterProps = {
  value?: PriorityFilterValue;
  onValueChange?: (value: PriorityFilterValue) => void;
  isPending?: boolean;
  mobileCompact?: boolean;
};

export function TaskPriorityFilter({
  value,
  onValueChange,
  isPending = false,
  mobileCompact = false,
}: TaskPriorityFilterProps = {}) {
  const [localValue, setLocalValue] = useState<PriorityFilterValue>("all");
  const priorityFilter = value ?? localValue;
  const setPriorityFilter = onValueChange ?? setLocalValue;
  const selectedPriority = taskPriorities.find(
    ({ id }) => id === priorityFilter,
  );

  const canClear = priorityFilter !== "all";

  return (
    <div className="relative">
      <Select
        value={priorityFilter}
        onValueChange={(value) =>
          setPriorityFilter(value as PriorityFilterValue)
        }
      >
        <SelectTrigger
          className={`hover:bg-accent/70 min-w-34 shrink-0 ${mobileCompact ? "max-[639px]:size-9 max-[639px]:min-w-9 max-[639px]:justify-center max-[639px]:gap-0 max-[639px]:p-0 max-[639px]:[&>svg:last-child]:hidden" : ""}`}
          aria-label="Filter tasks by priority"
          aria-busy={isPending}
        >
          <SelectValue>
            <span className="flex items-center gap-2">
              {isPending ? (
                <LoaderCircle
                  size={14}
                  className="text-muted-foreground animate-spin"
                  aria-hidden="true"
                />
              ) : selectedPriority ? (
                <selectedPriority.icon
                  size={14}
                  className={getPriorityIconColor(selectedPriority.id)}
                  aria-hidden="true"
                />
              ) : (
                <ListFilter
                  size={14}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <span className={mobileCompact ? "max-[639px]:hidden" : undefined}>
                {selectedPriority?.label ?? "All priorities"}
              </span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-muted-foreground text-xs">
              Priority
            </SelectLabel>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <ListFilter
                  size={14}
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
                All priorities
              </div>
            </SelectItem>
            {taskPriorities
              .slice()
              .reverse()
              .map(({ id, label, icon: Icon }) => (
                <SelectItem key={id} value={id}>
                  <div className="flex items-center gap-2">
                    <Icon
                      size={14}
                      className={getPriorityIconColor(id)}
                      aria-hidden="true"
                    />
                    {label}
                  </div>
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {canClear && (
        <button
          type="button"
          className="bg-background text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring absolute -top-2 -right-2 z-20 flex size-5 items-center justify-center rounded-full border shadow-sm transition-colors focus-visible:ring-2"
          aria-label="Clear priority filter"
          title="Clear priority filter"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setPriorityFilter("all");
          }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
