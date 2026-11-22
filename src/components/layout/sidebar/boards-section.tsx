import { cookies } from "next/headers";
import { SidebarGroupContent } from "@/components/ui/sidebar";
import { getAllUserBoardsForUser } from "@/lib/dal/user";
import { getAuthenticatedUserId } from "@/lib/auth";
import CollapsibleBoardsGroup from "./collapsible-boards-group";
import { BoardsList } from "./boards-list";

export default async function BoardsSection() {
  const [userId, cookieStore] = await Promise.all([
    getAuthenticatedUserId(),
    cookies(),
  ]);
  const result = await getAllUserBoardsForUser(userId);
  const defaultOpen = cookieStore.get("sidebar_boards_open")?.value !== "false";

  return (
    <CollapsibleBoardsGroup
      boardsCount={result.totalCount}
      defaultOpen={defaultOpen}
    >
      <SidebarGroupContent>
        <BoardsList boards={result.boards} totalCount={result.totalCount} />
      </SidebarGroupContent>
    </CollapsibleBoardsGroup>
  );
}
