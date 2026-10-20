import { RefObject, useId, useState } from "react";
import type {
  BoardFormValues,
  BoardSummary,
  FormMode,
  Templates,
} from "@/lib/types";
import useForm from "@/hooks/use-form";
import GenericForm from "@/components/ui/generic-form";
import FormField from "@/components/ui/form-field";
import FormMessage from "@/components/ui/form-message";
import { Label } from "@/components/ui/label";
import { useBoardFormAction } from "@/hooks/use-board-form-action";
import useBoardStore from "@/stores/board";
import columnsTemplates from "../data/columns-templates";
import { boardTagsList, isBoardTag } from "../data/board-tags";
import TagSelector from "../task/tag-selector";
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

  const initialTags = (board?.tags ?? []).filter(isBoardTag);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const tagsFieldId = useId();

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
      tags: initialTags,
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

      <div className="space-y-2">
        <Label htmlFor={tagsFieldId}>
          Tags
          <span className="text-muted-foreground text-xs font-normal">
            (optional)
          </span>
        </Label>
        <TagSelector
          id={tagsFieldId}
          aria-describedby={`${tagsFieldId}-helper`}
          options={boardTagsList}
          selectedTags={selectedTags}
          onChange={setSelectedTags}
          placeholder="Select board tags..."
        />
        {errors?.tags && (
          <FormMessage variant="error" className="mt-2">
            {errors.tags}
          </FormMessage>
        )}
        <FormMessage
          id={`${tagsFieldId}-helper`}
          variant="helper"
          error={!!errors?.tags}
        >
          Classify this board, e.g. Work, Personal, or Study.
        </FormMessage>
      </div>

      {isEditMode && (
        <FormField type="hidden" name="boardId" defaultValue={board?.id} />
      )}
    </GenericForm>
  );
}
