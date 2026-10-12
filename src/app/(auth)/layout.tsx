import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
// import { GoogleOneTap } from "@clerk/nextjs";
import { isDevAuthBypass } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isDevAuthBypass()) {
    redirect("/dashboard");
  }

  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <>
      {/* <GoogleOneTap
        signInForceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/welcome"
      /> */}
      {children}
    </>
  );
}

