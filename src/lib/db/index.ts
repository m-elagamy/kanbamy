import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, type Prisma } from "@prisma/client";

const shouldLogQueries = process.env.PRISMA_QUERY_LOG === "true";

const logPrismaError = (event: Prisma.LogEvent) => {
  console.error(
    JSON.stringify({
      scope: "prisma-error",
      timestamp: event.timestamp.toISOString(),
      target: event.target,
      message: event.message,
    }),
  );
};

const logPrismaWarning = (event: Prisma.LogEvent) => {
  console.warn(
    JSON.stringify({
      scope: "prisma-warning",
      timestamp: event.timestamp.toISOString(),
      target: event.target,
      message: event.message,
    }),
  );
};

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  const adapter = new PrismaPg(pool);

  if (shouldLogQueries) {
    const client = new PrismaClient({
      adapter,
      log: [
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" },
        { emit: "event", level: "query" },
      ],
    });

    client.$on("error", logPrismaError);
    client.$on("warn", logPrismaWarning);

    client.$on("query", (event) => {
      // eslint-disable-next-line no-console -- intentional server-side observability output
      console.info(
        JSON.stringify({
          scope: "prisma-query",
          timestamp: event.timestamp.toISOString(),
          target: event.target,
          duration_ms: event.duration,
          query: event.query,
        }),
      );
    });

    return client;
  }

  const client = new PrismaClient({
    adapter,
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });

  client.$on("error", logPrismaError);
  client.$on("warn", logPrismaWarning);

  return client;
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const db = globalThis.prismaGlobal ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db;
