import { RefObject, useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/react/shallow";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createColumnAction } from "@/actions/column";
import { useColumnStore } from "@/stores/column";
import columnStatusSchema, { type ColumnStatus } from "@/schemas/column";
import getAvailableStatusOptions from "@/utils/column-helpers";
import GenericForm from "@/components/ui/generic-form";
import useAutoFocusOnError from "@/hooks/use-auto-focus-on-error";
import useErrorManagement from "@/hooks/use-error-management";
import columnStatusOptions from "../../data/column-status-options";
import StatusOptionsSkeleton from "./status-options-skeleton";
import validateFormData from "../../utils/validate-form-data";
import handleOnError from "@/utils/handle-on-error";
import FormMessage from "@/components/ui/form-message";

const SelectContent = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectContent),
  {
    loading: () => null,
  },
);

const StatusOptions = dynamic(() => import("./status-options"), {
  loading: () => <StatusOptionsSkeleton />,
});

type ColumnFormProps = {
  boardId: string;
  onClose: () => void;
  onCreated?: (columnId: string) => void;
};

export default function ColumnForm({
  boardId,
  onClose,
  onCreated,
}: ColumnFormProps) {
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  const { columns, addColumn } = useColumnStore(
    useShallow((state) => ({
      columns: state.columnsByBoard[boardId],
      addColumn: state.addColumn,
    })),
  );

  const availableStatusOptions = getAvailableStatusOptions(
    Object.values(columns),
    columnStatusOptions,
  );
  const hasAvailableStatuses = availableStatusOptions.length > 0;

  const triggerTitle = hasAvailableStatuses
    ? "Choose a status"
    : "All statuses are in use or unavailable.";

  const placeholder = hasAvailableStatuses
    ? "e.g., To Do, In Progress"
    : "No available statuses";

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setIsContentLoaded(true);
  };
  const handleValueChange = () => clearFieldError("status");

  const { errors, setSpecificError, clearFieldError } = useErrorManagement<{
    status: string;
  }>();

  const formRef = useAutoFocusOnError(errors, {
    delay: 300,
  });

  const [, formAction, isPending] = useActionState(
    async (_previousState: null, formData: FormData) => {
      const validationResult = validateFormData<{
        status: ColumnStatus;
      }>(formData, columnStatusSchema);

      if (!validationResult.success) {
        setSpecificError("status", "Please select a status for this column.");
        return null;
      }

      try {
        const createdColumn = await createColumnAction(
          boardId,
          validationResult.data.status,
        );

        if (!createdColumn.success || !createdColumn.fields) {
          handleOnError(createdColumn.message, "Failed to create column");
          return null;
        }

        addColumn(boardId, {
          id: createdColumn.fields.id,
          status: createdColumn.fields.status,
          order: createdColumn.fields.order,
        });
        onCreated?.(createdColumn.fields.id);
        onClose();
      } catch (error) {
        console.error("Error creating column:", error);
        handleOnError(error, "Failed to create column");
      }

      return null;
    },
    null,
  );

  return (
    <GenericForm
      formRef={formRef as RefObject<HTMLFormElement>}
      onAction={formAction}
      isLoading={isPending}
      errors={errors}
      hasAvailableStatuses={hasAvailableStatuses}
    >
      <section className="space-y-2">
        <Input type="hidden" name="boardId" value={boardId ?? ""} />
        <Label htmlFor="status">Status</Label>
        <Select
          name="status"
          onValueChange={handleValueChange}
          onOpenChange={handleOpenChange}
        >
          <SelectTrigger
            id="status"
            title={triggerTitle}
            disabled={!hasAvailableStatuses}
            aria-disabled={!hasAvailableStatuses}
            aria-describedby={errors?.status ? "column-error" : undefined}
            aria-invalid={!!errors?.status}
            className="w-full"
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          {isContentLoaded && hasAvailableStatuses && (
            <SelectContent className="max-h-80">
              {availableStatusOptions.map(([status, { icon: Icon, color }]) => (
                <StatusOptions
                  key={status}
                  status={status}
                  Icon={Icon}
                  color={color}
                />
              ))}
            </SelectContent>
          )}
        </Select>
        {errors?.status && (
          <FormMessage id="column-error" variant="error" animated>
            {errors?.status}
          </FormMessage>
        )}
        <FormMessage error={!!errors?.status} variant="helper">
          Only active statuses allow tasks to be assigned.
        </FormMessage>
      </section>
    </GenericForm>
  );
}
