"use client";

import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { startDemoAction } from "@/actions/demo";
import { cn } from "@/lib/utils";
import delay from "@/utils/delay";

const DEMO_ENTRY_HANDOFF_DELAY_MS = 5000;
const DEMO_ENTRY_EXIT_DURATION_MS = 200;

export default function DemoEntryController({
  children,
}: {
  children: ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [result, formAction, isPending] = useActionState(
    async () => startDemoAction(),
    null,
  );

  useEffect(() => {
    if (hasSubmitted.current) return;

    hasSubmitted.current = true;
    formRef.current?.requestSubmit();
  }, []);

  useEffect(() => {
    if (!result) return;

    let cancelled = false;
    let timeoutId: number | undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const exitDuration = prefersReducedMotion ? 0 : DEMO_ENTRY_EXIT_DURATION_MS;

    const exitStartId = window.setTimeout(async () => {
      await delay(DEMO_ENTRY_HANDOFF_DELAY_MS);
      if (cancelled) return;

      setIsExiting(true);
      timeoutId = window.setTimeout(() => {
        router.replace(result.destination);
      }, exitDuration);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(exitStartId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [result, router]);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-1 flex-col",
        isExiting && "demo-entry-exiting",
      )}
      aria-busy={isPending || isExiting}
    >
      <form
        ref={formRef}
        action={formAction}
        className="sr-only"
        aria-hidden="true"
        aria-busy={isPending}
      >
        <button type="submit" tabIndex={-1} disabled={isPending}>
          Continue to Demo
        </button>
      </form>
      {children}
    </div>
  );
}
