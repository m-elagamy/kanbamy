import { useRef, useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import Modal from "@/components/ui/modal";
import type { FormMode, ClientTask } from "@/lib/types";
import TaskForm from "./task-form";
import { getModalTitle } from "../../utils/get-modal-title";
import { getModalDescription } from "../../utils/get-modal-description";
import useBoardStore from "@/stores/board";

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
        onCloseAutoFocus={
          trigger
            ? (event) => {
                event.preventDefault();
                triggerRef.current?.focus();
              }
            : undefined
        }
      >
        <TaskForm
          columnId={columnId}
          boardId={formBoardId}
          onClose={() => setOpen(false)}
          task={task}
          formMode={mode}
        />
      </Modal>
    </>
  );
};

export default TaskModal;
