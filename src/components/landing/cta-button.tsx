"use client";

import { VariantProps } from "class-variance-authority";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  LayoutDashboard,
  LoaderCircle,
  MousePointer2,
  Play,
  Zap,
} from "lucide-react";
import { AUTH_ROUTES } from "@/lib/constants";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

interface CtaButtonProps {
  variant?: "primary" | "secondary" | "demo" | "cta-section";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
  icon?:
    | "arrow"
    | "arrow-up-right"
    | "layout-dashboard"
    | "zap"
    | "mouse"
    | "none";
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
  effect?: VariantProps<typeof buttonVariants>["effect"];
  isSignedIn: boolean;
}

const variantConfig: Record<
  "primary" | "secondary" | "demo" | "cta-section",
  {
    href: string;
    label: string;
    icon:
      | "arrow"
      | "arrow-up-right"
      | "layout-dashboard"
      | "zap"
      | "mouse"
      | "play"
      | "none";
    buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
    effect?: VariantProps<typeof buttonVariants>["effect"];
    className?: string;
  }
> = {
  primary: {
    href: AUTH_ROUTES.SIGN_UP,
    label: "Get Started",
    icon: "arrow",
  },
  secondary: {
    href: AUTH_ROUTES.SIGN_IN,
    label: "Sign In",
    icon: "arrow",
    buttonVariant: "outline",
  },
  demo: {
    href: "/demo/enter",
    label: "Try Kanbamy",
    icon: "arrow-up-right",
    buttonVariant: "secondary",
    effect: "ringHover",
    className:
      "border border-primary/20 bg-secondary text-foreground transition-all duration-300 hover:-translate-y-px hover:border-primary/40 hover:bg-secondary/80 motion-reduce:transform-none motion-reduce:transition-none",
  },
  "cta-section": {
    href: AUTH_ROUTES.SIGN_UP,
    label: "Start for free",
    icon: "play",
  },
};

export default function CtaButton({
  variant = "primary",
  size = "default",
  className,
  showIcon = true,
  icon,
  buttonVariant,
  effect,
  isSignedIn,
}: CtaButtonProps) {
  const config = variantConfig[variant];
  const href = isSignedIn ? "/dashboard" : config.href;
  const label = isSignedIn ? "Go to dashboard" : config.label;
  const displayIcon =
    icon ??
    (isSignedIn && variant === "cta-section"
      ? "layout-dashboard"
      : config.icon);
  const finalButtonVariant = buttonVariant ?? config.buttonVariant ?? "default";
  const finalEffect =
    effect ??
    config.effect ??
    (variant === "cta-section" ? "shine" : undefined);
  const [isDemoPending, setIsDemoPending] = useState(false);

  const IconComponent =
    displayIcon === "arrow"
      ? ArrowRight
      : displayIcon === "arrow-up-right"
        ? ArrowUpRight
        : displayIcon === "layout-dashboard"
          ? LayoutDashboard
          : displayIcon === "zap"
            ? Zap
            : displayIcon === "mouse"
              ? MousePointer2
              : displayIcon === "play"
                ? Play
                : null;
  const DemoIcon = isDemoPending ? LoaderCircle : IconComponent;

  const iconClassName =
    displayIcon === "play"
      ? "!size-3.5 shrink-0 stroke-[1.75] transition-transform duration-300 group-hover:scale-105"
      : displayIcon === "mouse"
      ? "size-4 transition-transform duration-300 group-hover:translate-x-px group-hover:translate-y-px group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
      : "transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-105";
  const iconBeforeLabel = displayIcon === "layout-dashboard";
  const isPrimary = variant === "cta-section" || variant === "primary";
  const shadowClasses = isPrimary
    ? "shadow-primary/10 hover:shadow-primary/20 shadow-lg transition-all duration-300 hover:shadow-xl"
    : "transition-all duration-300";

  return (
    <Button
      variant={finalButtonVariant}
      effect={finalEffect}
      className={cn("group", shadowClasses, config.className, className)}
      size={size}
      asChild
    >
      <Link
        href={href}
        prefetch={false}
        aria-disabled={variant === "demo" && isDemoPending}
        aria-busy={variant === "demo" && isDemoPending}
        onClick={(event) => {
          if (variant !== "demo" || isSignedIn) return;

          if (isDemoPending) {
            event.preventDefault();
            return;
          }

          setIsDemoPending(true);
        }}
      >
        <span className="relative z-10 flex items-center gap-2 font-semibold">
          {showIcon && iconBeforeLabel && IconComponent && (
            <IconComponent className={iconClassName} />
          )}
          {label}
          {showIcon && !iconBeforeLabel && DemoIcon && (
            <DemoIcon
              className={cn(
                iconClassName,
                isDemoPending &&
                  "animate-spin motion-reduce:animate-none",
              )}
              aria-hidden="true"
            />
          )}
        </span>
      </Link>
    </Button>
  );
}
