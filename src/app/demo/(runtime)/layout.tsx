import OfflineStatus from "@/app/dashboard/components/offline-status";

export default function DemoRuntimeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <OfflineStatus />
      {children}
    </>
  );
}
