import { pick } from "@/utils/object";
import isEqual from "fast-deep-equal";

const normalizeForComparison = (val: unknown): unknown => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") {
    return val.replace(/\r\n/g, "\n").trim();
  }
  if (Array.isArray(val)) {
    return val.map(normalizeForComparison);
  }
  if (val && typeof val === "object") {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      res[k] = normalizeForComparison(v);
    }
    return res;
  }
  return val;
};

const hasChanges = <T extends Record<string, unknown>>(
  originalData: T | undefined,
  newData: Partial<T> | undefined,
  keys?: (keyof T)[],
): boolean => {
  if (originalData === undefined || newData === undefined) return true;

  if (keys && keys.length > 0) {
    const originalPicked = pick(originalData, keys);
    const newDataPicked = pick(newData, keys);
    return !isEqual(
      normalizeForComparison(originalPicked),
      normalizeForComparison(newDataPicked),
    );
  }

  return !isEqual(
    normalizeForComparison(originalData),
    normalizeForComparison(newData),
  );
};

export default hasChanges;
