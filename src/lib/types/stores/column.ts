import type { Column } from "@prisma/client";

export type SimplifiedColumn = Omit<Column, "boardId">;

export type ColumnOperation =
  {
      kind: "reorder";
      boardId: string;
      previousOrders: Record<string, number>;
      optimisticOrders: Record<string, number>;
    };

export type ColumnState = {
  activeBoardId: string | null;
  columnsByBoard: Record<string, Record<string, SimplifiedColumn>>;
  optimisticOperations: Record<string, ColumnOperation>;
};

export type ColumnActions = {
  initializeColumns: (
    boardId: string,
    columns: ReadonlyArray<SimplifiedColumn>,
  ) => void;
  setColumns: (
    boardId: string,
    columns: ReadonlyArray<SimplifiedColumn>,
  ) => void;

  addColumn: (boardId: string, column: SimplifiedColumn) => void;
  updateColumn: (
    boardId: string,
    columnId: string,
    updates: Pick<Column, "status">,
  ) => void;
  deleteColumn: (boardId: string, columnId: string) => void;

  updateColumnId: (
    boardId: string,
    oldColumnId: string,
    newColumnId: string,
  ) => void;
  updatePredefinedColumnsId: (
    boardId: string,
    columns: ReadonlyArray<{ oldId: string; newId: string }>,
  ) => void;
  transferColumnsToBoard: (oldBoardId: string, newBoardId: string) => void;

  reorderColumns: (
    boardId: string,
    activeColumnId: string,
    overColumnId: string,
  ) => string | null;
  rollbackReorder: (operationId?: string) => void;
  clearOperation: (operationId?: string) => void;

};

export type ColumnStore = ColumnState & ColumnActions;
