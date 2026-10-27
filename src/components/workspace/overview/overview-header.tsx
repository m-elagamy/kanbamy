import { Suspense } from "react";
import { LockKeyhole, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BoardModal from "@/components/workspace/board/board-modal";
import OverviewClock from "./overview-clock-loader";
import OverviewGreeting from "./overview-greeting";

interface OverviewHeaderProps {
  getUserName?: () => Promise<string | null>;
  canCreateBoard?: boolean;
}

export default function OverviewHeader({
  getUserName,
  canCreateBoard = true,
}: OverviewHeaderProps) {
  const lockedMessage = "Create an account to add more boards.";

  return (
    <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-[0.25em] uppercase">
          Your workspace
        </p>
        <h1 className="text-gradient text-[clamp(1.875rem,3vw,2.25rem)] font-semibold">
          <Suspense fallback="Welcome back">
            <OverviewGreeting getUserName={getUserName} />
          </Suspense>
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Search your workspace or choose a board to keep things moving.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <OverviewClock />
        {canCreateBoard ? (
          <BoardModal
            mode="create"
            trigger={
              <Button size="default" className="gap-2 rounded-lg shadow-xs">
                <Plus className="size-4" aria-hidden="true" />
                New board
              </Button>
            }
          />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                aria-disabled="true"
                aria-label={lockedMessage}
                className="border-border/70 text-muted-foreground hover:text-muted-foreground cursor-not-allowed gap-2 rounded-lg opacity-70 hover:bg-transparent"
              >
                <Plus className="size-4" aria-hidden="true" />
                New board
                <LockKeyhole className="size-3.5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{lockedMessage}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
