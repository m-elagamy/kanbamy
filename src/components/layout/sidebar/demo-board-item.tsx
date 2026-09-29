"use client";

import { usePathname } from "next/navigation";
import type { SimplifiedBoard } from "@/lib/types/stores/board";
import BoardItem from "./board-item";

export default function DemoBoardItem({ board }: { board: SimplifiedBoard }) {
  const pathname = usePathname();

  return (
    <BoardItem
      board={board}
      href="/demo"
      isActive={pathname === "/demo"}
      hideWhenCollapsed={false}
    />
  );
}
