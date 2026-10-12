import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyBoardsIllustration from "@/components/ui/empty-boards-illustration";
import { EmptyState } from "@/components/ui/empty-state";
import BoardModal from "./board-modal";

export default function DashboardEmptyState() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both min-h-80 delay-100 duration-[350ms] ease-out motion-reduce:animate-none">
      <EmptyState
        illustration={<EmptyBoardsIllustration />}
        title="No boards yet"
        description="Create a board to start organizing your tasks and projects."
        action={
          <BoardModal
            mode="create"
            trigger={
              <Button>
                <Plus aria-hidden="true" />
                Create a board
              </Button>
            }
          />
        }
      />
    </div>
  );
}
