import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { resolveDemoSession } from "@/lib/demo-session";
import { isDevAuthBypass } from "@/utils/auth";

export default async function DemoPage() {
  const { userId } = await auth();

  if (userId || isDevAuthBypass()) {
    redirect("/dashboard");
  }

  const demoSession = await resolveDemoSession();
  if (!demoSession) {
    redirect("/");
  }

  return null;
}
