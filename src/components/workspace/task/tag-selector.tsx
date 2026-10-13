"use client";

import { cn } from "@/lib/utils";
import taskTagsList from "../data/task-tags";
import TagBadge from "./tag-badge";

type TagSelectorProps = {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
  name?: string;
};

export default function TagSelector({
  selectedTags,
  onChange,
  className,
  name = "tags",
}: TagSelectorProps) {
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((t) => t !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Hidden inputs so standard FormData picks up selected tags */}
      {selectedTags.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Task tags">
        {taskTagsList.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);

          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={cn(
                "rounded-md text-xs transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isSelected
                  ? "ring-1 ring-current shadow-xs"
                  : "opacity-45 hover:opacity-85 grayscale hover:grayscale-0",
              )}
              aria-pressed={isSelected}
            >
              <TagBadge tag={tag.id} size="sm" showDot />
            </button>
          );
        })}
      </div>
    </div>
  );
}
