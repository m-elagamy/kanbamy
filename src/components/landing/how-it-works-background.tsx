"use client";

import { motion, useReducedMotion } from "motion/react";

export default function HowItWorksBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-[calc(50%-50vw)] right-[calc(50%-50vw)] z-0 hidden overflow-hidden sm:block"
      aria-hidden="true"
    >
      <div className="from-background/80 via-background/60 to-background/80 absolute inset-0 bg-gradient-to-br" />

      <motion.div
        className="absolute inset-0 opacity-20 mask-[radial-gradient(ellipse_at_center,black_42%,transparent_100%)]"
        animate={!shouldReduceMotion ? { opacity: [0.2, 0.4, 0.2] } : undefined}
        transition={
          !shouldReduceMotion
            ? { repeat: Infinity, duration: 8, ease: "easeInOut" }
            : undefined
        }
      >
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:3rem_3rem] sm:[background-size:5rem_5rem] lg:[background-size:6rem_6rem]" />
      </motion.div>

      {[...Array(8)].map((_, index) => (
        <motion.span
          key={index}
          className="from-primary/30 to-primary/10 absolute size-2 rounded-full bg-gradient-to-r"
          style={{
            left: `${10 + ((index * 12) % 80)}%`,
            top: `${15 + ((index * 18) % 70)}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            !shouldReduceMotion
              ? { y: [0, -10, 0], opacity: [0.25, 0.55, 0.25], scale: [1, 1.1, 1] }
              : undefined
          }
          transition={
            !shouldReduceMotion
              ? {
                  repeat: Infinity,
                  duration: 4 + index * 0.5,
                  ease: "easeInOut",
                  delay: index * 0.2,
                }
              : undefined
          }
        >
          <div className="bg-primary/10 absolute inset-0 rounded-full blur-sm" />
        </motion.span>
      ))}

      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {[
          "M 20 25 Q 40 15 60 25 T 80 25",
          "M 15 45 Q 35 35 55 45 T 85 45",
          "M 25 65 Q 45 55 65 65 T 75 65",
        ].map((path, index) => (
          <motion.path
            key={path}
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.05"
            className="text-primary/15"
            animate={!shouldReduceMotion ? { opacity: [0.1, 0.3, 0.1] } : undefined}
            transition={
              !shouldReduceMotion
                ? { repeat: Infinity, duration: 6, ease: "easeInOut", delay: index }
                : undefined
            }
          />
        ))}
      </svg>

      <div className="bg-radial-gradient from-primary/5 absolute inset-0 via-transparent to-transparent" />
    </div>
  );
}
