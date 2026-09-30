import { cookies } from "next/headers";
import DemoEntryBreadcrumb from "@/components/layout/demo-entry-breadcrumb";
import DemoHeaderIndicator from "@/components/layout/demo-header-indicator";
import DemoSidebarFrame from "@/components/layout/sidebar/demo-sidebar-frame";
import WorkspaceContentFrame from "@/components/layout/workspace-content-frame";
import WorkspaceShell from "@/components/layout/workspace-shell";

export default async function DemoLayout({
  children,
  sidebar,
  breadcrumb,
}: Readonly<{
  children: React.ReactNode;
  sidebar: React.ReactNode;
  breadcrumb: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  return (
    <WorkspaceShell
      defaultOpen={cookieStore.get("sidebar_state")?.value === "true"}
      sidebar={<DemoSidebarFrame>{sidebar}</DemoSidebarFrame>}
      breadcrumb={breadcrumb ?? <DemoEntryBreadcrumb />}
      headerIndicator={<DemoHeaderIndicator />}
    >
      <WorkspaceContentFrame>{children}</WorkspaceContentFrame>
    </WorkspaceShell>
  );
}
