"use client";

import { useState } from "react";
import { ArrowRight, Ellipsis, SquarePen, TrashIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import type { ClientTask } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import AlertConfirmation from "@/components/ui/alert-confirmation";
import { useColumnStore } from "@/stores/column";
import useBoardStore from "@/stores/board";
import { deleteTaskAction, updateTaskPositionAction } from "@/actions/task";
import { useTaskStore } from "@/stores/task";
import useLoadingStore from "@/stores/loading";
import handleOnError from "@/utils/handle-on-error";
import columnStatusOptions from "../../data/column-status-options";

type TaskActionsProps = {
  task: ClientTask;
  columnId: string;
  onEdit: () => void;
};

export default function TaskActions({
  task,
  columnId,
  onEdit,
}: Readonly<TaskActionsProps>) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const boardId = useBoardStore((state) => state.activeBoardId);
  const columns = useColumnStore((state) =>
    boardId ? state.columnsByBoard[boardId] : undefined,
  );
  const destinations = Object.values(columns ?? {})
    .filter((column) => column.id !== columnId)
    .sort((a, b) => a.order - b.order);
  const deleteTask = useTaskStore(
    useShallow((state) => ({
      deleteTask: state.deleteTask,
    })),
  ).deleteTask;
  const { isLoading, isMoving, setIsLoading } = useLoadingStore(
    useShallow((state) => ({
      isLoading: state.isLoading("task", "deleting"),
      isMoving: state.isLoading("task", "updating", task.id),
      setIsLoading: state.setIsLoading,
    })),
  );

  const handleDelete = async () => {
    if (isLoading || isMoving) return;
    setIsLoading("task", "deleting", true, task.id);

    try {
      const result = await deleteTaskAction(task.id);

      if (!result.success) {
        handleOnError(result.message, "Failed to delete task");
        setConfirmDelete(false);
      } else {
        deleteTask(columnId, task.id);
      }
    } catch (error) {
      handleOnError(error, "Failed to delete task");
      setConfirmDelete(false);
    } finally {
      setIsLoading("task", "deleting", false, task.id);
    }
  };

  const handleMove = async (destinationId: string) => {
    if (isMoving || isLoading) return;
    setIsLoading("task", "updating", true, task.id);
    const store = useTaskStore.getState();
    try {
      const result = await updateTaskPositionAction(
        task.id,
        destinationId,
        null,
        null,
      );
      if (!result.success) {
        handleOnError(result.message, "Failed to move task");
        return;
      }
      if (useBoardStore.getState().activeBoardId === boardId) {
        const destinationHasMore = Boolean(
          store.columnPages[destinationId]?.nextCursor,
        );
        store.moveTaskBetweenColumns(
          task.id,
          columnId,
          destinationId,
          undefined,
          !destinationHasMore,
        );
        if (result.fields) store.updateTask(task.id, result.fields);
      }
    } catch (error) {
      handleOnError(error, "Failed to move task");
    } finally {
      setIsLoading("task", "updating", false, task.id);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="z-10">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={isMoving}
            aria-label={`Actions for ${task.title}`}
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Task Actions:</DropdownMenuLabel>
          <DropdownMenuItem className="h-8 gap-2 px-2 py-1.5" onSelect={onEdit}>
            <SquarePen size={16} /> Edit
          </DropdownMenuItem>

          {destinations.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className="h-8 gap-2 px-2 py-1.5"
                disabled={isMoving || isLoading}
              >
                <ArrowRight size={16} /> Move to column
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {destinations.map((column) => {
                  const statusOption =
                    columnStatusOptions[
                      column.status as keyof typeof columnStatusOptions
                    ];
                  const StatusIcon = statusOption?.icon;

                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="h-8 gap-2 px-2 py-1.5"
                      onSelect={() => void handleMove(column.id)}
                    >
                      {StatusIcon && (
                        <StatusIcon
                          size={16}
                          color={statusOption.color}
                          aria-hidden="true"
                        />
                      )}
                      {column.status}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          <DropdownMenuItem
            variant="destructive"
            className="h-8 gap-2 px-2 py-1.5"
            onSelect={() => setConfirmDelete(true)}
            disabled={isLoading || isMoving}
          >
            <TrashIcon size={16} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertConfirmation
        open={confirmDelete}
        setOpen={setConfirmDelete}
        title="Delete task"
        description={`Permanently delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete task"
        isPending={isLoading}
        onClick={handleDelete}
      />
    </>
  );
}
