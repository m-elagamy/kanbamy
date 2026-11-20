import { Suspense } from "react";
import { redirect } from "next/navigation";
// import { GoogleOneTap } from "@clerk/nextjs";
import { isUserAuthenticated } from "@/lib/auth";
import {
  AuthStatusMessage,
  AuthStatusShell,
} from "./components/auth-status-screen";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <AuthGuard>{children}</AuthGuard>
    </Suspense>
  );
}

async function AuthGuard({ children }: { children: React.ReactNode }) {
  if (await isUserAuthenticated()) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

function AuthShellFallback() {
  return (
    <AuthStatusShell>
      <AuthStatusMessage
        title="Checking your session…"
        description="VERIFYING ACCESS"
      />
    </AuthStatusShell>
  );
}
