"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import useBoardStore from "@/stores/board";
import { useColumnStore } from "@/stores/column";
import { createBoardAction } from "@/actions/board";
import type { BoardFormValues } from "@/lib/types";

type UseBoardCreationOptions = {
  animateOnCreate?: boolean;
  redirectAfterCreate?: boolean;
};

export function useBoardCreation({
  animateOnCreate = false,
  redirectAfterCreate = false,
}: UseBoardCreationOptions = {}) {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | undefined>();
  const [failedBoard, setFailedBoard] = useState<BoardFormValues | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isNavigating, startNavigation] = useTransition();
  const createBoard = useBoardStore((state) => state.createBoard);
  const setColumns = useColumnStore((state) => state.setColumns);
  const isBusy = isCreating || isNavigating;

  const submitBoardCreation = async (attempt: BoardFormValues) => {
    if (isBusy) return false;
    setIsCreating(true);

    try {
      const result = await createBoardAction(attempt, attempt.id, {
        redirectAfterCreate,
      });
      if (!result.success || !result.fields?.id) {
        setErrorDetails(result.debugMessage);
        setHasError(true);
        setFailedBoard(attempt);
        return false;
      }

      const { id, title, slug, description, createdAt, columns } =
        result.fields;
      createBoard({ id, title, slug, description, createdAt });
      setColumns(id, columns);
      setHasError(false);
      setErrorDetails(undefined);
      setFailedBoard(null);
      if (!redirectAfterCreate) {
        startNavigation(() => {
          router.push(
            animateOnCreate
              ? `/dashboard/${slug}?new=1`
              : `/dashboard/${slug}?created=1`,
          );
        });
      }
      return true;
    } catch (error) {
      if (
        redirectAfterCreate &&
        typeof error === "object" &&
        error !== null &&
        "digest" in error &&
        String(error.digest).startsWith("NEXT_REDIRECT")
      ) {
        return true;
      }
      setErrorDetails(
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : String(error)
          : undefined,
      );
      setHasError(true);
      setFailedBoard(attempt);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const retryBoardCreation = async () => {
    if (!failedBoard) return false;
    return submitBoardCreation(failedBoard);
  };

  const navigateToDashboard = () => {
    if (isBusy) return;
    setHasError(false);
    setErrorDetails(undefined);
    setFailedBoard(null);
    startNavigation(() => {
      router.push("/dashboard");
    });
  };

  return {
    hasError,
    errorDetails,
    failedBoard,
    isCreating: isBusy,
    submitBoardCreation,
    retryBoardCreation,
    navigateToDashboard,
    isRetryAvailable: !!failedBoard && !isCreating,
  };
}
