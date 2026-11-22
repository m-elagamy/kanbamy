"use client";

import type { ReactNode } from "react";
import { useBoardsFolder } from "@/hooks/use-boards-folder";
import SidebarLabel from "./sidebar-label";

export default function CollapsibleBoardsGroup({
  boardsCount,
  defaultOpen = true,
  children,
}: {
  boardsCount: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const { isOpen, toggle } = useBoardsFolder(defaultOpen);

  return (
    <>
      <SidebarLabel
        boardsCount={boardsCount}
        isOpen={isOpen}
        onToggle={toggle}
      />
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </>
  );
}
