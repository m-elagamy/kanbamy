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

const logoSizeStyles = {
  default: {
    icon: "size-7 sm:size-8",
    text: "text-base sm:text-lg md:text-xl",
  },
  compact: {
    icon: "size-7 sm:size-8",
    text: "text-base sm:text-lg md:text-xl",
  },
} as const;

const KanbanLogo = ({
  glow = "subtle",
  size = "default",
  className = "mx-0",
}: KanbanLogoProps) => {
  const sizeStyles = logoSizeStyles[size];

  return (
    <div className={`${className} relative w-fit`} data-logo-size={size}>
      <Link
        href="/"
        className="relative z-10 flex items-center gap-1"
        aria-label="Go to Kanbamy homepage"
      >
        <span
          aria-hidden="true"
          className={`${sizeStyles.icon} shrink-0 bg-(--brand)`}
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
          className={`${sizeStyles.text} font-bold tracking-tight text-gradient`}
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
