"use client";

import { useEffect } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useOffline } from "next/offline";

const offlineToastId = "offline-status";

export default function OfflineStatus() {
  const isOffline = useOffline();

  useEffect(() => {
    if (isOffline) {
      toast.warning("You're offline", {
        id: offlineToastId,
        description: "Some changes may not be saved until your connection returns.",
        icon: (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
            <WifiOff aria-hidden="true" className="size-4" />
          </span>
        ),
        duration: Infinity,
        dismissible: false,
        position: "top-center",
        className:
          "min-w-[360px] max-w-[calc(100vw-2rem)] border-amber-500/30 border-l-4 border-l-amber-500 bg-background/95 shadow-lg shadow-amber-950/10 backdrop-blur",
        classNames: {
          title: "text-amber-500 font-semibold",
          description: "text-muted-foreground mt-1 leading-5",
          content: "gap-1",
          icon: "!size-8 !ml-0 !mr-2",
        },
      });
      return;
    }

    toast.dismiss(offlineToastId);
  }, [isOffline]);

  return null;
}
