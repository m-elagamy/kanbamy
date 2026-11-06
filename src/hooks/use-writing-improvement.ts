import { useState } from "react";
import { toast } from "sonner";
import { improveWritingAction } from "@/actions/writing";

export type WritingImprovementScope =
  | {
      scope: "task";
      boardName?: string;
      boardDescription?: string;
    }
  | {
      scope: "board";
      template?: string;
    };

export type UseWritingImprovementOptions = WritingImprovementScope & {
  title: string;
  description?: string;
  onApplyTitle: (newTitle: string) => void;
  onApplyDescription: (newDescription: string) => void;
};

export function useWritingImprovement(options: UseWritingImprovementOptions) {
  const { title, description = "", onApplyTitle, onApplyDescription } = options;
  const [improvingField, setImprovingField] = useState<
    "title" | "description" | null
  >(null);

  const improve = async (operation: "title" | "description") => {
    if (improvingField !== null) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = (description ?? "").trim();
    const entityLabel = options.scope === "task" ? "task title" : "board name";

    if (!trimmedTitle) {
      toast.info(
        operation === "title"
          ? `Please enter a ${entityLabel} first.`
          : `Please enter a ${entityLabel} first to improve the description.`,
      );
      return;
    }

    if (operation === "description" && !trimmedDescription) {
      toast.info("Please enter a description first to improve it.");
      return;
    }

    setImprovingField(operation);
    try {
      const payload =
        options.scope === "task"
          ? {
              scope: "task" as const,
              operation,
              title: trimmedTitle,
              description: trimmedDescription || undefined,
              boardName: options.boardName?.trim() || undefined,
              boardDescription: options.boardDescription?.trim() || undefined,
            }
          : {
              scope: "board" as const,
              operation,
              title: trimmedTitle,
              description: trimmedDescription || undefined,
              template: options.template?.trim() || undefined,
            };

      const result = await improveWritingAction(payload);

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

