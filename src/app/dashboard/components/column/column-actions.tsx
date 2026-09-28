import { useState } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { Ellipsis, PlusIcon, Settings2, TrashIcon } from "lucide-react";
import type { Column } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { deleteColumnAction, updateColumnAction } from "@/actions/column";
import { useColumnStore } from "@/stores/column";
import useLoadingStore from "@/stores/loading";
import useBoardStore from "@/stores/board";
import handleOnError from "@/utils/handle-on-error";

const AlertConfirmation = dynamic(
  () => import("@/components/ui/alert-confirmation"),
  {
    loading: () => null,
  },
);

const DropdownMenuSubContent = dynamic(
  () =>
    import("@/components/ui/dropdown-menu").then(
      (mod) => mod.DropdownMenuSubContent,
    ),
  {
    loading: () => null,
  },
);
const ColumnStatusSelect = dynamic(() => import("./column-status-select"), {
  loading: () => null,
});

type ColumnActionsProps = {
  columnId: string;
  columnStatus: string;
  onQuickAdd: () => void;
};

const ColumnActions = ({
  columnId,
  columnStatus,
  onQuickAdd,
}: ColumnActionsProps) => {
  const isMobile = useIsMobile();
  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false);
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);
  const [showAlertConfirmation, setShowAlertConfirmation] = useState(false);

  const activeBoardId = useBoardStore((state) => state.activeBoardId);

  const { deleteColumn, updateColumn } = useColumnStore(
    useShallow((state) => ({
      updateColumn: state.updateColumn,
      deleteColumn: state.deleteColumn,
    })),
  );

  const { isLoading, setIsLoading } = useLoadingStore(
    useShallow((state) => ({
      isLoading: state.isLoading("column", "deleting"),
      setIsLoading: state.setIsLoading,
    })),
  );

  const handleUpdateColumn = async (updates: Pick<Column, "status">) => {
    if (!activeBoardId || !columnId) return;

    setIsLoading("column", "updating", true, columnId);

    setIsMainDropdownOpen(false);

    try {
      const result = await updateColumnAction(columnId, updates);
      if (!result.success || !result.fields) {
        handleOnError(result.message, "Failed to update column");
      } else {
        updateColumn(activeBoardId, columnId, {
          status: result.fields.status,
        });
        toast.success(result.message);
      }
    } catch (error) {
      console.error("Error updating column:", error);
      handleOnError(error, "Failed to update column");
    } finally {
      setIsLoading("column", "updating", false, columnId);
    }
  };

  const handleOnClick = async () => {
    if (activeBoardId && columnId && !isLoading) {
      setIsLoading("column", "deleting", true, columnId);

      try {
        const result = await deleteColumnAction(columnId);
        if (!result.success) {
          handleOnError(result.message, "Failed to delete column");
          setShowAlertConfirmation(false);
        } else {
          deleteColumn(activeBoardId, columnId);
        }
      } catch (error) {
        console.error("Error deleting column:", error);
        handleOnError(error, "Failed to delete column");
        setShowAlertConfirmation(false);
      } finally {
        setIsLoading("column", "deleting", false, columnId);
      }
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={onQuickAdd}
      >
        <PlusIcon />
        <span className="sr-only">Quick add task</span>
      </Button>
      <DropdownMenu
        open={isMainDropdownOpen}
        onOpenChange={setIsMainDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <Ellipsis />
            <span className="sr-only">Column Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isMobile ? "start" : "center"}>
          <DropdownMenuLabel>Column Actions:</DropdownMenuLabel>
          <DropdownMenuSub
            open={isSubDropdownOpen}
            onOpenChange={setIsSubDropdownOpen}
          >
            <DropdownMenuSubTrigger
              className="h-8 gap-2 px-2 py-1.5"
              onMouseEnter={() => setIsSubDropdownOpen(true)}
            >
              <Settings2 size={16} />
              Change Status
            </DropdownMenuSubTrigger>
            {isSubDropdownOpen && (
              <DropdownMenuSubContent className="p-0">
                <ColumnStatusSelect
                  columnStatus={columnStatus}
                  handleUpdateColumn={handleUpdateColumn}
                />
              </DropdownMenuSubContent>
            )}
          </DropdownMenuSub>
          <DropdownMenuItem
            onClick={() => setShowAlertConfirmation(true)}
            variant="destructive"
            className="h-8 gap-2 px-2 py-1.5"
          >
            <TrashIcon size={16} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {showAlertConfirmation && (
        <AlertConfirmation
          open={showAlertConfirmation}
          setOpen={setShowAlertConfirmation}
          title="Delete Column"
          description="This will permanently delete this column and all its tasks. This action cannot be undone."
          isPending={isLoading}
          onClick={handleOnClick}
        />
      )}
    </div>
  );
};
export default ColumnActions;
