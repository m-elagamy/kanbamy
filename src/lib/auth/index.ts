import "server-only";

import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { unauthorized } from "next/navigation";

const isDevAuthBypassEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.DEV_AUTH_BYPASS === "true";

export const DEV_AUTH_USER_ID = "dev_user_001";

interface SessionUser {
  id: string;
  fullName: string | null;
  firstName: string | null;
  imageUrl: string;
  email: string;
}

const DEV_USER_PROFILE: SessionUser = {
  id: DEV_AUTH_USER_ID,
  fullName: "Development User",
  firstName: "Dev",
  imageUrl: "",
  email: "dev@example.local",
};

const getStringClaim = (
  claims: Record<string, unknown>,
  key: string,
) => {
  const value = claims[key];
  return typeof value === "string" ? value : null;
};

const getSessionUserId = cache(async (): Promise<string | null> => {
  if (isDevAuthBypassEnabled) return DEV_AUTH_USER_ID;

  const { userId } = await auth();
  return userId ?? null;
});

export const isDevAuthBypass = () => isDevAuthBypassEnabled;

export async function requireAuth() {
  if (isDevAuthBypassEnabled) return;
  await auth.protect();
}

export const getAuthenticatedUserId = cache(async () => {
  const userId = await getSessionUserId();
  if (!userId) unauthorized();
  return userId;
});

export async function getAuthenticatedUser() {
  if (isDevAuthBypassEnabled) {
    return {
      ...DEV_USER_PROFILE,
      primaryEmailAddress: { emailAddress: DEV_USER_PROFILE.email },
      createdAt: Date.now(),
    };
  }

  const user = await currentUser();
  if (!user) unauthorized();
  return user;
}

export const isUserAuthenticated = cache(async (): Promise<boolean> => {
  return Boolean(await getSessionUserId());
});

export const getUser = cache(
  async (): Promise<SessionUser | null> => {
    if (isDevAuthBypassEnabled) return DEV_USER_PROFILE;

    const { userId, sessionClaims } = await auth();
    if (!userId) return null;

    const claims = (sessionClaims ?? {}) as Record<string, unknown>;
    const hasSessionClaims = [
      "fullName",
      "firstName",
      "email",
      "imageUrl",
    ].every((key) => Object.hasOwn(claims, key));

    if (!hasSessionClaims) {
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
  },
);
