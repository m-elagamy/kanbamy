import { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type RequiredIndicatorProps = ComponentPropsWithoutRef<"span">;

export function RequiredIndicator({
  className,
  children = "*",
  ...props
}: RequiredIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      title="Required field"
      className={cn("text-destructive select-none", className)}
      {...props}
    >
      {children}
    </span>
  );
}

export default RequiredIndicator;
