"use server";

/* eslint-disable @clerk/next/require-auth-protection -- This public entry action checks Clerk auth and intentionally permits signed-out visitors to start a Demo session. */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createDemoSession, resolveDemoSession } from "@/lib/demo-session";
import { ensureDemoBoard } from "@/lib/dal/demo-board";
import { isDevAuthBypass } from "@/utils/auth";

export async function startDemoAction(): Promise<never> {
  const { userId } = await auth();

  if (userId || isDevAuthBypass()) {
    redirect("/dashboard");
  }

  const session = (await resolveDemoSession()) ?? (await createDemoSession());
  await ensureDemoBoard(session.ownerId);

  redirect("/demo?new=1");
}
