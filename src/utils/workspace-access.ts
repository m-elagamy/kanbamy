import "server-only";

import { auth } from "@clerk/nextjs/server";
import { unauthorized } from "next/navigation";
import { resolveDemoSession } from "@/lib/demo-session";
import { DEV_AUTH_USER_ID, isDevAuthBypass } from "@/utils/auth";

export type WorkspaceOwner = {
  ownerId: string;
};

export async function resolveWorkspaceOwner(): Promise<WorkspaceOwner | null> {
  if (isDevAuthBypass()) {
    return { ownerId: DEV_AUTH_USER_ID };
  }

  const { userId } = await auth();
  if (userId) {
    return { ownerId: userId };
  }

  const demoSession = await resolveDemoSession();
  if (!demoSession) return null;

  return { ownerId: demoSession.ownerId };
}

export async function requireWorkspaceAccess(): Promise<WorkspaceOwner> {
  const owner = await resolveWorkspaceOwner();
  if (!owner) unauthorized();
  return owner;
}
