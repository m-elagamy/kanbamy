"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
      >
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster />
        </MotionConfig>
      </ThemeProvider>
    </ClerkProvider>
  );
}
