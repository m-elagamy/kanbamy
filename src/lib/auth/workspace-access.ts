import "server-only";

import { auth } from "@clerk/nextjs/server";
import { unauthorized } from "next/navigation";
import { resolveDemoSession } from "@/lib/demo-session";
import { DEV_AUTH_USER_ID, isDevAuthBypass } from "@/lib/auth";

export type WorkspaceOwner = {
  ownerId: string;
  isDemo: boolean;
};

export async function resolveWorkspaceOwner(): Promise<WorkspaceOwner | null> {
  if (isDevAuthBypass()) {
    return { ownerId: DEV_AUTH_USER_ID, isDemo: false };
  }

  const { userId } = await auth();
  if (userId) {
    return { ownerId: userId, isDemo: false };
  }

  const demoSession = await resolveDemoSession();
  if (!demoSession) return null;

  return { ownerId: demoSession.ownerId, isDemo: true };
}

export async function requireWorkspaceAccess(): Promise<WorkspaceOwner> {
  const owner = await resolveWorkspaceOwner();
  if (!owner) unauthorized();
  return owner;
}
