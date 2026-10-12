"use client";

import { useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/modal";
import type {
  BoardSummary,
  ButtonVariants,
  FormMode,
  Templates,
} from "@/lib/types";
import BoardForm from "./board-form";
import { getModalTitle } from "../utils/get-modal-title";
import { getModalDescription } from "../utils/get-modal-description";

type BoardModalProps = {
  mode: FormMode;
  trigger?: React.ReactElement;
  board?: BoardSummary;
  variant?: ButtonVariants;
  defaultTemplate?: Templates;
  size?: "sm" | "default" | "lg" | "icon";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const BoardModal = ({
  mode,
  board,
  trigger,
  variant,
  defaultTemplate,
  size = "default",
  open: controlledOpen,
  onOpenChange,
}: BoardModalProps) => {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ?? localOpen;
  const setOpen = onOpenChange ?? setLocalOpen;

  return (
    <>
      {trigger && (
        <Slot
          className={cn(buttonVariants({ variant, size, className: "group" }))}
          onClick={() => setOpen(true)}
        >
          {trigger}
        </Slot>
      )}
      <Modal
        title={getModalTitle("board", mode)}
        description={getModalDescription("board", mode)}
        open={open}
        onOpenChange={setOpen}
      >
        <BoardForm
          formMode={mode}
          onClose={() => setOpen(false)}
          board={board}
          defaultTemplate={defaultTemplate}
        />
      </Modal>
    </>
  );
};

export default BoardModal;
