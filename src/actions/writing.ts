"use server";

/* eslint-disable @clerk/next/require-auth-protection -- Action validates workspace access through requireWorkspaceAccess(). */

import { requireWorkspaceAccess } from "@/lib/auth/workspace-access";
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

export const improveWritingAction = async (
  input: ImproveWritingSchema,
): Promise<ServerActionResult<{ enhancedText: string }>> => {
  const owner = await requireWorkspaceAccess();
  if (owner.isDemo) {
    return {
      success: false,
      message: "Create an account to improve writing with AI.",
    };
  }

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

