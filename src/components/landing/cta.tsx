"use client";

import { motion, useReducedMotion } from "motion/react";
import { fadeIn, gridVariants } from "@/utils/motion-variants";
import { Spotlight } from "../ui/spotlight";
import CtaButton from "./cta-button";

export default function Cta({ isSignedIn }: { isSignedIn: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-background border-border/50 shadow-primary/5 relative my-20 overflow-hidden rounded-2xl border p-12 md:p-16">
      <Spotlight />
      <motion.div
        className="absolute inset-0"
        variants={shouldReduceMotion ? undefined : gridVariants}
        animate={!shouldReduceMotion ? "animate" : undefined}
      >
        <div className="absolute inset-0 -z-10 h-full bg-[linear-gradient(to_right,rgba(229,229,229,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(229,229,229,0.5)_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_70%_at_50%_0%,#000_60%,transparent_110%)] bg-size-[3rem_3rem] dark:bg-[linear-gradient(to_right,rgba(55,55,55,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(55,55,55,0.5)_1px,transparent_1px)]" />
      </motion.div>
      <div className="bg-primary/50 absolute inset-x-0 top-0 mx-auto h-1/12 w-1/3 blur-[8rem]" />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        variants={shouldReduceMotion ? undefined : fadeIn}
        initial="initial"
        animate="animate"
      >
        {/* Logo/Icon */}
        <div className="mb-8 flex items-center justify-center">
          <div className="bg-[#f0f0f0] shadow-primary/20 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform duration-300 hover:scale-110 sm:size-16">
            <span
              aria-hidden="true"
              className="bg-[#d87943] size-7 sm:size-8"
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
          </div>
        </div>

        <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          <span className="text-foreground">Ready to turn plans into </span>
          <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            progress?
          </span>
        </h2>

        <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-base leading-relaxed md:text-lg">
          Create your first board and start moving work forward in minutes.
        </p>

        <motion.div
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <CtaButton
              variant="cta-section"
              isSignedIn={isSignedIn}
            />
          </motion.div>
          {!isSignedIn && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <CtaButton
                variant="demo"
                isSignedIn={false}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
