import { useState } from "react";
import { toast } from "sonner";
import { suggestBoardTagsAction } from "@/actions/board";

interface UseBoardTagSuggestionsProps {
  title?: string;
  description?: string | null;
  template?: string;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  isEditMode?: boolean;
}

export function useBoardTagSuggestions({
  title,
  description,
  template,
  selectedTags,
  setSelectedTags,
  isEditMode = false,
}: UseBoardTagSuggestionsProps) {
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);

  const hasBoardTitle = Boolean(title?.trim());

  const handleSuggestTags = async () => {
    const currentTitle = title?.trim();
    if (!currentTitle) {
      toast.info("Please enter a board name first.");
      return;
    }

    setIsSuggestingTags(true);
    try {
      const result = await suggestBoardTagsAction({
        title: currentTitle,
        description: description?.trim() || undefined,
        template: isEditMode ? undefined : template,
      });

      if (!result.success || !result.fields) {
        toast.error(result.message || "Failed to suggest tags.");
        return;
      }

      const suggestedTags = result.fields;
      if (suggestedTags.length === 0) {
        toast.info("No matching tags found for this board.");
        return;
      }

      const hasNewTags = suggestedTags.some(
        (tag) => !selectedTags.includes(tag),
      );

      if (!hasNewTags) {
        toast.info("All suggested tags are already added.");
        return;
      }

      const mergedTags = Array.from(
        new Set([...selectedTags, ...suggestedTags]),
      );
      setSelectedTags(mergedTags);
    } catch {
      toast.error("Failed to suggest tags with AI.");
    } finally {
      setIsSuggestingTags(false);
    }
  };

  return {
    isSuggestingTags,
    hasBoardTitle,
    handleSuggestTags,
  };
}
