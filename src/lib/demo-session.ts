import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import db from "@/lib/db";

const DEMO_COOKIE_NAME = "kanbamy_demo_session";
const DEMO_SESSION_LIFETIME_SECONDS = 7 * 24 * 60 * 60;
const DEMO_SESSION_LIFETIME_MS = DEMO_SESSION_LIFETIME_SECONDS * 1000;

type DemoSession = {
  ownerId: string;
  expiresAt: Date;
};

const hashDemoToken = (token: string) =>
  createHash("sha256").update(token, "utf8").digest("hex");

const getDemoCookieOptions = (expiresAt: Date) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  expires: expiresAt,
  maxAge: DEMO_SESSION_LIFETIME_SECONDS,
});

export async function createDemoSession(): Promise<DemoSession> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashDemoToken(token);
  const expiresAt = new Date(Date.now() + DEMO_SESSION_LIFETIME_MS);
  const ownerId = `demo_${randomUUID()}`;

  await db.$transaction((tx) =>
    tx.user.create({
      data: {
        id: ownerId,
        isDemo: true,
        demoTokenHash: tokenHash,
        demoExpiresAt: expiresAt,
      },
    }),
  );

  const cookieStore = await cookies();
  cookieStore.set(
    DEMO_COOKIE_NAME,
    token,
    getDemoCookieOptions(expiresAt),
  );

  return { ownerId, expiresAt };
}

export async function resolveDemoSession(): Promise<DemoSession | null> {
  try {
    const token = (await cookies()).get(DEMO_COOKIE_NAME)?.value;
    if (!token || token.length < 43 || token.length > 128) return null;

    const session = await db.user.findFirst({
      where: {
        isDemo: true,
        demoTokenHash: hashDemoToken(token),
        demoExpiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        demoExpiresAt: true,
      },
    });

    if (!session?.demoExpiresAt) return null;

    return {
      ownerId: session.id,
      expiresAt: session.demoExpiresAt,
    };
  } catch {
    return null;
  }
}

export async function invalidateDemoSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEMO_COOKIE_NAME)?.value;

    if (!token || token.length < 43 || token.length > 128) {
      cookieStore.delete(DEMO_COOKIE_NAME);
      return false;
    }

    const result = await db.user.updateMany({
      where: {
        isDemo: true,
        demoTokenHash: hashDemoToken(token),
      },
      data: {
        demoTokenHash: null,
        demoExpiresAt: null,
      },
    });

    cookieStore.delete(DEMO_COOKIE_NAME);
    return result.count === 1;
  } catch {
    return false;
  }
}

