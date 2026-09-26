"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader } from "lucide-react";

import AddColumnCard from "./add-column-card";
import Modal from "@/components/ui/modal";
import { getModalDescription } from "../../utils/get-modal-description";
import { getModalTitle } from "../../utils/get-modal-title";

const ColumnForm = dynamic(() => import("./column-form"), {
  loading: () => (
    <div className="flex h-[151.19px] items-center justify-center">
      <Loader size={18} className="animate-spin" />
    </div>
  ),
});

type ColumnModalProps = {
  boardId: string;
  label?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreated?: (columnId: string) => void;
};

const ColumnModal = ({
  boardId,
  label = "Add column",
  open: controlledOpen,
  onOpenChange,
  onCreated,
}: ColumnModalProps) => {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ?? localOpen;
  const setOpen = onOpenChange ?? setLocalOpen;

  return (
    <>
      {controlledOpen === undefined && (
        <AddColumnCard label={label} onClick={() => setOpen(true)} />
      )}
      <Modal
        title={getModalTitle("column", "create")}
        description={getModalDescription("column", "create")}
        open={open}
        onOpenChange={setOpen}
      >
        <ColumnForm
          boardId={boardId}
          onClose={() => setOpen(false)}
          onCreated={onCreated}
        />
      </Modal>
    </>
  );
};

export default ColumnModal;
