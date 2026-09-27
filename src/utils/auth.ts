import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { unauthorized } from "next/navigation";

const isDevAuthBypassEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.DEV_AUTH_BYPASS === "true";

export const DEV_AUTH_USER_ID = "dev_user_001";

export const isDevAuthBypass = () => isDevAuthBypassEnabled;

export async function requireAuth() {
  if (isDevAuthBypassEnabled) return;
  await auth.protect();
}

export async function getAuthenticatedUserId() {
  if (isDevAuthBypassEnabled) return DEV_AUTH_USER_ID;

  const { userId } = await auth();
  if (!userId) unauthorized();
  return userId;
}

export async function getAuthenticatedUser() {
  if (isDevAuthBypassEnabled) {
    return {
      id: DEV_AUTH_USER_ID,
      firstName: "Dev",
      fullName: "Development User",
      imageUrl: "",
      primaryEmailAddress: { emailAddress: "dev@example.local" },
    };
  }

  const user = await currentUser();
  if (!user) unauthorized();
  return user;
}
