import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";
import { isUserAuthenticated } from "@/lib/auth";
import Hero from "./hero";
import Features from "./features";
import HowItWorks from "./how-it-works";
import Cta, { CtaSectionButtons } from "./cta";

export default function Landing() {
  return (
    <div className="container">
      <Hero />
      <HowItWorks />
      <Features />
      <Cta>
        <Suspense fallback={<CtaActionsSkeleton />}>
          <CtaSectionActions />
        </Suspense>
      </Cta>
    </div>
  );
}

async function CtaSectionActions() {
  const isSignedIn = await isUserAuthenticated();

  return <CtaSectionButtons isSignedIn={isSignedIn} />;
}

function CtaActionsSkeleton() {
  return <Skeleton className="h-10 w-44 rounded-md" aria-hidden="true" />;
}
