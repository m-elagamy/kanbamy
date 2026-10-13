import type { ZodSchema } from "zod";

const validateFormData = <T extends Record<string, unknown>>(
  formData: FormData,
  schema: ZodSchema<T>,
) => {
  const data: Record<string, unknown> = {};

  for (const key of formData.keys()) {
    const values = formData.getAll(key);
    if (key === "tags") {
      data[key] = values.filter(Boolean);
    } else {
      data[key] = values.length > 1 ? values : values[0];
    }
  }

  return schema.safeParse(data);
};

export default validateFormData;
