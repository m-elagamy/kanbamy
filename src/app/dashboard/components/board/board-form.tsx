import { RefObject } from "react";
import type {
  BoardFormValues,
  BoardSummary,
  FormMode,
  Templates,
} from "@/lib/types";
import useForm from "@/hooks/use-form";
import GenericForm from "@/components/ui/generic-form";
import FormField from "@/components/ui/form-field";
import { useBoardFormAction } from "@/hooks/use-board-form-action";
import useBoardStore from "@/stores/board";
import columnsTemplates from "../../data/columns-templates";
import { boardSchema, BoardFormSchema } from "@/schemas/board";
import BoardErrorCard from "@/components/ui/board-error-card";

type BoardFormProps = Readonly<{
  formMode: FormMode;
  board?: BoardSummary;
  onClose: () => void;
  defaultTemplate?: Templates;
}>;

export default function BoardForm({
  formMode,
  board,
  onClose,
  defaultTemplate,
}: BoardFormProps) {
  const boards = useBoardStore((state) => state.boards);

  const existingBoards = Object.values(boards).map(({ id, title }) => ({
    id,
    title,
  }));

  const {
    formValues: boardFormData,
    handleOnChange,
    formRef,
    errors,
    validateBeforeSubmit,
  } = useForm<BoardFormValues, BoardFormSchema>(
    {
      id: board?.id ?? "",
      title: board?.title ?? "",
      description: board?.description ?? "",
      template: defaultTemplate ?? "personal",
    },
    boardSchema,
  );

  const {
    handleFormAction,
    isEditMode,
    isLoading,
    hasCreationError,
    creationErrorDetails,
    retryCreation,
    returnToDashboard,
  } = useBoardFormAction({
    board,
    existingBoards,
    formMode,
    onClose,
    validateBeforeSubmit,
  });

  if (hasCreationError) {
    return (
      <BoardErrorCard
        onRetry={retryCreation}
        onBack={returnToDashboard}
        isPending={isLoading}
        debugMessage={creationErrorDetails}
      />
    );
  }

  return (
    <GenericForm
      formRef={formRef as RefObject<HTMLFormElement>}
      onAction={handleFormAction}
      formMode={formMode}
      errors={errors}
      isLoading={isLoading}
    >
      <FormField
        name="title"
        type="text"
        label="Name"
        defaultValue={boardFormData?.title ?? ""}
        placeholder="e.g., Personal Tasks"
        maxLength={50}
        required
        onChange={(value) => handleOnChange("title", value)}
        error={errors?.title}
        helperText="Choose a clear and descriptive name for your board."
      />

      {!isEditMode && (
        <FormField
          name="template"
          type="select"
          label="Template"
          defaultValue={defaultTemplate ?? "personal"}
          options={columnsTemplates}
          error={errors?.template}
          helperText="Start with a ready-made template or customize it later."
        />
      )}

      <FormField
        name="description"
        type="textarea"
        label="Description"
        placeholder="Organize my daily and work tasks"
        defaultValue={boardFormData?.description ?? ""}
        error={errors?.description}
        helperText="Add a context to help you remember the board's purpose."
        maxLength={500}
        onChange={(value) => handleOnChange("description", value)}
      />

      {isEditMode && (
        <FormField type="hidden" name="boardId" defaultValue={board?.id} />
      )}
    </GenericForm>
  );
}
