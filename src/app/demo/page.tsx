import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import BoardLayout from "@/app/dashboard/components/board";
import DemoBreadcrumb from "@/components/layout/demo-breadcrumb";
import DemoSidebar from "@/components/layout/sidebar/demo-sidebar";
import OfflineStatus from "@/app/dashboard/components/offline-status";
import WorkspaceShell from "@/components/layout/workspace-shell";
import { getBoardBySlugForUser } from "@/lib/dal/board";
import { ensureDemoBoard } from "@/lib/dal/demo-board";
import { resolveDemoSession } from "@/lib/demo-session";
import { isDevAuthBypass } from "@/utils/auth";

export default async function DemoPage() {
  const { userId } = await auth();

  if (userId || isDevAuthBypass()) {
    redirect("/dashboard");
  }

  const demoSession = await resolveDemoSession();
  if (!demoSession) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const demoBoard = await ensureDemoBoard(demoSession.ownerId);
  const board = await getBoardBySlugForUser(
    demoSession.ownerId,
    demoBoard.slug,
  );

  if (!board) {
    notFound();
  }

  return (
    <WorkspaceShell
      defaultOpen={cookieStore.get("sidebar_state")?.value === "true"}
      sidebar={<DemoSidebar board={board} />}
      breadcrumb={<DemoBreadcrumb boardTitle={board.title} />}
      offlineStatus={<OfflineStatus />}
    >
      <BoardLayout initialBoard={board} />
    </WorkspaceShell>
  );
}
