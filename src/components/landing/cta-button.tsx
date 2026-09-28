"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { AUTH_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";

interface CtaButtonProps {
  variant?: "primary" | "secondary" | "cta-section";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
  icon?: "arrow" | "zap" | "none";
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
  effect?: VariantProps<typeof buttonVariants>["effect"];
  isSignedIn: boolean;
}

const variantConfig: Record<
  "primary" | "secondary" | "cta-section",
  {
    href: string;
    label: string;
    icon: "arrow" | "zap" | "none";
    buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
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
  const finalEffect = effect ?? (variant === "cta-section" ? "shine" : undefined);

  const IconComponent =
    displayIcon === "arrow" ? ArrowRight : displayIcon === "zap" ? Zap : null;

  const isPrimary = variant === "cta-section" || variant === "primary";
  const shadowClasses = isPrimary
    ? "shadow-primary/10 hover:shadow-primary/20 shadow-lg transition-all duration-300 hover:shadow-xl"
    : "transition-all duration-300";

  return (
    <Button
      variant={finalButtonVariant}
      effect={finalEffect}
      className={cn("group", shadowClasses, className)}
      size={size}
      asChild
    >
      <Link href={href} prefetch={false}>
        <span className="relative z-10 flex items-center gap-2 font-semibold">
          {label}
          {showIcon && IconComponent && (
            <IconComponent className="transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-105" />
          )}
        </span>
      </Link>
    </Button>
  );
}
