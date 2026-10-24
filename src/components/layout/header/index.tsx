import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getOptionalDashboardUser } from "@/lib/auth";
import AuthButtons from "./auth-buttons";
import HeaderScrollShell from "./header-scroll-shell";
import KanbanLogo from "./kanban-logo";

type HeaderUser = {
  fullName: string | null;
  firstName: string | null;
  imageUrl: string;
};

function HeaderAuthFallback() {
  return (
    <div
      className="flex h-9 items-center gap-2 max-[359px]:gap-1"
      aria-hidden="true"
    >
      <Skeleton className="h-9 w-22 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
    </div>
  );
}

async function HeaderAuth() {
  const user = await getOptionalDashboardUser();
  const authUser = user
    ? {
        fullName: user.fullName,
        firstName: user.firstName,
        imageUrl: user.imageUrl,
      }
    : null;

  return <AuthButtons user={authUser} />;
}

const Header = ({ user }: { user?: HeaderUser | null }) => {
  return (
    <HeaderScrollShell>
      <div className="container flex h-full !max-w-[1440px] items-center justify-between">
        <KanbanLogo size="compact" className="mx-0" />
        {user !== undefined ? (
          <AuthButtons user={user} />
        ) : (
          <Suspense fallback={<HeaderAuthFallback />}>
            <HeaderAuth />
          </Suspense>
        )}
      </div>
    </HeaderScrollShell>
  );
};

export default Header;
