"use client";

import { VariantProps } from "class-variance-authority";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MousePointer2, Play, Zap } from "lucide-react";
import { AUTH_ROUTES } from "@/lib/constants";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

interface CtaButtonProps {
  variant?: "primary" | "secondary" | "demo" | "cta-section";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
  icon?: "arrow" | "arrow-up-right" | "play" | "zap" | "mouse" | "none";
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
  effect?: VariantProps<typeof buttonVariants>["effect"];
  isSignedIn: boolean;
}

const variantConfig: Record<
  "primary" | "secondary" | "demo" | "cta-section",
  {
    href: string;
    label: string;
    icon: "arrow" | "arrow-up-right" | "play" | "zap" | "mouse" | "none";
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
    icon: "mouse",
    buttonVariant: "secondary",
    effect: "ringHover",
    className:
      "border border-primary/20 bg-secondary text-foreground transition-all duration-300 hover:-translate-y-px hover:border-primary/40 hover:bg-secondary/80 motion-reduce:transform-none motion-reduce:transition-none",
  },
  "cta-section": {
    href: AUTH_ROUTES.SIGN_UP,
    label: "Start for free",
    icon: "zap",
  },
};

export default function CtaButton({
  variant = "primary",
  size = "lg",
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
  const displayIcon = icon ?? config.icon;
  const finalButtonVariant = buttonVariant ?? config.buttonVariant ?? "default";
  const finalEffect =
    effect ??
    config.effect ??
    (variant === "cta-section" ? "shine" : undefined);

  const IconComponent =
    displayIcon === "arrow"
      ? ArrowRight
      : displayIcon === "arrow-up-right"
        ? ArrowUpRight
        : displayIcon === "play"
          ? Play
          : displayIcon === "zap"
            ? Zap
            : displayIcon === "mouse"
              ? MousePointer2
              : null;

  const iconBeforeLabel = displayIcon === "play" || displayIcon === "zap";

  const iconClassName =
    displayIcon === "play" || displayIcon === "zap"
      ? "fill-current transition-transform duration-300 group-hover:scale-105"
      : displayIcon === "mouse"
        ? "size-4 transition-transform duration-300 group-hover:translate-x-px group-hover:translate-y-px group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
        : "transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-105";
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
      <Link href={href} prefetch={false}>
        <span className="relative z-10 flex items-center gap-2 font-semibold">
          {showIcon && iconBeforeLabel && IconComponent && (
            <IconComponent className={iconClassName} />
          )}
          {label}
          {showIcon && !iconBeforeLabel && IconComponent && (
            <IconComponent className={iconClassName} />
          )}
        </span>
      </Link>
    </Button>
  );
}
