"use server";

/* eslint-disable @clerk/next/require-auth-protection -- Workspace actions validate access through requireWorkspaceAccess(); account-only reads retain requireAuth(). */

import {
  taskSchema,
  taskPageSchema,
  taskSearchSchema,
  taskPositionSchema,
  type TaskSchema,
} from "@/schemas/task";
import { z } from "zod";
import {
  ServerActionResult,
  type TaskPage,
  type TaskSearchPage,
  type TaskSummary,
} from "@/lib/types";
import {
  createTask,
  updateTask,
  deleteTask,
  getColumnTasksPage,
  getBoardTasksPage,
  getTaskForRename,
  updateTaskPosition,
} from "@/lib/dal/task";
import handlePrismaError from "@/lib/server/prisma-error-handler";
import {
  revalidateUserBoard,
  revalidateUserBoards,
} from "@/lib/cache/revalidate";
import { TASKS_PAGE_SIZE, type TaskTag } from "@/lib/constants";
import { getAuthenticatedUserId, requireAuth } from "@/lib/auth";
import { requireWorkspaceAccess } from "@/lib/auth/workspace-access";
import { getServerTimestamp, logServerTiming } from "@/lib/server/server-timing";
import { suggestTaskTags } from "@/lib/ai/suggest-tags";

export const createTaskAction = async (
  formData: FormData,
): Promise<ServerActionResult<TaskSummary>> => {
  const owner = await requireWorkspaceAccess();
  const rawTags = formData.getAll("tags").filter(Boolean);
  const data = {
    ...Object.fromEntries(formData.entries()),
    ...(rawTags.length > 0 ? { tags: rawTags } : { tags: [] }),
  };
  const validatedData = taskSchema.safeParse(data);

  if (!validatedData.success) {
    return {
      success: false,
      message: "Invalid input",
      fields: validatedData.data,
    };
  }

  const {
    columnId,
    title,
    description,
    priority = "medium",
    tags = [],
  } = validatedData.data;

  const result = await createTask(
    owner.ownerId,
    columnId,
    title,
    description,
    priority,
    tags,
  );

  if (!result.success || !result.data) {
    return {
      success: false,
      message: "Failed to create a task.",
    };
  }

  await revalidateUserBoards(owner.ownerId);
  await revalidateUserBoard(owner.ownerId, result.data.boardId);

  return {
    success: true,
    message: `Task was added successfully.`,
    fields: {
      id: result.data.id,
      title,
      description: description ?? "",
      priority,
      order: result.data.order,
      tags: result.data.tags,
      createdAt: result.data.createdAt,
      columnId: result.data.columnId,
      columnEnteredAt: result.data.columnEnteredAt,
    },
  };
};

export async function updateTaskAction(
  formData: FormData,
): Promise<
  ServerActionResult<
    TaskSchema & { order?: string; columnEnteredAt?: string }
  >
> {
  const owner = await requireWorkspaceAccess();
  const rawTags = formData.getAll("tags").filter(Boolean);
  const data = {
    ...Object.fromEntries(formData.entries()),
    tags: rawTags,
  };
  const validatedData = taskSchema.safeParse(data);
  const rawTaskId = formData.get("taskId");
  const validatedTaskId = z.string().min(1).safeParse(rawTaskId);

  if (!validatedData.success || !validatedTaskId.success) {
    return {
      success: false,
      message: "Invalid input",
      fields: validatedData.data,
    };
  }

  const { columnId, title, description, priority, tags = [] } = validatedData.data;
  const taskId = validatedTaskId.data;

  const existingTask = await getTaskForRename(owner.ownerId, taskId);

  if (!existingTask.success || !existingTask.data) {
    return { success: false, message: "Task not found." };
  }

  const titleChanged = existingTask.data.title !== title;
  const descriptionChanged = existingTask.data.description !== description;
  const priorityChanged = existingTask.data.priority !== priority;
  const columnChanged = existingTask.data.columnId !== columnId;
  const tagsChanged =
    JSON.stringify(existingTask.data.tags.slice().sort()) !==
    JSON.stringify(tags.slice().sort());

  if (
    !titleChanged &&
    !descriptionChanged &&
    !priorityChanged &&
    !columnChanged &&
    !tagsChanged
  ) {
    return {
      success: false,
      message:
        "No changes detected. Please update something before submitting.",
      fields: validatedData.data,
    };
  }

  const taskUpdates = {
    ...(titleChanged && { title }),
    ...(descriptionChanged && { description }),
    ...(priorityChanged && { priority }),
    ...(tagsChanged && { tags }),
  };

  const updatedTask = columnChanged
    ? await updateTaskPosition(
        owner.ownerId,
        taskId,
        columnId,
        null,
        null,
        taskUpdates,
      )
    : await updateTask(owner.ownerId, taskId, taskUpdates);

  if (!updatedTask.success || !updatedTask.data) {
    return { success: false, message: "Failed to update the task." };
  }

  await revalidateUserBoards(owner.ownerId);
  await revalidateUserBoard(owner.ownerId, updatedTask.data.boardId);

  return {
    success: true,
    message: "Task updated successfully.",
    fields: {
      columnId,
      title,
      description: description ?? "",
      priority,
      ...(columnChanged && {
        order: updatedTask.data.order,
        columnEnteredAt: updatedTask.data.columnEnteredAt.toISOString(),
      }),
    },
  };
}

export async function deleteTaskAction(
  taskId: string,
): Promise<ServerActionResult<TaskSchema>> {
  const owner = await requireWorkspaceAccess();
  const validatedTaskId = z.string().min(1).safeParse(taskId);
  if (!validatedTaskId.success) {
    return { success: false, message: "Invalid Task ID." };
  }

  const result = await deleteTask(owner.ownerId, validatedTaskId.data);

  if (!result.success || !result.data) {
    return {
      success: false,
      message: "Failed to delete the task.",
    };
  }

  await revalidateUserBoards(owner.ownerId);
  await revalidateUserBoard(owner.ownerId, result.data.boardId);

  return {
    success: true,
    message: "Task was deleted successfully.",
  };
}

async function loadTasksPage(
  ownerId: string,
  boardId: string | null,
  query: string,
  cursor: string | null = null,
  limit = 20,
): Promise<ServerActionResult<TaskSearchPage>> {
  const validated = taskSearchSchema.safeParse({
    boardId,
    query,
    cursor,
    limit,
  });
  if (!validated.success) {
    return { success: false, message: "Invalid search parameters." };
  }

  const result = await getBoardTasksPage(
    ownerId,
    validated.data.boardId,
    validated.data.query,
    validated.data.cursor,
    validated.data.limit,
  );

  if (!result.success || !result.data) {
    return { success: false, message: "Failed to load tasks." };
  }

  return { success: true, message: "", fields: result.data };
}

export async function getBoardTasksPageAction(
  boardId: string,
  query: string,
  cursor: string | null = null,
  limit = TASKS_PAGE_SIZE,
): Promise<ServerActionResult<TaskSearchPage>> {
  const owner = await requireWorkspaceAccess();
  return loadTasksPage(owner.ownerId, boardId, query, cursor, limit);
}

export async function getWorkspaceTasksPageAction(
  query: string,
  cursor: string | null = null,
  limit = TASKS_PAGE_SIZE,
): Promise<ServerActionResult<TaskSearchPage>> {
  await requireAuth();
  const userId = await getAuthenticatedUserId();
  return loadTasksPage(userId, null, query, cursor, limit);
}


export async function getColumnTasksPageAction(
  columnId: string,
  cursor: string | null = null,
  limit = TASKS_PAGE_SIZE,
  priorities: ("low" | "medium" | "high")[] = [],
  tags: string[] = [],
): Promise<ServerActionResult<TaskPage>> {
  const owner = await requireWorkspaceAccess();
  const validated = taskPageSchema.safeParse({
    columnId,
    cursor,
    limit,
    priorities,
    tags,
  });
  if (!validated.success) {
    return { success: false, message: "Invalid pagination parameters." };
  }

  const startedAt = getServerTimestamp();
  const result = await getColumnTasksPage(
    owner.ownerId,
    validated.data.columnId,
    validated.data.cursor,
    validated.data.limit,
    validated.data.priorities,
    validated.data.tags,
  );
  logServerTiming("tasks.column.action", getServerTimestamp() - startedAt, {
    limit: validated.data.limit,
    hasCursor: Boolean(validated.data.cursor),
    hasPriorities: Boolean(validated.data.priorities?.length),
    hasTags: Boolean(validated.data.tags?.length),
  });
  if (!result.success || !result.data) {
    return { success: false, message: "Failed to load tasks." };
  }

  return { success: true, message: "", fields: result.data };
}

export async function updateTaskPositionAction(
  taskId: string,
  newColumnId: string,
  previousTaskId: string | null,
  nextTaskId: string | null,
): Promise<
  ServerActionResult<{
    columnId: string;
    order: string;
    columnEnteredAt: string;
  }>
> {
  const owner = await requireWorkspaceAccess();
  const validatedData = taskPositionSchema.safeParse({
    taskId,
    newColumnId,
    previousTaskId,
    nextTaskId,
  });

  if (!validatedData.success) {
    return { success: false, message: "Invalid parameters provided." };
  }

  try {
    const result = await updateTaskPosition(
      owner.ownerId,
      validatedData.data.taskId,
      validatedData.data.newColumnId,
      validatedData.data.previousTaskId,
      validatedData.data.nextTaskId,
    );

    if (!result.success || !result.data) {
      return { success: false, message: "Failed to move task." };
    }

    await revalidateUserBoards(owner.ownerId);
    await revalidateUserBoard(owner.ownerId, result.data.boardId);

    return {
      success: true,
      message: "Task moved successfully.",
      fields: {
        columnId: result.data.columnId,
        order: result.data.order,
        columnEnteredAt: result.data.columnEnteredAt.toISOString(),
      },
    };
  } catch (error) {
    return { success: false, message: handlePrismaError(error) };
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

