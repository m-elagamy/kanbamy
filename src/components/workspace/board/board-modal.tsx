"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
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
import { getModalTitle } from "../utils/get-modal-title";
import { getModalDescription } from "../utils/get-modal-description";

const BoardForm = dynamic(() => import("./board-form"), {
  loading: () => (
    <div className="flex h-(--form-h) items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  ),
  ssr: false,
});

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
        className={
          mode === "edit"
            ? "[--form-h:25.35rem] md:[--form-h:25.6rem]"
            : "[--form-h:30.675rem] md:[--form-h:30.925rem]"
        }
      >
        {open && (
          <BoardForm
            formMode={mode}
            onClose={() => setOpen(false)}
            board={board}
            defaultTemplate={defaultTemplate}
          />
        )}
      </Modal>
    </>
  );
};

export default BoardModal;
