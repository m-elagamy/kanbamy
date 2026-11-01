"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CopyBoardLink() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const isDashboardBoard =
    pathname.startsWith("/dashboard/") &&
    pathname !== "/dashboard/boards" &&
    pathname !== "/dashboard/tasks";
  const isDemoBoard = pathname.startsWith("/demo");

  if (!isDashboardBoard && !isDemoBoard) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy the link.");
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-10 cursor-pointer md:size-8"
          onClick={() => handleCopy()}
          aria-label="Copy board link"
        >
          {copied ? (
            <Check className="size-4 text-emerald-500" aria-hidden="true" />
          ) : (
            <Link2 className="size-4" aria-hidden="true" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {copied ? "Link copied!" : "Copy board link"}
      </TooltipContent>
    </Tooltip>
  );
}

