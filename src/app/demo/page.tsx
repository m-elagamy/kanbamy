import BoardLayout from "@/app/dashboard/components/board";
import { getDemoBoardWorkspace } from "@/lib/demo-workspace";

export default async function DemoPage() {
  const { board } = await getDemoBoardWorkspace();

  return <BoardLayout initialBoard={board} />;
}
