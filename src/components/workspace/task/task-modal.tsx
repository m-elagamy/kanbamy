import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import Modal from "@/components/ui/modal";
import type { FormMode, ClientTask } from "@/lib/types";
import { getModalTitle } from "../utils/get-modal-title";
import { getModalDescription } from "../utils/get-modal-description";
import useBoardStore from "@/stores/board";

const TaskForm = dynamic(() => import("./task-form"), {
  loading: () => (
    <div className="flex h-(--form-h) items-center justify-center">
      <Loader2 className="text-muted-foreground size-6 animate-spin" />
    </div>
  ),
  ssr: false,
});

type TaskModalProps = {
  columnId?: string;
  boardId?: string;
  trigger?: React.ReactNode;
  task?: ClientTask;
  mode: FormMode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const TaskModal = ({
  columnId,
  boardId,
  trigger,
  task,
  mode,
  open: controlledOpen,
  onOpenChange,
}: TaskModalProps) => {
  const [localOpen, setLocalOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const open = controlledOpen ?? localOpen;
  const setOpen = onOpenChange ?? setLocalOpen;
  const activeBoardId = useBoardStore((state) => state.activeBoardId);
  const formBoardId = boardId ?? activeBoardId ?? undefined;
  const showColumnSelector =
    Boolean(formBoardId) && (mode === "edit" || !columnId);

  return (
    <>
      {trigger && (
        <Slot ref={triggerRef} onClick={() => setOpen(true)}>
          {trigger}
        </Slot>
      )}
      <Modal
        title={getModalTitle("task", mode)}
        description={getModalDescription("task", mode)}
        open={open}
        onOpenChange={setOpen}
        className={
          mode === "edit"
            ? "[--form-h:calc(28.3rem+113px)] md:[--form-h:calc(28.55rem+113px)]"
            : showColumnSelector
              ? "[--form-h:calc(27.3rem+113px)] md:[--form-h:calc(27.55rem+113px)]"
              : "[--form-h:calc(23.675rem+113px)] md:[--form-h:calc(23.925rem+113px)]"
        }
        onCloseAutoFocus={
          trigger
            ? (event) => {
                event.preventDefault();
                triggerRef.current?.focus();
              }
            : undefined
        }
      >
        {open && (
          <TaskForm
            columnId={columnId}
            boardId={formBoardId}
            onClose={() => setOpen(false)}
            task={task}
            formMode={mode}
          />
        )}
      </Modal>
    </>
  );
};

export default TaskModal;
