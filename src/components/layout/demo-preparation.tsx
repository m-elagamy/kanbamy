import DemoBoardLoadingContent from "@/components/layout/demo-board-loading-content";
import DemoPreparationStatus from "@/components/layout/demo-preparation-status";

export default function DemoPreparation() {
  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div
        className="demo-entry-workspace-enter flex min-h-0 min-w-0 flex-1 flex-col"
        aria-hidden="true"
      >
        <DemoBoardLoadingContent />
      </div>

      <div
        className="pointer-events-none fixed inset-0 z-50 bg-black/10 dark:bg-black/20"
        aria-hidden="true"
      />

      <DemoPreparationStatus />
    </div>
  );
}
