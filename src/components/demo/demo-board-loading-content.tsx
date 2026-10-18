import BoardHeaderSkeleton from "@/components/workspace/board/board-header-skeleton";
import ColumnSkeleton from "@/components/workspace/column/column-skeleton";

export default function DemoBoardLoadingContent() {
  return (
    <>
      <BoardHeaderSkeleton />
      <ColumnSkeleton columnsNumber={4} tasksPerColumn={[3, 2, 2, 2]} />
    </>
  );
}
