import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/auth";
import AuthButtons from "./auth-buttons";
import HeaderScrollShell from "./header-scroll-shell";
import KanbanLogo from "./kanban-logo";

export default function Header() {
  return (
    <HeaderScrollShell>
      <div className="container !max-w-[1440px] flex h-full items-center justify-between">
        <KanbanLogo size="compact" className="mx-0" />
        <Suspense fallback={<HeaderAuthSkeleton />}>
          <HeaderAuthControls />
        </Suspense>
      </div>
    </HeaderScrollShell>
  );
}

async function HeaderAuthControls() {
  const user = await getUser();
  const authUser = user
    ? {
        fullName: user.fullName,
        firstName: user.firstName,
        imageUrl: user.imageUrl,
      }
    : null;

  return <AuthButtons user={authUser} />;
}

function HeaderAuthSkeleton() {
  return <Skeleton className="size-10 rounded-full" aria-hidden="true" />;
}
