import { getAuthenticatedUserId } from "@/utils/auth";

type DALFunction<T extends unknown[], R> = (...args: T) => Promise<R>;
type DALResult<R> = { success: boolean; message: string; data?: R };

export function withOwnerId<T extends unknown[], R>(
  fn: DALFunction<[ownerId: string, ...args: T], R>,
): DALFunction<[ownerId: string, ...T], DALResult<R>> {
  return async (ownerId, ...args) => {
    const result = await fn(ownerId, ...args);
    if (result === null) {
      return { success: false, message: "Not found" };
    }
    return { success: true, message: "Authenticated", data: result };
  };
}

export function withUserId<T extends unknown[], R>(
  fn: DALFunction<[userId: string, ...args: T], R>,
): DALFunction<T, DALResult<R>> {
  return async (...args: T) => {
    const userId = await getAuthenticatedUserId();
    const result = await fn(userId, ...args);
    if (result === null) {
      return { success: false, message: "Not found" };
    }
    return { success: true, message: "Authenticated", data: result };
  };
}

export function ensureAuthenticated<T extends unknown[], R>(
  fn: DALFunction<T, R>,
): DALFunction<T, DALResult<R>> {
  return async (...args: T) => {
    await getAuthenticatedUserId();
    const result = await fn(...args);
    return { success: true, message: "Authenticated", data: result };
  };
}
