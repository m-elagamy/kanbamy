"use client";

import { useSyncExternalStore } from "react";
import { Clock as ClockIcon } from "lucide-react";
import { Clock } from "@/components/ui/clock";

const emptySubscribe = () => () => {};

function getDateSnapshot() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());
}

function getServerDateSnapshot() {
  return "";
}

export default function DashboardClock() {
  const dateString = useSyncExternalStore(
    emptySubscribe,
    getDateSnapshot,
    getServerDateSnapshot,
  );

  return (
    <div className="flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground select-none">
      <ClockIcon className="h-3.5 w-3.5 text-foreground/70" />
      <div className="min-w-10 font-mono text-xs font-semibold tracking-tight text-foreground sm:text-sm">
        <Clock showSeconds={false} />
      </div>
      {dateString ? (
        <>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-block min-w-20 text-muted-foreground">
            {dateString}
          </span>
        </>
      ) : (
        <>
          <span className="text-muted-foreground/40">â€¢</span>
          <span className="invisible inline-block min-w-20">Wed, Sep 24</span>
        </>
      )}
    </div>
  );
}
