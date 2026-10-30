import { Badge } from "@/components/ui/badge";
import type { SimplifiedColumn } from "@/lib/types/stores/column";
import { useTaskStore } from "@/stores/task";
import { useCollapsedColumnsStore } from "@/stores/collapsed-columns";
import columnStatusOptions from "../data/column-status-options";

type ColumnDragOverlayProps = {
  column: SimplifiedColumn;
  boardId?: string;
};

const EMPTY_TASK_IDS: string[] = [];

export default function ColumnDragOverlay({
  column,
  boardId,
}: ColumnDragOverlayProps) {
  const columnTaskIds = useTaskStore(
    (state) => state.columnTaskIds[column.id] ?? EMPTY_TASK_IDS,
  );
  const tasksCount = columnTaskIds.length;

  const isCollapsed = useCollapsedColumnsStore((state) =>
    boardId
      ? Boolean(state.collapsedColumnIdsByBoard[boardId]?.includes(column.id))
      : false,
  );

  const statusMeta =
    columnStatusOptions[column.status as keyof typeof columnStatusOptions];
  const Icon = statusMeta?.icon;
  const color = statusMeta?.color;

  if (isCollapsed) {
    return (
      <div className="border-border/80 bg-background/95 ring-primary/15 z-50 flex h-60 w-12 shrink-0 flex-col items-center justify-between rounded-lg border py-3 shadow-xl ring-1 backdrop-blur-md select-none">
        {Icon && (
          <span className="flex size-5 items-center justify-center">
            <Icon size={16} color={color} aria-hidden="true" />
          </span>
        )}

        <span className="text-foreground/80 flex flex-1 items-center justify-center py-4 text-xs font-semibold tracking-wider uppercase [writing-mode:vertical-rl] rotate-180">
          <span className="truncate max-h-36">{column.status}</span>
        </span>

        <Badge
          variant="outline"
          className="h-5 shrink-0 rounded-md px-1.5 text-[0.6875rem] tabular-nums"
        >
          {tasksCount}
        </Badge>
      </div>
    );
  }

  return (
    <div className="border-border/80 bg-card/95 ring-primary/20 hover:border-primary/40 z-50 flex w-56 items-center justify-between gap-2.5 rounded-lg border px-3.5 py-2.5 shadow-xl ring-1 backdrop-blur-md transition-shadow select-none">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && (
          <span className="relative flex size-4 shrink-0 items-center justify-center">
            <Icon size={15} color={color} aria-hidden="true" />
            <span
              aria-hidden="true"
              className="bg-current absolute -bottom-1 left-1/2 h-px w-3.5 -translate-x-1/2 rounded-full"
              style={{ color }}
            />
          </span>
        )}
        <span className="text-foreground truncate text-xs font-semibold tracking-wide">
          {column.status}
        </span>
      </div>

      <Badge
        variant="outline"
        className="bg-muted/40 border-border/70 text-muted-foreground h-5 shrink-0 rounded-md px-1.5 text-[0.6875rem] font-medium tabular-nums"
      >
        {tasksCount}
      </Badge>
    </div>
  );
}
