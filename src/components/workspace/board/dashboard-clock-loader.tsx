"use client";

import dynamic from "next/dynamic";
import { Clock as ClockIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function ClockSkeleton() {
  return (
    <div className="flex items-center gap-2 px-1" aria-hidden="true">
      <ClockIcon className="text-foreground/30 h-3.5 w-3.5" />
      <Skeleton className="h-4 w-10" />
      <span className="text-muted-foreground/30">•</span>
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

const DashboardClock = dynamic(() => import("./dashboard-clock"), {
  ssr: false,
  loading: () => <ClockSkeleton />,
});

export default DashboardClock;
