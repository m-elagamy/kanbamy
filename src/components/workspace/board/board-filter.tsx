"use client";

import { type MouseEvent } from "react";
import {
  Flag,
  ListFilter,
  LoaderCircle,
  RotateCcw,
  Tag,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
} from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { BoardFilters } from "@/lib/types/stores/task";
import type { Priority } from "@prisma/client";
import taskPriorities from "../data/task-priorities";
import taskTagsList from "../data/task-tags";
import TagBadge from "../task/tag-badge";
import getPriorityIconColor from "@/utils/forms/get-priority-icon-color";

type BoardFilterProps = {
  filters: BoardFilters;
  onFiltersChange: (filters: BoardFilters) => void;
  isPending?: boolean;
  mobileCompact?: boolean;
};

type PriorityBadgeProps = {
  priority: string;
  size?: "sm" | "default";
  onRemove?: () => void;
  className?: string;
};

function PriorityBadge({
  priority,
  size = "sm",
  onRemove,
  className,
}: PriorityBadgeProps) {
  const option = taskPriorities.find((p) => p.id === priority);
  if (!option) return null;
  const Icon = option.icon;
  const isSmall = size === "sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-medium transition-colors",
        priority === "high" &&
          "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
        priority === "medium" &&
          "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        priority === "low" &&
          "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
        isSmall
          ? "px-1.5 py-0.5 text-[0.6875rem] leading-tight"
          : "px-2.5 py-1 text-xs leading-normal",
        className,
      )}
    >
      <Icon
        className={cn(
          "shrink-0",
          isSmall ? "size-3!" : "size-3.5!",
          getPriorityIconColor(priority),
        )}
        aria-hidden="true"
      />
      <span className="truncate">{option.label}</span>
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
          aria-label={`Remove ${option.label} priority`}
        >
          <X className="size-3! shrink-0" aria-hidden="true" />
        </span>
      )}
    </span>
  );
}

export function BoardFilter({
  filters,
  onFiltersChange,
  isPending = false,
  mobileCompact = false,
}: BoardFilterProps) {
  const activePrioritiesCount = filters.priorities.length;
  const activeTagsCount = filters.tags.length;
  const totalActiveFilters = activePrioritiesCount + activeTagsCount;

  const handlePrioritiesChange = (values: string[]) => {
    onFiltersChange({
      ...filters,
      priorities: values as Priority[],
    });
  };

  const handleTagsChange = (tags: string[]) => {
    onFiltersChange({
      ...filters,
      tags,
    });
  };

  const handleClearAll = (e?: MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onFiltersChange({
      priorities: [],
      tags: [],
    });
  };

  return (
    <Sheet>
      {/* 1. Header Trigger Button (Zero column height impact) */}
      <div className="inline-flex items-center">
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 gap-2 border-dashed font-medium transition-colors cursor-pointer",
              totalActiveFilters > 0
                ? "rounded-r-none border-r-0 border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary shadow-2xs"
                : "hover:bg-accent/70",
              mobileCompact &&
                totalActiveFilters === 0 &&
                "max-[639px]:size-9 max-[639px]:p-0 max-[639px]:justify-center",
              mobileCompact &&
                totalActiveFilters > 0 &&
                "max-[639px]:px-2.5",
            )}
            aria-label="Filter tasks"
          >
            {isPending ? (
              <LoaderCircle
                size={14}
                className="text-muted-foreground animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ListFilter
                size={14}
                className={cn(
                  totalActiveFilters > 0
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
                aria-hidden="true"
              />
            )}

            <span className={mobileCompact ? "max-[639px]:hidden" : undefined}>
              Filters
            </span>

            {totalActiveFilters > 0 && (
              <Badge
                variant="secondary"
                className="bg-primary/20 text-primary h-5 min-w-5 rounded-full px-1.5 text-[0.6875rem] font-semibold"
              >
                {totalActiveFilters}
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        {totalActiveFilters > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="h-9 w-7.5 px-0 rounded-l-none border-l border-dashed border-primary/50 border-l-primary/30 bg-primary/10 text-primary/80 hover:bg-primary/20 hover:text-primary cursor-pointer shadow-2xs"
            title="Clear all filters"
            aria-label="Clear all filters"
          >
            <X size={13} />
          </Button>
        )}
      </div>

      {/* 2. Scalable Filter Drawer */}
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md shadow-2xl"
      >
        {/* Header - Clean, with proper right padding to prevent collision with the X close button */}
        <SheetHeader className="border-border/70 bg-muted/20 border-b px-5 py-4 pr-12">
          <SheetDescription className="sr-only">
            Filter board tasks by priority and tags
          </SheetDescription>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/15 text-primary border-primary/25 flex size-9 items-center justify-center rounded-xl border shadow-2xs">
                <ListFilter size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-base font-semibold tracking-tight">
                    Filters
                  </SheetTitle>
                  {totalActiveFilters > 0 && (
                    <span className="bg-primary/15 text-primary border-primary/25 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold">
                      <span className="bg-primary size-1.5 animate-pulse rounded-full" />
                      {totalActiveFilters} active
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  Refine what you see on this board
                </p>
              </div>
            </div>

            {totalActiveFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearAll()}
                className="text-muted-foreground hover:text-foreground hover:bg-background/80 h-8 gap-1.5 text-xs font-medium cursor-pointer"
              >
                <RotateCcw size={12} className="transition-transform group-hover:-rotate-45" />
                Reset all
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Body with Filter Triggers (No redundant Active Filters card) */}
        <ScrollArea className="flex-1 px-5 py-6">
          <div className="space-y-6">
            {/* Filter 1: Priority */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 flex size-6 items-center justify-center rounded-md">
                    <Flag size={13} />
                  </div>
                  <label className="text-foreground text-xs font-semibold">
                    Priority
                  </label>
                  {activePrioritiesCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-500/15 text-amber-600 dark:text-amber-400 h-4.5 px-1.5 text-[0.625rem]"
                    >
                      {activePrioritiesCount} selected
                    </Badge>
                  )}
                </div>

                {activePrioritiesCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, priorities: [] })}
                    className="text-muted-foreground hover:text-foreground text-[0.6875rem] transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Multi-Select Dropdown Menu Trigger for Priority */}
              <MultiSelect
                values={filters.priorities}
                onValuesChange={handlePrioritiesChange}
              >
                <MultiSelectTrigger className="w-full">
                  <MultiSelectValue placeholder="Select priorities..." />
                </MultiSelectTrigger>
                <MultiSelectContent search={false}>
                  {taskPriorities.map(({ id, label, icon: Icon }) => (
                    <MultiSelectItem
                      key={id}
                      value={id}
                      badgeLabel={<PriorityBadge priority={id} />}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={getPriorityIconColor(id)} />
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                    </MultiSelectItem>
                  ))}
                </MultiSelectContent>
              </MultiSelect>
            </div>

            <Separator className="bg-border/60" />

            {/* Filter 2: Tags */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-md">
                    <Tag size={13} />
                  </div>
                  <label className="text-foreground text-xs font-semibold">
                    Tags
                  </label>
                  {activeTagsCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/15 text-primary h-4.5 px-1.5 text-[0.625rem]"
                    >
                      {activeTagsCount} selected
                    </Badge>
                  )}
                </div>

                {activeTagsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, tags: [] })}
                    className="text-muted-foreground hover:text-foreground text-[0.6875rem] transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Multi-Select Dropdown Menu Trigger for Tags */}
              <MultiSelect
                values={filters.tags}
                onValuesChange={handleTagsChange}
              >
                <MultiSelectTrigger className="w-full">
                  <MultiSelectValue placeholder="Select tags..." />
                </MultiSelectTrigger>
                <MultiSelectContent
                  search={{
                    placeholder: "Search tags...",
                    emptyMessage: "No tags found.",
                  }}
                >
                  {taskTagsList.map((tag) => (
                    <MultiSelectItem
                      key={tag.id}
                      value={tag.id}
                      badgeLabel={<TagBadge tag={tag.id} size="sm" showDot />}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn("size-2 rounded-full", tag.dotColor)}
                          aria-hidden="true"
                        />
                        <span className="text-xs font-medium">{tag.label}</span>
                      </div>
                    </MultiSelectItem>
                  ))}
                </MultiSelectContent>
              </MultiSelect>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
