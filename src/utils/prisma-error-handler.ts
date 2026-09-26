import { Prisma } from "@prisma/client";

export function getPrismaErrorDetails(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return `Prisma ${error.code}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export default function handlePrismaError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("[Prisma error]", {
      code: error.code,
      message: error.message,
      meta: error.meta,
    });

    if (error.code === "P2002") {
      return `A record with this unique field already exists.`;
    }
  }

  console.error("[Unexpected database error]", error);
  return "An unexpected database error occurred.";
}
