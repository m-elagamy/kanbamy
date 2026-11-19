import { Suspense } from "react";
import { Zap } from "lucide-react";
import { isUserAuthenticated } from "@/lib/auth";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import FloatingParticlesWrapper from "./floating-particles-wrapper";
import DashboardPreview from "./dashboard-preview";
import { Tilt } from "../ui/tilt";
import CtaButton from "./cta-button";

export default function Hero() {
  return (
    <div className="my-20 grid min-w-0 grid-cols-[minmax(0,1fr)] min-h-96 text-center md:mt-40 md:-translate-y-10 lg:-translate-y-12">
      <div className="mb-4 flex items-center justify-center">
        <Badge
          variant="outline"
          className="border-primary/20 bg-primary/5"
          icon={
            <span className="relative flex h-2 w-2">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
            </span>
          }
        >
          Introducing Kanbamy
        </Badge>
      </div>
      <div className="relative">
        <div className="hidden sm:block">
          <FloatingParticlesWrapper />
        </div>
        <h1 className="text-gradient mb-6 text-4xl font-extrabold tracking-tighter md:text-5xl lg:text-6xl">
          Turn plans into progress.
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-base leading-relaxed md:text-lg">
          Organize personal work, prioritize tasks, and move projects forward from
          start to done.
        </p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Suspense fallback={<HeroCtaSkeleton />}>
          <HeroCtaActions />
        </Suspense>
      </div>
      <div className="mt-8 md:mt-12">
        <Tilt rotationFactor={2} isRevese>
          <DashboardPreview />
        </Tilt>
      </div>
    </div>
  );
}

async function HeroCtaActions() {
  const isSignedIn = await isUserAuthenticated();

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <CtaButton
        variant="cta-section"
        size="lg"
        isSignedIn={isSignedIn}
        effect="shine"
        className="mx-auto w-fit"
      />
      {!isSignedIn && (
        <div className="relative flex flex-col items-center gap-2">
          <CtaButton variant="demo" size="lg" isSignedIn={false} />
          <span className="text-muted-foreground flex items-center gap-1 text-xs leading-4 whitespace-nowrap sm:absolute sm:top-full sm:mt-2">
            <Zap
              aria-hidden="true"
              className="size-3.5 shrink-0 stroke-[1.75]"
            />
            No sign-up required
          </span>
        </div>
      )}
    </div>
  );
}

function HeroCtaSkeleton() {
  return <Skeleton className="h-10 w-44 rounded-md" aria-hidden="true" />;
}
