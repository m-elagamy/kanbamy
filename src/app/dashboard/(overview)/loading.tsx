import {
  OverviewContentSkeleton,
  OverviewPageShell,
} from "@/components/workspace/overview";

export default function DashboardLoading() {
  return (
    <OverviewPageShell basePath="/dashboard">
      <OverviewContentSkeleton />
    </OverviewPageShell>
  );
}
