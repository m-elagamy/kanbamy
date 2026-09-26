"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DndProvider } from "@/providers/dnd-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useColumnStore } from "@/stores/column";
import ColumnCard from "./column-card";
import ColumnModal from "./column-modal";
import type { ClientTask } from "@/lib/types";
import type { SimplifiedColumn } from "@/lib/types/stores/column";
import type { PriorityFilterValue } from "@/lib/types/stores/task";

const EMPTY_COLUMNS: Record<string, SimplifiedColumn> = {};

type ColumnsWrapperProps = {
  boardId: string;
  focusedTaskId?: string;
  animateEntry?: boolean;
  initialColumns?: (SimplifiedColumn & { tasks: ClientTask[] })[];
  priorityFilter: PriorityFilterValue;
};

const ColumnsWrapper = ({
  boardId,
  focusedTaskId,
  animateEntry = false,
  initialColumns = [],
  priorityFilter,
}: ColumnsWrapperProps) => {
  const shouldReduceMotion = useReducedMotion();
  const columnsContainerRef = useRef<HTMLDivElement>(null);
  const [hasPreviousColumns, setHasPreviousColumns] = useState(false);
  const [hasMoreColumns, setHasMoreColumns] = useState(false);
  const { activeBoardId, columns } = useColumnStore(
    useShallow((state) => ({
      activeBoardId: state.activeBoardId,
      columns: state.columnsByBoard[boardId] || EMPTY_COLUMNS,
    })),
  );

  const availableColumns =
    activeBoardId === boardId ? Object.values(columns) : initialColumns;
  const sortedColumns = availableColumns.sort((a, b) => a.order - b.order);
  const columnIds = sortedColumns.map((column) => column.id);
  const hasColumns = sortedColumns.length > 0;

  const scrollByColumn = (direction: -1 | 1) => {
    const container = columnsContainerRef.current;
    const column = container?.querySelector<HTMLElement>(
      '[data-column-item="true"]',
    );
    if (!container || !column) return;

    const gap = Number.parseFloat(getComputedStyle(container).columnGap || "0");
    container.scrollBy({
      left: direction * (column.offsetWidth + gap),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = columnsContainerRef.current;
    if (!container) return;

    const updateOverflowHint = () => {
      const remainingScroll =
        container.scrollWidth - container.clientWidth - container.scrollLeft;
      setHasPreviousColumns(container.scrollLeft > 8);
      setHasMoreColumns(remainingScroll > 8);
    };

    updateOverflowHint();
    container.addEventListener("scroll", updateOverflowHint, { passive: true });
    const resizeObserver = new ResizeObserver(updateOverflowHint);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", updateOverflowHint);
      resizeObserver.disconnect();
    };
  }, [sortedColumns.length]);

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1">
      <div
        ref={columnsContainerRef}
        className="scrollbar-thumb-border focus-visible:ring-ring flex min-h-0 min-w-0 flex-1 snap-x snap-proximity scroll-px-3 gap-3 overflow-x-auto px-3 pb-4 outline-none focus-visible:ring-2 focus-visible:ring-inset sm:scroll-px-4 sm:gap-4 sm:px-4 md:snap-none md:justify-start"
        role="region"
        aria-label="Board columns"
        tabIndex={0}
      >
        <DndProvider boardId={boardId}>
          <SortableContext
            items={columnIds}
            strategy={horizontalListSortingStrategy}
          >
            {sortedColumns.map((column, index) => (
              <motion.div
                key={column.id}
                data-column-item="true"
                className="h-full flex-none will-change-transform"
                initial={
                  animateEntry && !shouldReduceMotion
                    ? { opacity: 0, y: 24 }
                    : false
                }
                animate={{ opacity: 1, y: 0 }}
                transition={
                  animateEntry && !shouldReduceMotion
                    ? { duration: 0.48, delay: index * 0.08, ease: "easeOut" }
                    : { duration: 0 }
                }
              >
                <ColumnCard
                  boardId={boardId}
                  column={column}
                  focusedTaskId={focusedTaskId}
                  initialTasks={
                    initialColumns.find((item) => item.id === column.id)?.tasks
                  }
                  hasInitialData={initialColumns.some(
                    (item) => item.id === column.id,
                  )}
                  priorityFilter={priorityFilter}
                />
              </motion.div>
            ))}
          </SortableContext>
        </DndProvider>

        <ColumnModal
          boardId={boardId}
          label={hasColumns ? undefined : "Add first column"}
        />
      </div>
      {hasPreviousColumns && (
        <Button
          type="button"
          aria-label="Scroll to previous column"
          size="icon"
          variant="ghost"
          className={cn(
            "from-background via-background/85 absolute top-0 bottom-4 left-0 z-20 h-auto min-h-0 w-10 rounded-none bg-gradient-to-r to-transparent p-0",
            "sm:w-11 md:w-12",
          )}
          onClick={() => scrollByColumn(-1)}
        >
          <span className="bg-background/90 text-foreground flex size-6 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-transform hover:scale-105 sm:size-7">
            <ChevronLeft size={17} strokeWidth={2.25} aria-hidden="true" />
          </span>
        </Button>
      )}
      {hasMoreColumns && (
        <Button
          type="button"
          aria-label="Scroll to more columns"
          size="icon"
          variant="ghost"
          className={cn(
            "via-background/85 to-background absolute top-0 right-0 bottom-4 z-20 h-auto min-h-0 w-10 rounded-none bg-gradient-to-l from-transparent p-0",
            "sm:w-11 md:w-12",
          )}
          onClick={() => scrollByColumn(1)}
        >
          <span className="bg-background/90 text-foreground flex size-6 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-transform hover:scale-105 sm:size-7">
            <ChevronRight size={17} strokeWidth={2.25} aria-hidden="true" />
          </span>
        </Button>
      )}
    </div>
  );
};

export default ColumnsWrapper;
