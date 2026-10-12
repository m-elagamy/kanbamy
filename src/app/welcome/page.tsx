import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { after } from "next/server";
import WelcomeSetup from "./components/welcome-setup";
import { ensureUserRecord, getUserOnboardingStateForUser } from "@/lib/dal/user";
import {
  getAuthenticatedUser,
  requireAuth,
} from "@/lib/auth";

/* eslint-disable @clerk/next/require-auth-protection -- This resource calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

const WelcomePage = async () => {
  await requireAuth();
  const user = await getAuthenticatedUser();

  const onboardingState = await getUserOnboardingStateForUser(user.id);

  if (
    onboardingState.boardsCount !== 0 ||
    onboardingState.hasCreatedBoardOnce
  ) {
    redirect("/dashboard");
  }

  const profile = {
    id: user.id,
    name: user.fullName ?? null,
    email: user.primaryEmailAddress?.emailAddress ?? null,
  };

  after(async () => {
    try {
      await ensureUserRecord(profile);
    } catch (error) {
      console.error("Background account preparation failed:", error);
    }
  });

  return <WelcomeSetup firstName={user.firstName?.trim() || null} />;
};

export const metadata: Metadata = {
  title: "Welcome",
  description: "Create your first board and start organizing work quickly.",
};

export default WelcomePage;
