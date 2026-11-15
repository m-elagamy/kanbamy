import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { BoardSummary, FormMode } from "@/lib/types";
import type { BoardFormSchema } from "@/schemas/board";
import handleOnError from "@/utils/handle-on-error";
import { generateUUID } from "@/utils/id";
import isRedirectError from "@/utils/redirect";
import { useBoardCreation } from "./use-board-creation";
import { useBoardFormStore } from "./use-board-form-store";
import { updateBoardAction } from "@/actions/board";

type UseBoardFormAction = {
  formMode: FormMode;
  validateBeforeSubmit: (
    formData: FormData,
    isEditMode: boolean,
    existingBoards: { id: string; title: string }[],
    subsetFields: (keyof BoardFormSchema)[],
  ) => { success: boolean; data?: BoardFormSchema; error?: string };
  board?: BoardSummary;
  existingBoards: { id: string; title: string }[];
  onClose: () => void;
};

export function useBoardFormAction({
  formMode,
  validateBeforeSubmit,
  board,
  existingBoards,
  onClose,
}: UseBoardFormAction) {
  const isEditMode = formMode === "edit";
  const router = useRouter();

  const { updateBoard } = useBoardFormStore();

  const {
    hasError,
    errorDetails,
    failedBoard,
    submitBoardCreation,
    retryBoardCreation,
    navigateToDashboard,
    isCreating,
  } = useBoardCreation({ redirectAfterCreate: !isEditMode });

  const [, createFormAction, isCreatePending] = useActionState(
    async (_previousState: null, formData: FormData) => {
      if (isEditMode || failedBoard) return null;

      const { success, data: validatedData } = validateBeforeSubmit(
        formData,
        false,
        existingBoards,
        ["title", "description"],
      );

      if (!success || !validatedData) return null;

      await submitBoardCreation({
        ...validatedData,
        id: generateUUID(),
      });

      return null;
    },
    null,
  );
  const [, updateFormAction, isUpdatePending] = useActionState(
    async (_previousState: null, formData: FormData) => {
      if (!isEditMode || !board) return null;

      const { success, data: validatedData } = validateBeforeSubmit(
        formData,
        true,
        existingBoards,
        ["title", "description", "tags"],
      );

      if (!success || !validatedData) return null;

      try {
        const result = await updateBoardAction(formData);

        if (!result.success || !result.fields) {
          handleOnError(result.message, "Failed to update board");
        } else {
          updateBoard(board.id, result.fields);
          onClose();
        }
      } catch (error) {
        if (isRedirectError(error)) {
          onClose();
          throw error;
        }
        console.error(error);
        handleOnError(error, "Failed to update board");
      }

      return null;
    },
    null,
  );
  const isLoading = isEditMode
    ? isUpdatePending
    : isCreatePending || isCreating;

  return {
    handleFormAction: isEditMode ? updateFormAction : createFormAction,
    isEditMode,
    router,
    isLoading,
    hasCreationError: !isEditMode && hasError && !!failedBoard,
    creationErrorDetails: errorDetails,
    retryCreation: async () => {
      await retryBoardCreation();
    },
    returnToDashboard: () => {
      if (isLoading) return;
      onClose();
      navigateToDashboard();
    },
  };
}
