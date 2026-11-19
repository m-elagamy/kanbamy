"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { CircleAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  AuthStatusMessage,
  AuthStatusShell,
} from "@/app/(auth)/components/auth-status-screen";
import { Button } from "@/components/ui/button";

type NavigateOptions = {
  session?: { currentTask?: unknown };
  decorateUrl: (url: string) => string;
};

const statusDescriptions: Record<string, string> = {
  "Completing your secure sign-in…":
    "PREPARING YOUR WORKSPACE",

  "Connecting to your existing account…":
    "EXISTING ACCOUNT CONFIRMED",

  "Creating your Kanbamy account…":
    "SETTING UP YOUR ACCOUNT",

  "One more step required":
    "ADDITIONAL VERIFICATION REQUIRED",
};
const callbackReviewDelay =
  process.env.NODE_ENV === "development" ? 3000 : 0;

const waitForCallbackReview = () =>
  callbackReviewDelay
    ? new Promise((resolve) => window.setTimeout(resolve, callbackReviewDelay))
    : Promise.resolve();

function SsoCallbackContent() {
  const clerk = useClerk();
  const { signIn, errors: signInErrors } = useSignIn();
  const { signUp, errors: signUpErrors } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRun = useRef(false);
  const [message, setMessage] = useState("Completing your secure sign-in…");
  const [error, setError] = useState<string | null>(null);
  const statusDescription =
    statusDescriptions[message] ??
    "PREPARING YOUR WORKSPACE";

  useEffect(() => {
    if (!clerk.loaded || hasRun.current) return;

    hasRun.current = true;
    const createNavigate = (destination: "/dashboard" | "/welcome") =>
      ({ session, decorateUrl }: NavigateOptions) => {
        if (session?.currentTask) {
          setMessage("One more step required");
          return;
        }

        const url = decorateUrl(destination);
        if (url.startsWith("http")) {
          window.location.assign(url);
          return;
        }

        router.replace(url);
      };

    const navigateToDashboard = createNavigate("/dashboard");
    const navigateToWelcome = createNavigate("/welcome");

    void (async () => {
      try {
        await waitForCallbackReview();

        if (signIn.status === "complete") {
          await signIn.finalize({ navigate: navigateToDashboard });
          return;
        }

        if (signUp.isTransferable) {
          setMessage("Connecting to your existing account…");
          await waitForCallbackReview();
          await signIn.create({ transfer: true });
          if ((signIn.status as string) === "complete") {
            await signIn.finalize({ navigate: navigateToDashboard });
            return;
          }
          router.replace("/sign-in");
          return;
        }

        if (
          signIn.status === "needs_first_factor" ||
          signIn.status === "needs_second_factor" ||
          signIn.status === "needs_new_password" ||
          signIn.status === "needs_client_trust"
        ) {
          router.replace("/sign-in");
          return;
        }

        if (signIn.isTransferable) {
          setMessage("Creating your Kanbamy account…");
          await waitForCallbackReview();
          await signUp.create({ transfer: true });
          if ((signUp.status as string) === "complete") {
            await signUp.finalize({ navigate: navigateToWelcome });
            return;
          }
          router.replace("/sign-in/continue");
          return;
        }

        if (signUp.status === "complete") {
          await signUp.finalize({ navigate: navigateToWelcome });
          return;
        }

        const sessionId =
          signIn.existingSession?.sessionId ?? signUp.existingSession?.sessionId;
        if (sessionId) {
          await clerk.setActive({
            session: sessionId,
            navigate: signIn.existingSession
              ? navigateToDashboard
              : navigateToWelcome,
          });
          return;
        }

        const provider = searchParams.get("provider");
        const clerkError =
          signInErrors.global?.[0]?.message ??
          signUpErrors.global?.[0]?.message;
        if (clerkError) {
          setError(clerkError);
          return;
        }

        window.sessionStorage.setItem("oauth-notice", provider ?? "social");
        router.replace("/sign-in");
      } catch {
        setError("We couldn’t complete the sign-in. Please try again.");
      }
    })();
  }, [
    clerk,
    router,
    searchParams,
    signIn,
    signInErrors.global,
    signUp,
    signUpErrors.global,
  ]);

  return (
    <AuthStatusShell footer={<div id="clerk-captcha" />}>
      {error ? (
        <div className="grid max-w-md justify-items-center gap-5">
          <div className="border-destructive/20 bg-destructive/5 flex size-14 items-center justify-center rounded-full border shadow-sm">
            <CircleAlert
              className="text-destructive size-6"
              aria-hidden="true"
            />
          </div>
          <div className="grid gap-2.5">
            <h1 className="text-foreground text-[clamp(1.25rem,2vw,1.5rem)] font-semibold tracking-tight text-balance">
              We couldn’t complete that connection
            </h1>
            <p
              role="alert"
              className="text-muted-foreground text-sm leading-6 text-pretty sm:text-base"
            >
              {error}
            </p>
          </div>
          <Button
            className="mt-1 min-w-36"
            onClick={() => router.replace("/sign-in")}
          >
            Back to sign in
          </Button>
        </div>
      ) : (
        <AuthStatusMessage title={message} description={statusDescription} />
      )}
    </AuthStatusShell>
  );
}

export default function SsoCallbackPage() {
  return (
    <Suspense fallback={null}>
      <SsoCallbackContent />
    </Suspense>
  );
}
