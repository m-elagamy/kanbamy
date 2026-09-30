export type PerformanceDetails = Record<string, unknown>;

type MeasurePerformanceOptions = {
  thresholdMs?: number;
  details?: PerformanceDetails | (() => PerformanceDetails);
};

export function logPerformanceMeasurement(
  name: string,
  durationMs: number,
  details: PerformanceDetails = {},
  thresholdMs = 500,
) {
  if (durationMs < thresholdMs) return;

  console.debug(
    `[perf:${name}]`,
    JSON.stringify({
      durationMs: Number(durationMs.toFixed(2)),
      processUptimeMs:
        typeof process !== "undefined"
          ? Math.round(process.uptime() * 1000)
          : null,
      ...details,
    }),
  );
}

export async function measurePerformance<T>(
  name: string,
  operation: () => T | Promise<T>,
  options: MeasurePerformanceOptions = {},
): Promise<T> {
  const startedAt = performance.now();
  const thresholdMs = options.thresholdMs ?? 500;

  try {
    return await operation();
  } finally {
    const details =
      typeof options.details === "function"
        ? options.details()
        : (options.details ?? {});

    logPerformanceMeasurement(
      name,
      performance.now() - startedAt,
      details,
      thresholdMs,
    );
  }
}
