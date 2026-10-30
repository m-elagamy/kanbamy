import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SimplifiedColumn } from "@/lib/types/stores/column";
import { useTaskStore } from "@/stores/task";
import { useCollapsedColumnsStore } from "@/stores/collapsed-columns";
import columnStatusOptions from "../data/column-status-options";

type ColumnDragOverlayProps = {
  column: SimplifiedColumn;
  boardId?: string;
};

export default function ColumnDragOverlay({
  column,
  boardId,
}: ColumnDragOverlayProps) {
  const tasksCount = useTaskStore(
    (state) => state.getColumnTasks(column.id).length,
  );

  const isCollapsed = useCollapsedColumnsStore((state) =>
    boardId
      ? Boolean(state.collapsedColumnIdsByBoard[boardId]?.includes(column.id))
      : false,
  );

  const { icon: Icon, color } =
    columnStatusOptions[column.status as keyof typeof columnStatusOptions];

  if (isCollapsed) {
    return (
      <Card className="border-primary/60 bg-card/90 ring-primary/20 z-50 flex h-72 w-12 shrink-0 flex-col items-center justify-between rounded-lg border py-3 shadow-2xl ring-2 select-none">
        <span className="flex size-5 items-center justify-center">
          <Icon size={16} color={color} aria-hidden="true" />
        </span>

        <span className="text-muted-foreground flex flex-1 items-center justify-center py-4 text-xs font-semibold tracking-wider uppercase [writing-mode:vertical-rl] rotate-180">
          <span className="truncate max-h-40">{column.status}</span>
        </span>

        <Badge
          variant="outline"
          className="h-5 shrink-0 rounded-md px-1.5 text-[0.6875rem] tabular-nums"
        >
          {tasksCount}
        </Badge>
      </Card>
    );
  }

  // إذا كان العمود مفتوحاً (expanded)، نعرض الـ Overlay العريض المعتاد
  return (
    <Card className="border-primary/50 bg-card dark:bg-card/80 ring-primary/20 z-50 w-72 shrink-0 gap-0 overflow-hidden rounded-xl border py-0 shadow-xl ring-2 md:w-[var(--board-column-width)]">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4 pb-3!">
        <CardTitle className="flex items-center gap-2 text-sm text-ellipsis whitespace-nowrap">
          <Icon size={16} color={color} />
          <span>{column.status}</span>
          {tasksCount > 0 && (
            <Badge
              variant="outline"
              className="h-5 rounded-md px-[7px] text-[0.690rem]"
            >
              {tasksCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
