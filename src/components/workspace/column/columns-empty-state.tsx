"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import ColumnModal from "./column-modal";

type ColumnsEmptyStateProps = {
  boardId: string;
};

export default function ColumnsEmptyState({ boardId }: ColumnsEmptyStateProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-x-auto px-3 pb-4 sm:px-4">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "group flex h-12 w-[calc(100vw-4.5rem)] max-w-72 shrink-0 self-start items-center justify-center gap-2 rounded-lg border border-dashed outline-none transition-all duration-150 cursor-pointer px-4 md:w-[var(--board-column-width)] md:max-w-none text-sm font-medium",
          "border-border/80 bg-card/30 text-muted-foreground",
          "hover:border-primary/50 hover:bg-card/60 hover:text-foreground hover:shadow-2xs",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "active:scale-[0.99]",
        )}
        aria-label="Add first column"
      >
        <Plus
          size={16}
          strokeWidth={2}
          className="text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
        <span>Add first column</span>
      </button>

      <ColumnModal
        boardId={boardId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </div>
  );
}
