import { SidebarGroupContent } from "@/components/ui/sidebar";
import { getAllUserBoardsForUser } from "@/lib/dal/user";
import { getAuthenticatedUserId } from "@/lib/auth";
import SidebarLabel from "./sidebar-label";
import { BoardsList } from "./boards-list";

export default async function BoardsSection() {
  const userId = await getAuthenticatedUserId();
  const result = await getAllUserBoardsForUser(userId);

  return (
    <>
      <SidebarLabel boardsCount={result.totalCount} />
      <SidebarGroupContent>
        <BoardsList boards={result.boards} totalCount={result.totalCount} />
      </SidebarGroupContent>
    </>
  );
}
