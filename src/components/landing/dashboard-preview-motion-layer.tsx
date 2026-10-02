"use client";

import { Ellipsis } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import PriorityIndicator from "@/app/dashboard/components/task/priority-indicator";
import columnStatusOptions from "@/app/dashboard/data/column-status-options";

export function DashboardPreviewOrbit() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="border-primary/12 pointer-events-none absolute -inset-x-[12%] -inset-y-[14%] z-0 rounded-[50%] border [mask-image:linear-gradient(to_right,transparent,black_16%,black_84%,transparent)] opacity-70"
      animate={shouldReduceMotion ? undefined : { rotate: [0, 1.5, 0] }}
      transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden="true"
    />
  );
}

function OrbitalTrails({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <svg
      className="pointer-events-none absolute -inset-x-[9%] -inset-y-[18%] z-0 h-[136%] w-[118%] opacity-60"
      viewBox="0 0 1000 500"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="kanbamy-trail-warm" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="transparent" />
          <stop offset="0.45" stopColor="var(--primary)" stopOpacity="0.45" />
          <stop offset="1" stopColor="transparent" />
        </linearGradient>
        <linearGradient id="kanbamy-trail-cool" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="transparent" />
          <stop offset="0.5" stopColor="var(--secondary)" stopOpacity="0.4" />
          <stop offset="1" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        id="kanbamy-trail-top"
        d="M90 245C150 65 390 35 560 66C760 102 875 160 925 250"
        stroke="url(#kanbamy-trail-warm)"
        strokeDasharray="190 90 70 160"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        id="kanbamy-trail-bottom"
        d="M70 285C180 470 430 480 620 434C790 394 895 330 940 230"
        stroke="url(#kanbamy-trail-cool)"
        strokeDasharray="160 110 90 180"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        id="kanbamy-trail-side"
        d="M150 105C45 180 55 325 175 390C315 466 535 420 700 350C835 292 870 175 760 104"
        stroke="url(#kanbamy-trail-warm)"
        strokeDasharray="120 150 80 180"
        strokeLinecap="round"
        strokeWidth="1.25"
      />
      {reducedMotion ? (
        <>
          <circle cx="240" cy="80" r="3" fill="var(--primary)" opacity="0.55" />
          <circle
            cx="790"
            cy="382"
            r="3"
            fill="var(--secondary)"
            opacity="0.5"
          />
          <circle
            cx="145"
            cy="300"
            r="2.5"
            fill="var(--primary)"
            opacity="0.45"
          />
        </>
      ) : (
        <>
          <circle r="3" fill="var(--primary)" opacity="0.75">
            <animateMotion
              dur="17s"
              repeatCount="indefinite"
              path="M90 245C150 65 390 35 560 66C760 102 875 160 925 250"
            />
          </circle>
          <circle r="3" fill="var(--secondary)" opacity="0.7">
            <animateMotion
              dur="21s"
              begin="-8s"
              repeatCount="indefinite"
              path="M70 285C180 470 430 480 620 434C790 394 895 330 940 230"
            />
          </circle>
          <circle r="2.5" fill="var(--primary)" opacity="0.65">
            <animateMotion
              dur="14s"
              begin="-4s"
              repeatCount="indefinite"
              path="M150 105C45 180 55 325 175 390C315 466 535 420 700 350C835 292 870 175 760 104"
            />
          </circle>
        </>
      )}
    </svg>
  );
}

export function DashboardPreviewAtmosphere() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <OrbitalTrails reducedMotion={Boolean(shouldReduceMotion)} />
      <motion.div
        className="bg-primary/20 pointer-events-none absolute -top-5 right-[7%] z-0 size-16 rounded-full blur-2xl sm:size-20"
        animate={
          shouldReduceMotion
            ? undefined
            : { y: [0, -8, 0], opacity: [0.35, 0.55, 0.35] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      <motion.div
        className="bg-secondary/15 pointer-events-none absolute -bottom-3 left-[9%] z-0 size-12 rounded-full blur-xl sm:size-16"
        animate={
          shouldReduceMotion
            ? undefined
            : { y: [0, 6, 0], opacity: [0.2, 0.38, 0.2] }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
        aria-hidden="true"
      />
    </>
  );
}

function FloatingTaskCard({
  title,
  status,
  priority,
  side,
  rotate,
  delay,
}: {
  title: string;
  status: "To Do" | "In Progress" | "Done";
  priority: string;
  side: "left-top" | "right-top" | "right-bottom";
  rotate: number;
  delay: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const option = columnStatusOptions[status];
  const StatusIcon = option.icon;

  const position = {
    "left-top": "-left-48 top-[15%]",
    "right-top": "-right-56 top-[7%]",
    "right-bottom": "-right-48 bottom-[7%]",
  }[side];

  return (
    <motion.div
      className={`border-border/70 bg-card/95 pointer-events-auto absolute z-20 hidden w-56 cursor-default rounded-xl border p-3.5 text-left shadow-[0_18px_38px_-18px_rgba(0,0,0,0.78)] xl:block ${position}`}
      style={{ rotate }}
      animate={
        shouldReduceMotion
          ? undefined
          : { y: [0, -5, 0], opacity: [0.82, 1, 0.82] }
      }
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              scale: 1.05,
              y: -6,
              rotate: rotate + (side === "left-top" ? 3 : -3),
              transition: { duration: 0.25, ease: "easeOut" },
            }
      }
      aria-hidden="true"
    >
      <div className="flex items-start gap-2">
        <StatusIcon className="mt-0.5 size-3.5 shrink-0" color={option.color} />
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>
        <Ellipsis className="text-muted-foreground size-3.5 shrink-0" />
      </div>
      <div className="text-muted-foreground mt-3 flex items-center justify-between gap-2 text-[0.6875rem]">
        <span>{status}</span>
        <PriorityIndicator priority={priority} />
      </div>
    </motion.div>
  );
}

export function DashboardPreviewFloatingElements() {
  const shouldReduceMotion = useReducedMotion();
  const floatingStatus = columnStatusOptions["In Progress"];
  const FloatingStatusIcon = floatingStatus.icon;

  return (
    <>
      <FloatingTaskCard
        title="Write release notes"
        status="To Do"
        priority="low"
        side="left-top"
        rotate={-6}
        delay={0.2}
      />
      <FloatingTaskCard
        title="Polish task interactions"
        status="In Progress"
        priority="high"
        side="right-top"
        rotate={5}
        delay={1.1}
      />
      <FloatingTaskCard
        title="Create first board"
        status="Done"
        priority="medium"
        side="right-bottom"
        rotate={5}
        delay={2}
      />
      <motion.div
        className="border-border/70 bg-background text-foreground pointer-events-none absolute top-[31%] -right-3 z-10 hidden items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium shadow-lg lg:flex"
        animate={shouldReduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <FloatingStatusIcon className="size-3.5" color={floatingStatus.color} />
        In Progress
      </motion.div>
    </>
  );
}
