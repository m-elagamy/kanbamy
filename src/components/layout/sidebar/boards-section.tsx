import { SidebarGroupContent } from "@/components/ui/sidebar";
import { getAllUserBoardsForUser } from "@/lib/dal/user";
import { getAuthenticatedUserId } from "@/lib/auth";
import CollapsibleBoardsGroup from "./collapsible-boards-group";
import { BoardsList } from "./boards-list";

export default async function BoardsSection() {
  const userId = await getAuthenticatedUserId();
  const result = await getAllUserBoardsForUser(userId);

  return (
    <CollapsibleBoardsGroup boardsCount={result.totalCount}>
      <SidebarGroupContent>
        <BoardsList boards={result.boards} totalCount={result.totalCount} />
      </SidebarGroupContent>
    </CollapsibleBoardsGroup>
  );
}
