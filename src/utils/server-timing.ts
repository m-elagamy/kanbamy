export const getServerTimestamp = () => Date.now();

const SLOW_REQUEST_THRESHOLD_MS = 500;

export const logServerTiming = (
  event: string,
  totalMs: number,
  details: Record<string, number | boolean>,
) => {
  if (totalMs < SLOW_REQUEST_THRESHOLD_MS) return;

  console.debug(
    `[perf:${event}]`,
    JSON.stringify({ totalMs, ...details }),
  );
};
