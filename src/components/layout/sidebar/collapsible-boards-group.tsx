"use client";

import { useState, type ReactNode } from "react";
import SidebarLabel from "./sidebar-label";

export default function CollapsibleBoardsGroup({
  boardsCount,
  children,
}: {
  boardsCount: number;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <SidebarLabel
        boardsCount={boardsCount}
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
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
