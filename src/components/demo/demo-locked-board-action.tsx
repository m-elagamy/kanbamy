"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function DemoLockedBoardAction({
  side = "bottom",
  children,
}: {
  side?: "top" | "right" | "bottom" | "left";
  children: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side={side} align="end" className="w-64 space-y-3 p-3.5">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold">
            <LockKeyhole className="size-3.5 text-amber-500" aria-hidden="true" />
            <span>One board in demo</span>
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Create an account to add unlimited boards and save your work.
          </p>
        </div>
        <Button size="sm" className="w-full gap-1.5 text-xs" asChild>
          <Link href="/sign-up">
            <span>Create account</span>
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
