import DashboardSkeleton from "@/app/dashboard/components/board/dashboard-skeleton";

export default function DemoOverviewLoading() {
  return (
    <main className="relative min-h-full overflow-hidden px-4 py-6 sm:px-6 sm:py-8 md:px-10">
      <section className="relative z-10 mx-auto max-w-5xl">
        <DashboardSkeleton />
      </section>
    </main>
  );
}
