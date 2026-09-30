import BoardHeaderSkeleton from "@/app/dashboard/components/board/board-header-skeleton";
import ColumnSkeleton from "@/app/dashboard/components/column/column-skeleton";

export default function DemoBoardLoadingContent() {
  return (
    <>
      <BoardHeaderSkeleton />
      <div className="relative min-h-0 flex-1">
        <ColumnSkeleton columnsNumber={4} tasksPerColumn={[3, 2, 2, 2]} />
      </div>
    </>
  );
}
