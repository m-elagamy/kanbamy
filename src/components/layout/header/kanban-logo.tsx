import Link from "next/link";

type KanbanLogoProps = {
  glow?: "subtle" | "prominent" | "auth" | "none";
  size?: "default" | "compact";
  className?: string;
};

const glowStyles = {
  subtle: "h-24 w-56 rounded-[50%] bg-primary/20 dark:bg-primary/30",
  prominent: "h-24 w-56 rounded-[50%] bg-primary/20 dark:bg-primary/30",
  auth: "h-24 w-56 rounded-[50%] bg-primary/15 dark:bg-primary/22",
  none: "hidden",
} as const;

const KanbanLogo = ({
  glow = "subtle",
  size = "default",
  className = "mx-0",
}: KanbanLogoProps) => {
  return (
    <div className={`${className} relative w-fit`}>
      <Link
        href="/"
        className="relative z-10 flex items-center gap-1"
        aria-label="Go to Kanbamy homepage"
      >
        <span
          aria-hidden="true"
          className={`${size === "compact" ? "size-8" : "size-9.5"} shrink-0 bg-[#d87943]`}
          style={{
            WebkitMaskImage: "url('/brand/kanbamy.webp')",
            maskImage: "url('/brand/kanbamy.webp')",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />

        <span
          className={`${size === "compact" ? "text-lg md:text-xl" : "text-xl md:text-2xl"} text-gradient font-bold tracking-tight`}
        >
          Kanbamy
        </span>
      </Link>

      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div className={`${glowStyles[glow]} blur-3xl`} />
      </div>
    </div>
  );
};

export default KanbanLogo;
