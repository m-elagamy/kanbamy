"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

interface ThemeSwitcherProps {
  size?: "sm" | "md";
}

export function ThemeSwitcher({ size = "md" }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  const currentTheme = theme || "system";
  const activeIndex = themes.findIndex((t) => t.value === currentTheme);

  const isSm = size === "sm";

  return (
    <div
      className={cn(
        "border-border/50 bg-muted/30 relative inline-flex items-center border",
        isSm ? "gap-0.5 rounded-md p-0.5" : "gap-1 rounded-lg p-1",
      )}
    >
      {/* Animated background indicator */}
      <motion.div
        className="bg-primary/10 absolute rounded-sm"
        initial={false}
        animate={{
          x: `calc(${activeIndex} * (${isSm ? "1.5rem + 0.125rem" : "2rem + 0.25rem"}))`,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        style={{
          width: isSm ? "1.5rem" : "2rem",
          height: isSm ? "1.5rem" : "2rem",
        }}
      />

      {themes.map(({ icon: Icon, value, label }) => {
        const isActive = currentTheme === value;
        return (
          <button
            key={value}
            onClick={() => {
              setTheme(value);
            }}
            className={cn(
              "relative z-10 flex items-center justify-center rounded-sm transition-all duration-200",
              isSm ? "size-6" : "size-8",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-primary",
            )}
            aria-label={label}
            aria-pressed={isActive}
          >
            <motion.div
              animate={{
                scale: isActive ? 1.15 : 1,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17,
              }}
            >
              <Icon className={isSm ? "h-3 w-3" : "h-4 w-4"} />
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}
