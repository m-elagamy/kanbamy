import { useState } from "react";
import { toast } from "sonner";
import { improveTaskContentAction } from "@/actions/task";

export interface UseTaskWritingImprovementOptions {
  title: string;
  description: string;
  boardName?: string;
  boardDescription?: string;
  onApplyTitle: (newTitle: string) => void;
  onApplyDescription: (newDescription: string) => void;
}

export function useTaskWritingImprovement({
  title,
  description,
  boardName,
  boardDescription,
  onApplyTitle,
  onApplyDescription,
}: UseTaskWritingImprovementOptions) {
  const [improvingField, setImprovingField] = useState<
    "title" | "description" | null
  >(null);

  const improve = async (operation: "title" | "description") => {
    if (improvingField !== null) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      toast.info(
        operation === "title"
          ? "Please enter a task title first."
          : "Please enter a task title first to improve the description.",
      );
      return;
    }

    if (operation === "description" && !trimmedDescription) {
      toast.info("Please enter a description first to improve it.");
      return;
    }

    setImprovingField(operation);
    try {
      const result = await improveTaskContentAction(
        operation === "title"
          ? {
              operation: "title",
              title: trimmedTitle,
              description: trimmedDescription || undefined,
              boardName: boardName?.trim() || undefined,
              boardDescription: boardDescription?.trim() || undefined,
            }
          : {
              operation: "description",
              title: trimmedTitle,
              description: trimmedDescription,
              boardName: boardName?.trim() || undefined,
              boardDescription: boardDescription?.trim() || undefined,
            },
      );

      if (!result.success || !result.fields?.enhancedText) {
        toast.error(result.message || `Failed to improve ${operation}.`);
        return;
      }

      if (operation === "title") {
        onApplyTitle(result.fields.enhancedText);
      } else {
        onApplyDescription(result.fields.enhancedText);
      }
    } catch {
      toast.error(`Failed to improve ${operation} with AI.`);
    } finally {
      setImprovingField(null);
    }
  };

  return {
    isImprovingTitle: improvingField === "title",
    isImprovingDescription: improvingField === "description",
    isImproving: improvingField !== null,
    handleImproveTitle: () => improve("title"),
    handleImproveDescription: () => improve("description"),
  };
}
