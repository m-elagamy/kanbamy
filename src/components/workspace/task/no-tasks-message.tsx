import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyTasksIllustration from "@/components/ui/empty-tasks-illustration";
import { EmptyState } from "@/components/ui/empty-state";

export default function NoTasksMessage({
  onQuickAdd,
  isFiltered = false,
}: {
  onQuickAdd: () => void;
  isFiltered?: boolean;
}) {
  return (
    <EmptyState
      size="compact"
      illustration={<EmptyTasksIllustration />}
      title={isFiltered ? "No matching tasks" : "No tasks yet"}
      description={
        isFiltered
          ? "Add a task with this priority to get started in this column."
          : "Add a task to get started in this column."
      }
      action={
        <Button
          variant="outline"
          className="bg-background min-w-32 shadow-xs"
          onClick={onQuickAdd}
        >
          <Plus aria-hidden="true" />
          Add task
        </Button>
      }
    />
  );
}
