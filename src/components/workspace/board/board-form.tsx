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
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useBoardFormAction } from "@/hooks/use-board-form-action";
import { useBoardTagSuggestions } from "@/hooks/use-board-tag-suggestions";
import { useWritingImprovement } from "@/hooks/use-writing-improvement";
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

  const [titleValue, setTitleValue] = useState(board?.title ?? "");
  const [descriptionValue, setDescriptionValue] = useState(
    board?.description ?? "",
  );
  const [templateValue, setTemplateValue] = useState<string>(
    defaultTemplate ?? "personal",
  );

  const {
    handleOnChange,
    formRef,
    errors,
    clearGenericError,
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

  const handleTitleChange = (value: string) => {
    setTitleValue(value);
    handleOnChange("title", value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescriptionValue(value);
    handleOnChange("description", value);
  };

  const handleTemplateChange = (value: string) => {
    setTemplateValue(value);
    handleOnChange("template", value);
  };

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

  const {
    isImprovingTitle,
    isImprovingDescription,
    isImproving,
    handleImproveTitle,
    handleImproveDescription,
  } = useWritingImprovement({
    scope: "board",
    title: titleValue,
    description: descriptionValue,
    template: isEditMode ? undefined : templateValue,
    onApplyTitle: handleTitleChange,
    onApplyDescription: handleDescriptionChange,
  });

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    clearGenericError();
  };

  const { isSuggestingTags, hasBoardTitle, handleSuggestTags } =
    useBoardTagSuggestions({
      title: titleValue,
      description: descriptionValue,
      template: templateValue,
      selectedTags,
      setSelectedTags: handleTagsChange,
      isEditMode,
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
        value={titleValue}
        placeholder="e.g., Personal Tasks"
        maxLength={50}
        required
        onChange={handleTitleChange}
        error={errors?.title}
        helperText="Choose a clear and descriptive name for your board."
        onAiImprove={handleImproveTitle}
        isAiImproving={isImprovingTitle}
        isAiDisabled={!titleValue.trim() || isImproving}
        aiImproveLabel="Improve board name with AI"
      />

      {!isEditMode && (
        <FormField
          name="template"
          type="select"
          label="Template"
          defaultValue={defaultTemplate ?? "personal"}
          options={columnsTemplates}
          onChange={handleTemplateChange}
          error={errors?.template}
          helperText="Start with a ready-made template or customize it later."
        />
      )}

      <FormField
        name="description"
        type="textarea"
        label="Description"
        placeholder="Organize my daily and work tasks"
        value={descriptionValue}
        error={errors?.description}
        helperText="Add a context to help you remember the board's purpose."
        maxLength={500}
        onChange={handleDescriptionChange}
        onAiImprove={handleImproveDescription}
        isAiImproving={isImprovingDescription}
        isAiDisabled={
          !descriptionValue.trim() || !titleValue.trim() || isImproving
        }
        aiImproveLabel="Improve description with AI"
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={tagsFieldId}>Tags</Label>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSuggestTags}
            disabled={!hasBoardTitle || isSuggestingTags}
            title={
              !hasBoardTitle
                ? "Enter a board name first to suggest tags"
                : isSuggestingTags
                  ? "Suggesting tags..."
                  : "Suggest tags with AI"
            }
            aria-label={
              !hasBoardTitle
                ? "Enter a board name first to suggest tags"
                : isSuggestingTags
                  ? "Suggesting tags..."
                  : "Suggest tags with AI"
            }
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-6 gap-1.5 rounded px-2 text-xs font-normal transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-40"
          >
            {isSuggestingTags ? (
              <Loader2
                className="size-3.5 animate-spin text-primary"
                aria-hidden="true"
              />
            ) : (
              <Sparkles className="size-3.5!" aria-hidden="true" />
            )}
            <span>
              {isSuggestingTags ? "Suggesting..." : "Suggest with AI"}
            </span>
          </Button>
        </div>

        <TagSelector
          id={tagsFieldId}
          aria-describedby={`${tagsFieldId}-helper`}
          options={boardTagsList}
          selectedTags={selectedTags}
          onChange={handleTagsChange}
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

