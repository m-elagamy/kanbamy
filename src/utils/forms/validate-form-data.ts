import type { ZodSchema } from "zod";

const validateFormData = <T extends Record<string, unknown>>(
  formData: FormData,
  schema: ZodSchema<T>,
) => {
  const data = Object.fromEntries(formData.entries());
  return schema.safeParse(data);
};

export default validateFormData;
