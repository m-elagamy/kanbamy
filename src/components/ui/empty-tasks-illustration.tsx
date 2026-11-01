import { cn } from "@/lib/utils";

export default function EmptyTasksIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 72 52"
      className={cn("h-13 w-18", className)}
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="36"
        cy="44"
        rx="27"
        ry="5"
        className="fill-muted-foreground/10"
      />
      <path
        d="M18 27 24.5 11.5A4 4 0 0 1 28.2 9h15.6a4 4 0 0 1 3.7 2.5L54 27"
        className="fill-background stroke-border"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 25h14.2c1 0 1.9.6 2.3 1.5l.8 1.9c.4.9 1.3 1.5 2.3 1.5h4.8c1 0 1.9-.6 2.3-1.5l.8-1.9c.4-.9 1.3-1.5 2.3-1.5H58v13.5a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V25Z"
        className="fill-muted/70 stroke-border"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M29 16.5h14M27.5 21h17"
        className="stroke-muted-foreground/30"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
