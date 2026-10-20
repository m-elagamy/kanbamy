"use client";

import { cn } from "@/lib/utils";
import type { TagOption } from "@/lib/types";
import taskTagsList from "../data/task-tags";
import TagBadge from "./tag-badge";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
} from "@/components/ui/multi-select";

type TagSelectorProps = {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
  name?: string;
  options?: TagOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  id?: string;
  "aria-describedby"?: string;
};

export default function TagSelector({
  selectedTags,
  onChange,
  className,
  name = "tags",
  options = taskTagsList,
  placeholder = "Select tags...",
  searchPlaceholder = "Search tags...",
  id,
  "aria-describedby": ariaDescribedBy,
}: TagSelectorProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Hidden inputs so standard FormData picks up selected tags */}
      {selectedTags.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}

      <MultiSelect values={selectedTags} onValuesChange={onChange}>
        <MultiSelectTrigger
          id={id}
          aria-describedby={ariaDescribedBy}
          className="w-full"
        >
          <MultiSelectValue placeholder={placeholder} />
        </MultiSelectTrigger>
        <MultiSelectContent
          search={{
            placeholder: searchPlaceholder,
            emptyMessage: "No tags found.",
          }}
        >
          {options.map((tag) => (
            <MultiSelectItem
              key={tag.id}
              value={tag.id}
              badgeLabel={
                <TagBadge tag={tag.id} option={tag} size="sm" showDot />
              }
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn("size-2 rounded-full", tag.dotColor)}
                  aria-hidden="true"
                />
                <span className="text-xs font-medium">{tag.label}</span>
              </div>
            </MultiSelectItem>
          ))}
        </MultiSelectContent>
      </MultiSelect>
    </div>
  );
}
