import { LockKeyhole, Plus } from "lucide-react";
import BoardModal from "@/components/workspace/board/board-modal";
import OverviewClock from "./overview-clock-loader";
import OverviewGreeting from "./overview-greeting";

interface OverviewHeaderProps {
  userName: string | null;
  hasBoards: boolean;
  canCreateBoard?: boolean;
}

export default function OverviewHeader({
  userName,
  hasBoards,
  canCreateBoard = true,
}: OverviewHeaderProps) {
  return (
    <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-[0.25em]">
          Your workspace
        </p>
        <h1 className="text-gradient text-[clamp(1.875rem,3vw,2.25rem)] font-semibold">
          <OverviewGreeting userName={userName} />
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          {hasBoards
            ? "Search your workspace or choose a board to keep things moving."
            : "Your workspace is ready when you are."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <OverviewClock />
        {hasBoards && canCreateBoard && (
          <BoardModal
            mode="create"
            trigger={
              <button>
                <Plus className="h-4 w-4" />
                New board
              </button>
            }
          />
        )}
        {hasBoards && !canCreateBoard && (
          <button
            type="button"
            disabled
            aria-label="Create an account to add more boards."
            title="Create an account to add more boards."
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border/70 px-3 text-sm font-medium text-muted-foreground opacity-70"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New board
            <LockKeyhole className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
