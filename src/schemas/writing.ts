import { z } from "zod";

export const improveWritingSchema = z
  .discriminatedUnion("scope", [
    z.object({
      scope: z.literal("task"),
      operation: z.enum(["title", "description"]),
      title: z
        .string()
        .trim()
        .min(1, "Please enter a task title first.")
        .max(500, "Task title is too long to enhance."),
      description: z
        .string()
        .trim()
        .max(5000, "Task description is too long.")
        .optional(),
      boardName: z.string().trim().max(200).optional(),
      boardDescription: z.string().trim().max(2000).optional(),
    }),
    z.object({
      scope: z.literal("board"),
      operation: z.enum(["title", "description"]),
      title: z
        .string()
        .trim()
        .min(1, "Please enter a board name first.")
        .max(500, "Board name is too long to enhance."),
      description: z
        .string()
        .trim()
        .max(2000, "Board description is too long.")
        .optional(),
      template: z.string().trim().max(100).optional(),
    }),
  ])
  .superRefine((data, ctx) => {
    if (data.operation === "description" && !data.description?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a description first to improve it.",
        path: ["description"],
      });
    }
  });

export type ImproveWritingSchema = z.infer<typeof improveWritingSchema>;

