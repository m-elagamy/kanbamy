import { Badge } from "../ui/badge";
import FloatingParticlesWrapper from "./floating-particles-wrapper";
import DashboardPreview from "./dashboard-preview";
import { Tilt } from "../ui/tilt";
import CtaButton from "./cta-button";

export default function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <div className="my-20 grid min-h-96 text-center md:mt-40 md:-translate-y-10 lg:-translate-y-12">
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
        <FloatingParticlesWrapper />
        <h1 className="text-gradient mb-6 text-4xl font-extrabold tracking-tighter md:text-5xl lg:text-6xl">
          Turn plans into progress.
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-base leading-relaxed md:text-lg">
          Organize personal work, prioritize tasks, and move projects forward from
          start to done.
        </p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <CtaButton
            variant="cta-section"
            isSignedIn={isSignedIn}
            icon={isSignedIn ? "zap" : "play"}
            className="mx-auto h-10 w-fit rounded-full px-4"
          />
          {!isSignedIn && (
            <CtaButton
              variant="demo"
              isSignedIn={false}
              icon="arrow-up-right"
              className="h-10 rounded-full px-4"
            />
          )}
        </div>
      </div>
      <div className="mt-8 md:mt-12">
        <Tilt rotationFactor={2} isRevese>
          <DashboardPreview />
        </Tilt>
      </div>
    </div>
  );
}
