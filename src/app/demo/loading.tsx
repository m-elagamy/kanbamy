import BoardSkeleton from "@/app/dashboard/components/board/board-skeleton";

export default function DemoLoading() {
  return <BoardSkeleton columnsNumber={4} tasksPerColumn={[3, 2, 2, 2]} />;
}
