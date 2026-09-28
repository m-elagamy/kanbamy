"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { CircleAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import BackgroundEffect from "@/app/(auth)/components/background-effect";
import KanbanLogo from "@/components/layout/header/kanban-logo";
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
    <main className="bg-muted/30 dark:bg-background relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <BackgroundEffect />
      <section className="animate-in fade-in zoom-in-95 motion-reduce:animate-none relative z-10 grid w-full max-w-xl -translate-y-7 justify-items-center gap-5 text-center duration-500 ease-out sm:-translate-y-11 sm:gap-6">
        <KanbanLogo
          glow="auth"
          className="mx-auto"
        />
        {error ? (
          <div className="grid max-w-md justify-items-center gap-5">
            <div className="border-destructive/20 bg-destructive/5 flex size-14 items-center justify-center rounded-full border shadow-sm">
              <CircleAlert
                className="text-destructive size-6"
                aria-hidden="true"
              />
            </div>
            <div className="grid gap-2.5">
              <h1 className="text-foreground text-xl font-semibold tracking-tight text-balance sm:text-2xl">
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
          <div
            className="grid max-w-2xl justify-items-center gap-3"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="grid gap-1.5">
              <h1 className="text-foreground flex items-center justify-center gap-2 text-base font-semibold tracking-tight text-balance sm:text-lg">
                <span aria-hidden="true" className="relative flex size-2 shrink-0">
                  <span className="bg-(--brand) absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none" />
                  <span className="bg-(--brand) relative inline-flex size-1.5 self-center rounded-full" />
                </span>
                {message}
              </h1>
              <p className="text-foreground/60 dark:text-foreground/65 mx-auto max-w-xl text-[0.68rem] font-medium leading-5 tracking-[0.12em] text-pretty sm:text-xs sm:tracking-[0.16em]">
                {statusDescription}
              </p>
            </div>
          </div>
        )}
      </section>
      <div id="clerk-captcha" />
    </main>
  );
}

export default function SsoCallbackPage() {
  return (
    <Suspense fallback={null}>
      <SsoCallbackContent />
    </Suspense>
  );
}
