import OfflineStatus from "@/components/workspace/offline-status";

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
