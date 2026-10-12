import { pick } from "@/utils/object";
import isEqual from "fast-deep-equal";

const hasChanges = <T extends Record<string, unknown>>(
  originalData: T | undefined,
  newData: Partial<T> | undefined,
  keys?: (keyof T)[],
): boolean => {
  if (originalData === undefined || newData === undefined) return true;

  if (keys && keys.length > 0) {
    const originalPicked = pick(originalData, keys);
    const newDataPicked = pick(newData, keys);
    return !isEqual(originalPicked, newDataPicked);
  }

  return !isEqual(originalData, newData);
};

export default hasChanges;
