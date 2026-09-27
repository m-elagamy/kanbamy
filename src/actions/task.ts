"use server";

/* eslint-disable @clerk/next/require-auth-protection -- Each action calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

import {
  taskSchema,
  taskPageSchema,
  taskSearchSchema,
  workspaceTasksPageSchema,
  taskPositionSchema,
  type TaskSchema,
} from "@/schemas/task";
import { z } from "zod";
import {
  ServerActionResult,
  type TaskPage,
  type NeedsAttentionPreview,
  type ClientTask,
  type TaskSearchPage,
  type TaskSummary,
  type TasksFilter,
  type WorkspaceTasksPage,
} from "@/lib/types";
import {
  createTask,
  updateTask,
  deleteTask,
  getColumnTasksPage,
  getNeedsAttentionTasks,
  getWorkspaceTasksOverviewPage,
  getTasksPage,
  getTaskForRename,
  getTaskDetails,
  updateTaskPosition,
} from "@/lib/dal/task";
import handlePrismaError from "@/utils/prisma-error-handler";
import {
  revalidateUserBoard,
  revalidateUserBoards,
} from "@/utils/revalidate-user-boards";
import { TASKS_PAGE_SIZE } from "@/lib/constants";
import { requireAuth } from "@/utils/auth";

export const createTaskAction = async (
  formData: FormData,
): Promise<ServerActionResult<Partial<TaskSummary>>> => {
  await requireAuth();
  const data = Object.fromEntries(formData.entries());
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
  } = validatedData.data;

  const result = await createTask(columnId, title, description, priority);

  if (!result.success || !result.data) {
    return {
      success: false,
      message: "Failed to create a task.",
    };
  }

  await revalidateUserBoards();
  await revalidateUserBoard(result.data.boardId);

  return {
    success: true,
    message: `Task was added successfully.`,
    fields: {
      id: result.data.id,
      title,
      description: description ?? "",
      priority,
      order: result.data.order,
    },
  };
};

export async function updateTaskAction(
  formData: FormData,
): Promise<ServerActionResult<TaskSchema>> {
  await requireAuth();
  const data = Object.fromEntries(formData.entries());
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

  const { columnId, title, description, priority } = validatedData.data;
  const taskId = validatedTaskId.data;

  const existingTask = await getTaskForRename(taskId);

  if (!existingTask.success || !existingTask.data) {
    return { success: false, message: "Task not found." };
  }

  const titleChanged = existingTask.data.title !== title;
  const descriptionChanged = existingTask.data.description !== description;
  const priorityChanged = existingTask.data.priority !== priority;
  if (!titleChanged && !descriptionChanged && !priorityChanged) {
    return {
      success: false,
      message:
        "No changes detected. Please update something before submitting.",
      fields: validatedData.data,
    };
  }

  const updatedTask = await updateTask(taskId, {
    ...(titleChanged && { title }),
    ...(descriptionChanged && { description }),
    ...(priorityChanged && { priority }),
  });

  if (!updatedTask.success || !updatedTask.data) {
    return { success: false, message: "Failed to update the task." };
  }

  await revalidateUserBoards();
  await revalidateUserBoard(updatedTask.data.boardId);

  return {
    success: true,
    message: "Task updated successfully.",
    fields: {
      columnId,
      title,
      description: description ?? "",
      priority,
    },
  };
}

export async function deleteTaskAction(
  taskId: string,
): Promise<ServerActionResult<TaskSchema>> {
  await requireAuth();
  const validatedTaskId = z.string().min(1).safeParse(taskId);
  if (!validatedTaskId.success) {
    return { success: false, message: "Invalid Task ID." };
  }

  const result = await deleteTask(validatedTaskId.data);

  if (!result.success || !result.data) {
    return {
      success: false,
      message: "Failed to delete the task.",
    };
  }

  await revalidateUserBoards();
  await revalidateUserBoard(result.data.boardId);

  return {
    success: true,
    message: "Task was deleted successfully.",
  };
}

async function loadTasksPage(
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

  const result = await getTasksPage(
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
  await requireAuth();
  return loadTasksPage(boardId, query, cursor, limit);
}

export async function getWorkspaceTasksPageAction(
  query: string,
  cursor: string | null = null,
  limit = TASKS_PAGE_SIZE,
): Promise<ServerActionResult<TaskSearchPage>> {
  await requireAuth();
  return loadTasksPage(null, query, cursor, limit);
}

export async function getNeedsAttentionTasksAction(): Promise<
  ServerActionResult<NeedsAttentionPreview>
> {
  await requireAuth();
  const result = await getNeedsAttentionTasks();
  if (!result.success || !result.data) {
    return { success: false, message: "Failed to load tasks." };
  }

  return { success: true, message: "", fields: result.data };
}

export async function getWorkspaceTasksOverviewPageAction(
  filter: TasksFilter,
  page: number,
  query = "",
  limit = TASKS_PAGE_SIZE,
): Promise<ServerActionResult<WorkspaceTasksPage>> {
  await requireAuth();
  const validated = workspaceTasksPageSchema.safeParse({
    filter,
    page,
    query,
    limit,
  });
  if (!validated.success) {
    return { success: false, message: "Invalid pagination parameters." };
  }

  const result = await getWorkspaceTasksOverviewPage(
    validated.data.filter,
    validated.data.page,
    validated.data.query,
    validated.data.limit,
  );
  if (!result.success || !result.data) {
    return { success: false, message: "Failed to load tasks." };
  }

  return { success: true, message: "", fields: result.data };
}

export async function getTaskDetailsAction(
  taskId: string,
): Promise<ServerActionResult<ClientTask & { boardSlug: string }>> {
  await requireAuth();
  if (!taskId) return { success: false, message: "Task not found." };

  const result = await getTaskDetails(taskId);
  if (!result.success || !result.data) {
    return { success: false, message: "Task not found." };
  }

  return { success: true, message: "", fields: result.data };
}

export async function getColumnTasksPageAction(
  columnId: string,
  cursor: string | null = null,
  limit = TASKS_PAGE_SIZE,
  priority: "low" | "medium" | "high" | null = null,
): Promise<ServerActionResult<TaskPage>> {
  await requireAuth();
  const validated = taskPageSchema.safeParse({
    columnId,
    cursor,
    limit,
    priority,
  });
  if (!validated.success) {
    return { success: false, message: "Invalid pagination parameters." };
  }

  const result = await getColumnTasksPage(
    validated.data.columnId,
    validated.data.cursor,
    validated.data.limit,
    validated.data.priority,
  );
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
  await requireAuth();
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
      validatedData.data.taskId,
      validatedData.data.newColumnId,
      validatedData.data.previousTaskId,
      validatedData.data.nextTaskId,
    );

    if (!result.success || !result.data) {
      return { success: false, message: "Failed to move task." };
    }

    await revalidateUserBoards();
    await revalidateUserBoard(result.data.boardId);

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
}
