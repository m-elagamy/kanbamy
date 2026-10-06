import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SimplifiedColumn } from "@/lib/types/stores/column";
import { useTaskStore } from "@/stores/task";
import columnStatusOptions from "../../data/column-status-options";

type ColumnDragOverlayProps = {
  column: SimplifiedColumn;
};

export default function ColumnDragOverlay({ column }: ColumnDragOverlayProps) {
  const tasksCount = useTaskStore(
    (state) => state.getColumnTasks(column.id).length,
  );

  const { icon: Icon, color } =
    columnStatusOptions[column.status as keyof typeof columnStatusOptions];

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
