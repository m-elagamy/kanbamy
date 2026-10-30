"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface CollapsedColumnsState {
  collapsedColumnIdsByBoard: Record<string, string[]>;
  toggleColumnCollapse: (boardId: string, columnId: string) => void;
}

export const useCollapsedColumnsStore = create<CollapsedColumnsState>()(
  persist(
    immer((set) => ({
      collapsedColumnIdsByBoard: {},

      toggleColumnCollapse: (boardId: string, columnId: string) => {
        set((state) => {
          const currentList = state.collapsedColumnIdsByBoard[boardId] ?? [];

          const isCurrentlyCollapsed = currentList.includes(columnId);

          const nextList = isCurrentlyCollapsed
            ? currentList.filter((id) => id !== columnId)
            : [...currentList, columnId];

          state.collapsedColumnIdsByBoard[boardId] = nextList;
        });
      },
    })),
    {
      name: "kanbamy-collapsed-columns",
    },
  ),
);

export const useIsColumnCollapsed = (boardId: string, columnId: string) =>
  useCollapsedColumnsStore((state) =>
    Boolean(state.collapsedColumnIdsByBoard[boardId]?.includes(columnId)),
  );
