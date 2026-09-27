export const getServerTimestamp = () => Date.now();

const SLOW_REQUEST_THRESHOLD_MS = 500;
const shouldLogAllPerformance = process.env.PRISMA_QUERY_LOG === "true";

export const logServerTiming = (
  event: string,
  totalMs: number,
  details: Record<string, number | boolean | string>,
) => {
  if (!shouldLogAllPerformance && totalMs < SLOW_REQUEST_THRESHOLD_MS) return;

  console.debug(
    `[perf:${event}]`,
    JSON.stringify({ totalMs, ...details }),
  );
};
