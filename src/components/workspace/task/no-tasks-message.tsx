import { Plus, SearchX } from "lucide-react";
import EmptyTasksIllustration from "@/components/ui/empty-tasks-illustration";

export default function NoTasksMessage({
  onQuickAdd,
  isFiltered = false,
}: {
  onQuickAdd: () => void;
  isFiltered?: boolean;
}) {
  if (isFiltered) {
    return (
      <div className="border-border/50 bg-card/15 flex flex-col items-center justify-center rounded-xl border border-dashed px-3 py-6 text-center select-none">
        <div className="border-border/60 bg-muted/40 text-muted-foreground/60 mb-2 flex size-7 items-center justify-center rounded-lg border">
          <SearchX size={14} aria-hidden="true" />
        </div>
        <p className="text-foreground/90 text-xs font-semibold">
          No matching tasks
        </p>
        <p className="text-muted-foreground/75 mt-0.5 max-w-[170px] text-[11px] leading-relaxed">
          No tasks match the active board filters.
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onQuickAdd}
      className="border-border/45 bg-card/15 hover:border-primary/40 hover:bg-card/40 group flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-3 py-6 text-center transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Add task to column"
    >
      <EmptyTasksIllustration className="mb-2 h-7 w-10 shrink-0 transition-transform duration-200 group-hover:scale-105" />

      <p className="text-foreground/90 text-xs font-semibold">
        No tasks yet
      </p>
      <p className="text-muted-foreground/75 mt-0.5 max-w-[170px] text-[11px] leading-relaxed">
        Drag a task here or click to add.
      </p>

      <span className="text-primary mt-2.5 inline-flex items-center gap-1 text-xs font-semibold group-hover:underline">
        <Plus size={13} aria-hidden="true" />
        <span>Add task</span>
      </span>
    </button>
  );
}
