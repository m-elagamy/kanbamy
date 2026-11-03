"use client";

import { usePathname } from "next/navigation";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export default function CopyBoardLink() {
  const pathname = usePathname();
  const { copied, copy } = useCopyToClipboard();

  const isDashboardBoard =
    pathname.startsWith("/dashboard/") &&
    pathname !== "/dashboard/boards" &&
    pathname !== "/dashboard/tasks";
  const isDemoBoard = pathname === "/demo";

  if (!isDashboardBoard && !isDemoBoard) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-10 cursor-pointer md:size-8"
          onClick={() => copy(window.location.href)}
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
