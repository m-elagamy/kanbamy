"use client";

import { useReducedMotion } from "motion/react";
import { TextShimmer } from "@/components/ui/text-shimmer";

export default function DemoPreparationStatus() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="demo-preparation-status pointer-events-none absolute inset-0 z-[60] flex -translate-y-6 items-center justify-center px-4 py-8 transition-opacity duration-[200ms] ease-out sm:px-8 motion-reduce:transition-none"
      aria-labelledby="demo-preparation-title"
      aria-busy="true"
    >
      <div
        className="bg-background/90 border-black/20 dark:border-border/70 grid w-full max-w-sm gap-3 rounded-xl border px-5 py-4 text-center shadow-sm backdrop-blur-sm sm:px-6"
        role="status"
        aria-live="polite"
      >
        <div className="relative mx-auto size-10" aria-hidden="true">
          <span className="border-primary/25 border-t-primary/85 absolute inset-0 rounded-full border animate-[spin_1.5s_linear_infinite] motion-reduce:animate-none" />
          <span
            className="bg-primary absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2"
            style={{
              WebkitMaskImage: "url('/brand/kanbamy.webp')",
              maskImage: "url('/brand/kanbamy.webp')",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
        </div>
        <h1
          id="demo-preparation-title"
          className="text-foreground text-lg font-semibold tracking-tight text-balance sm:text-xl"
        >
          Preparing your workspace
        </h1>
        {prefersReducedMotion ? (
          <p className="text-muted-foreground text-sm leading-6 sm:text-base">
            Getting everything ready for you…
          </p>
        ) : (
          <TextShimmer
            duration={1}
            spread={2}
            className="text-muted-foreground text-sm leading-6 sm:text-base"
          >
            Getting everything ready for you…
          </TextShimmer>
        )}
      </div>
    </section>
  );
}
