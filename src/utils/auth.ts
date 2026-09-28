import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { unauthorized } from "next/navigation";

const isDevAuthBypassEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.DEV_AUTH_BYPASS === "true";

export const DEV_AUTH_USER_ID = "dev_user_001";

type DashboardUser = {
  id: string;
  fullName: string | null;
  firstName: string | null;
  imageUrl: string;
  email: string;
};

const getStringClaim = (
  claims: Record<string, unknown>,
  key: string,
) => {
  const value = claims[key];
  return typeof value === "string" ? value : null;
};

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

export async function getOptionalDashboardUser(): Promise<DashboardUser | null> {
  if (isDevAuthBypassEnabled) {
    return {
      id: DEV_AUTH_USER_ID,
      fullName: "Development User",
      firstName: "Dev",
      imageUrl: "",
      email: "dev@example.local",
    };
  }

  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  const claims = (sessionClaims ?? {}) as Record<string, unknown>;
  const hasDashboardClaims = [
    "fullName",
    "firstName",
    "email",
    "imageUrl",
  ].every((key) => Object.hasOwn(claims, key));

  if (!hasDashboardClaims) {
    const user = await currentUser();
    if (!user) return null;

    return {
      id: user.id,
      fullName: user.fullName,
      firstName: user.firstName,
      imageUrl: user.imageUrl,
      email: user.primaryEmailAddress?.emailAddress ?? "",
    };
  }

  return {
    id: userId,
    fullName: getStringClaim(claims, "fullName"),
    firstName: getStringClaim(claims, "firstName"),
    imageUrl: getStringClaim(claims, "imageUrl") ?? "",
    email: getStringClaim(claims, "email") ?? "",
  };
}

export async function getAuthenticatedDashboardUser(): Promise<DashboardUser> {
  const user = await getOptionalDashboardUser();
  if (!user) unauthorized();
  return user;
}
