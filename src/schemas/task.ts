import { z } from "zod";
import { TASK_TAGS } from "@/lib/constants";

export const taskSchema = z.object({
  columnId: z.string().min(1, "Please select a column."),
  title: z
    .string()
    .trim()
    .min(3, "Task name must be at least 3 characters.")
    .max(50, "Task name must be less than 50 characters."),
  description: z.string().trim().max(2000, "Description too long.").optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium").optional(),
  tags: z
    .preprocess((val) => {
      if (!val) return [];
      if (typeof val === "string") return [val];
      return val;
    }, z.array(z.enum(TASK_TAGS)).default([]))
    .optional(),
});

export type TaskSchema = z.infer<typeof taskSchema>;

export const taskSearchSchema = z.object({
  boardId: z.string().min(1).nullable(),
  query: z.string().trim().max(100),
  cursor: z.string().min(1).nullable(),
  limit: z.number().int().min(1).max(50),
});

export type TaskSearchSchema = z.infer<typeof taskSearchSchema>;


export const taskPageSchema = z.object({
  columnId: z.string().min(1),
  cursor: z.string().min(1).nullable(),
  limit: z.number().int().min(1).max(50),
  priorities: z.array(z.enum(["low", "medium", "high"])).optional(),
  tags: z.array(z.string()).optional(),
});

export type TaskPageSchema = z.infer<typeof taskPageSchema>;

export const taskPositionSchema = z.object({
  taskId: z.string().min(1),
  newColumnId: z.string().min(1),
  previousTaskId: z.string().min(1).nullable(),
  nextTaskId: z.string().min(1).nullable(),
});

export type TaskPositionSchema = z.infer<typeof taskPositionSchema>;
