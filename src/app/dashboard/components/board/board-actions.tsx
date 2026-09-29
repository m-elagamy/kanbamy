"use client";

import { useState, useTransition } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Ellipsis, LockKeyhole, SquarePen, TrashIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteBoardAction } from "@/actions/board";
import { SidebarMenuAction, useSidebar } from "@/components/ui/sidebar";
import useBoardStore from "@/stores/board";
import BoardModal from "./board-modal";
import type { BoardSummary } from "@/lib/types";
import handleOnError from "@/utils/handle-on-error";

const AlertConfirmation = dynamic(
  () => import("@/components/ui/alert-confirmation"),
  {
    loading: () => null,
  },
);

type BoardActionsProps = {
  board: BoardSummary;
  isSidebarTrigger?: boolean;
};

export function BoardActionsTrigger({
  interactive = true,
}: {
  interactive?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 hover:bg-accent hover:text-accent-foreground"
      aria-disabled={!interactive || undefined}
      tabIndex={interactive ? undefined : -1}
    >
      <Ellipsis />
      <span className="sr-only">Open menu</span>
    </Button>
  );
}

export default function BoardActions({
  board,
  isSidebarTrigger,
}: Readonly<BoardActionsProps>) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const isDemo = pathname.startsWith("/demo");
  const { isMobile } = useSidebar();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const deleteBoard = useBoardStore((state) => state.deleteBoard);

  const handleOnClick = () => {
    if (!board.id) return;

    startTransition(async () => {
      try {
        const { success, message } = await deleteBoardAction(board.id);
        if (!success) {
          handleOnError(message, "Failed to delete board");
          setIsAlertOpen(false);
          return;
        }

        deleteBoard(board.id);
        if (params.board === board.slug) {
          router.replace("/dashboard");
        } else if (pathname === "/demo") {
          router.refresh();
        }
      } catch (error) {
        handleOnError(error, "Failed to delete board");
        setIsAlertOpen(false);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isSidebarTrigger ? (
          <SidebarMenuAction
            className="top-[3px]! size-7 peer-data-[active=true]/menu-button:opacity-100"
            showOnHover
          >
            <Ellipsis />
            <span className="sr-only">Open menu</span>
          </SidebarMenuAction>
        ) : (
          <Button variant="ghost" size="icon" className="size-8">
            <Ellipsis />
            <span className="sr-only">Open menu</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isSidebarTrigger && !isMobile ? "right" : "bottom"}
        align={isSidebarTrigger ? "start" : "end"}
      >
        <DropdownMenuLabel>Board Actions:</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={isDemo}
          className="h-8 gap-2 px-2 py-1.5"
          onSelect={() => {
            if (!isDemo) setIsEditOpen(true);
          }}
          aria-label={isDemo ? "Edit board. Create an account to edit boards." : undefined}
          title={isDemo ? "Create an account to edit boards." : undefined}
        >
          <SquarePen size={16} /> Edit
        </DropdownMenuItem>
        {isDemo ? (
          <DropdownMenuItem
            disabled
            className="h-8 gap-2 px-2 py-1.5"
            aria-label="Delete board. Create an account to delete boards."
            title="Create an account to delete boards."
          >
            <LockKeyhole size={16} /> Delete
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            variant="destructive"
            className="h-8 gap-2 px-2 py-1.5"
            onSelect={() => setIsAlertOpen(true)}
          >
            <TrashIcon size={16} /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
      <BoardModal
        mode="edit"
        board={board}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
      {isAlertOpen && (
        <AlertConfirmation
          open={isAlertOpen}
          setOpen={setIsAlertOpen}
          title={`Delete Board`}
          description="This action will permanently remove the board and all its data."
          onClick={handleOnClick}
          isPending={isPending}
        />
      )}
    </DropdownMenu>
  );
}
