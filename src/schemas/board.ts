import { z } from "zod";
import { BOARD_TAGS, RESERVED_BOARD_SLUGS } from "@/lib/constants";
import { slugify } from "@/utils/slugify";

export const boardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: "Board name must be at least 3 characters." })
    .max(50, { message: "Board name must be less than 50 characters." })
    .refine((val) => /[\p{L}\p{N}]/u.test(val), {
      message: "Board name must contain at least one letter or number.",
    })
    .refine((val) => !RESERVED_BOARD_SLUGS.includes(slugify(val)), {
      message: "This board name is reserved. Please choose another.",
    }),
  template: z
    .enum(["personal", "agile", "bug-tracking", "custom"])
    .default("personal")
    .optional(),
  description: z
    .string()
    .max(500, { message: "Description too long." })
    .trim()
    .nullish()
    .optional(),
  tags: z
    .preprocess((val) => {
      if (!val) return [];
      if (typeof val === "string") return [val];
      return val;
    }, z.array(z.enum(BOARD_TAGS)))
    .transform((tags) => BOARD_TAGS.filter((tag) => tags.includes(tag))),
});

export type BoardFormSchema = z.infer<typeof boardSchema>;
