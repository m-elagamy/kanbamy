export const userBoardsTag = (userId: string) => `user-boards-${userId}`;
export const userRecentlyVisitedBoardsTag = (userId: string) =>
  `user-recently-visited-boards-${userId}`;
export const userBoardIdTag = (userId: string, boardId: string) =>
  `user-board-${userId}-${boardId}`;
export const userBoardSlugTag = (userId: string, slug: string) =>
  `user-board-slug-${userId}-${encodeURIComponent(slug)}`;
