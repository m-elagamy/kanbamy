import { Suspense } from "react";
import { getOptionalDashboardUser } from "@/lib/auth";
import Hero, { LandingCtaFallback } from "./hero";
import Features from "./features";
import HowItWorks from "./how-it-works";
import Cta, { CtaActionButtons } from "./cta";

async function CtaSectionActions() {
  const user = await getOptionalDashboardUser();
  return <CtaActionButtons isSignedIn={Boolean(user)} />;
}

const Landing = ({ isSignedIn }: { isSignedIn?: boolean }) => {
  return (
    <div className="container">
      <Hero isSignedIn={isSignedIn} />
      <HowItWorks />
      <Features />
      <Cta
        isSignedIn={isSignedIn}
        actions={
          isSignedIn === undefined ? (
            <Suspense fallback={<LandingCtaFallback />}>
              <CtaSectionActions />
            </Suspense>
          ) : undefined
        }
      />
    </div>
  );
};

export default Landing;
