"use server";

/* eslint-disable @clerk/next/require-auth-protection -- This public entry action checks Clerk auth and intentionally permits signed-out visitors to start a Demo session. */

import { auth } from "@clerk/nextjs/server";
import { createDemoSession, resolveDemoSession } from "@/lib/demo-session";
import { ensureDemoBoard } from "@/lib/dal/demo-board";
import { isDevAuthBypass } from "@/utils/auth";

export type StartDemoResult = {
  destination: "/dashboard" | "/demo?new=1";
};

export async function startDemoAction(): Promise<StartDemoResult> {
  const { userId } = await auth();

  if (userId || isDevAuthBypass()) {
    return { destination: "/dashboard" };
  }

  const session = (await resolveDemoSession()) ?? (await createDemoSession());
  await ensureDemoBoard(session.ownerId);

  return { destination: "/demo?new=1" };
}
