export const delay = (ms?: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function debounce<T extends (...args: Parameters<T>) => unknown>(
  func: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, delayMs);
  };
}
