import type { Board } from "@prisma/client";

export type SimplifiedBoard = Omit<
  Board,
  "userId" | "order" | "lastVisitedAt"
>;

export type BoardWithStats = SimplifiedBoard & {
  _count: {
    columns: number;
    openTasks: number;
  };
};

export type BoardState = {
  boards: Record<string, SimplifiedBoard>;
  activeBoardId: string | null;
};

type BoardActions = {
  setBoards: (
    boards:
      | Record<string, SimplifiedBoard>
      | ((
          prev: Record<string, SimplifiedBoard>,
        ) => Record<string, SimplifiedBoard>),
  ) => void;
  setActiveBoardId: (boardId: string | null) => void;
  createBoard: (board: SimplifiedBoard) => void;
  updateBoard: (boardId: string, updates: Partial<SimplifiedBoard>) => void;
  deleteBoard: (boardId: string) => void;
  updateBoardId: (tempId: string, realId: string) => void;
};

export type BoardStore = BoardState & BoardActions;
