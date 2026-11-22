"use server";

/* eslint-disable @clerk/next/require-auth-protection -- Each action validates workspace access through requireWorkspaceAccess(). */

import { requireWorkspaceAccess } from "@/lib/auth/workspace-access";
import { type BoardTag, type TaskTag } from "@/lib/constants";
import { type ServerActionResult } from "@/lib/types";
import {
  improveWritingSchema,
  type ImproveWritingSchema,
} from "@/schemas/writing";
import {
  improveTaskTitle,
  improveTaskDescription,
} from "@/lib/ai/task-writing";
import {
  improveBoardTitle,
  improveBoardDescription,
} from "@/lib/ai/board-writing";
import { suggestBoardTags, suggestTaskTags } from "@/lib/ai/suggest-tags";

export const improveWritingAction = async (
  input: ImproveWritingSchema,
): Promise<ServerActionResult<{ enhancedText: string }>> => {
  await requireWorkspaceAccess();

  const parsed = improveWritingSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid input data.";
    return {
      success: false,
      message: firstError,
    };
  }

  const data = parsed.data;

  try {
    let enhancedText = "";

    if (data.scope === "task") {
      enhancedText =
        data.operation === "title"
          ? await improveTaskTitle(data)
          : await improveTaskDescription({
              title: data.title,
              description: data.description!,
              boardName: data.boardName,
              boardDescription: data.boardDescription,
            });
    } else {
      enhancedText =
        data.operation === "title"
          ? await improveBoardTitle(data)
          : await improveBoardDescription({
              title: data.title,
              description: data.description!,
              template: data.template,
            });
    }

    return {
      success: true,
      fields: { enhancedText },
      message: `${data.operation === "title" ? "Title" : "Description"} improved successfully.`,
    };
  } catch (error) {
    console.error("Failed to improve writing with AI:", error);
    return {
      success: false,
      message: `Unable to improve ${data.operation} at this moment. Please try again later.`,
    };
  }
};

export const suggestBoardTagsAction = async (input: {
  title: string;
  description?: string;
  template?: string;
}): Promise<ServerActionResult<BoardTag[]>> => {
  await requireWorkspaceAccess();

  const trimmedTitle = input.title?.trim() ?? "";
  if (!trimmedTitle || trimmedTitle.length < 2) {
    return {
      success: false,
      message: "Please enter a board name first.",
    };
  }

  try {
    const tags = await suggestBoardTags({
      title: trimmedTitle.slice(0, 50),
      description: input.description?.trim().slice(0, 500),
      template: input.template?.trim().slice(0, 50),
    });

    return {
      success: true,
      fields: tags,
      message: "Tags suggested successfully.",
    };
  } catch (error) {
    console.error("Failed to suggest board tags with AI:", error);
    return {
      success: false,
      message: "Unable to suggest tags at this moment. Please try again later.",
    };
  }
};

export const suggestTaskTagsAction = async (
  title: string,
  description?: string,
): Promise<ServerActionResult<TaskTag[]>> => {
  await requireWorkspaceAccess();

  const trimmedTitle = title.trim();
  if (!trimmedTitle || trimmedTitle.length < 2) {
    return {
      success: false,
      message: "Please enter a task title first.",
    };
  }

  try {
    const tags = await suggestTaskTags({
      title: trimmedTitle,
      description: description?.trim(),
    });

    return {
      success: true,
      fields: tags,
      message: "Tags suggested successfully.",
    };
  } catch (error) {
    console.error("Failed to suggest tags with AI:", error);
    return {
      success: false,
      message: "Unable to suggest tags at this moment. Please try again later.",
    };
  }
};
