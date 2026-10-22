import { pick } from "@/utils/object";
import isEqual from "fast-deep-equal";

const normalizeValue = (val: unknown): unknown => {
  if (typeof val === "string") return val.replace(/\r\n/g, "\n").trim();
  if (val == null) return "";
  if (Array.isArray(val)) return val.map(normalizeValue);
  return val;
};

const normalizeObject = <T extends Record<string, unknown>>(
  obj: T,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = normalizeValue(value);
  }
  return result;
};

const hasChanges = <T extends Record<string, unknown>>(
  originalData: T | undefined,
  newData: Partial<T> | undefined,
  keys?: (keyof T)[],
): boolean => {
  if (!originalData || !newData) return true;

  const original = keys?.length ? pick(originalData, keys) : originalData;
  const current = keys?.length ? pick(newData, keys) : newData;

  return !isEqual(normalizeObject(original), normalizeObject(current));
};

export default hasChanges;
