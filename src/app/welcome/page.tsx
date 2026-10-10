import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { after } from "next/server";
import WelcomeSetup from "./components/welcome-setup";
import { getUserOnboardingStateAction } from "@/actions/user";
import { ensureUserRecord } from "@/lib/dal/user";
import {
  getAuthenticatedUser,
  requireAuth,
} from "@/utils/auth";

/* eslint-disable @clerk/next/require-auth-protection -- This resource calls requireAuth(), which preserves DEV_AUTH_BYPASS before delegating to auth.protect(). */

const WelcomePage = async () => {
  await requireAuth();
  const user = await getAuthenticatedUser();

  const onboardingState = await getUserOnboardingStateAction();

  const boardsCount = onboardingState.fields?.boardsCount ?? 0;
  const hasCreatedBoardOnce =
    onboardingState.fields?.hasCreatedBoardOnce ?? false;

  if (boardsCount !== 0 || hasCreatedBoardOnce) redirect("/dashboard");

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
