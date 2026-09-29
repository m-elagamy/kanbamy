import "server-only";

import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getBoardBySlugForUser } from "@/lib/dal/board";
import { ensureDemoBoard } from "@/lib/dal/demo-board";
import { resolveDemoSession } from "@/lib/demo-session";
import { isDevAuthBypass } from "@/utils/auth";

export const getDemoWorkspaceContext = cache(async () => {
  const { userId } = await auth();

  if (userId || isDevAuthBypass()) {
    redirect("/dashboard");
  }

  const demoSession = await resolveDemoSession();
  if (!demoSession) {
    redirect("/");
  }

  const [cookieStore, demoBoard] = await Promise.all([
    cookies(),
    ensureDemoBoard(demoSession.ownerId),
  ]);

  return {
    demoSession,
    demoBoard,
    defaultOpen: cookieStore.get("sidebar_state")?.value === "true",
  };
});

export const getDemoBoardWorkspace = cache(async () => {
  const context = await getDemoWorkspaceContext();
  const board = await getBoardBySlugForUser(
    context.demoSession.ownerId,
    context.demoBoard.slug,
  );

  if (!board) {
    notFound();
  }

  return { ...context, board };
});
