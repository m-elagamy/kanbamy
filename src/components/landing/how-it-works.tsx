"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, ChevronUp, Ellipsis, Minus, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import columnStatusOptions from "@/components/workspace/data/column-status-options";
import { getBoardIdentity } from "@/lib/utils/board-identity";
import HowItWorksBackground from "./how-it-works-background";

const steps = [
  ["01", "Start with a board", "Give your work a place to live."],
  ["02", "Turn ideas into tasks", "Capture what needs doing while it’s fresh."],
  ["03", "Keep work moving", "See progress happen, one task at a time."],
] as const;

const priorityStyles: Record<
  string,
  { card: string; icon: string; Icon: LucideIcon }
> = {
  High: {
    card: "border-s-2 border-s-destructive/70",
    icon: "text-destructive/75",
    Icon: ChevronUp,
  },
  Medium: {
    card: "border-s-2 border-s-amber-500/60",
    icon: "text-amber-500/75",
    Icon: Minus,
  },
  Low: {
    card: "border-s-2 border-s-sky-400/55",
    icon: "text-sky-400/75",
    Icon: ChevronDown,
  },
};

const taskListVariants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.1,
    },
  },
};

const taskVariants = {
  hidden: { opacity: 0, y: 5 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: "easeOut" as const },
  },
};

const columnListVariants = {
  hidden: { opacity: 0, y: 5 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      delayChildren: 0.04,
      duration: 0.3,
      ease: "easeOut" as const,
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -5 },
};

const columnVariants = {
  hidden: { opacity: 0, y: 5 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" as const },
  },
};

function Column({
  status,
  count,
  children,
}: {
  status: "To Do" | "In Progress" | "Done";
  count: number;
  children?: ReactNode;
}) {
  const option = columnStatusOptions[status];
  const Icon = option.icon;
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={columnVariants}
      className="border-border/70 bg-background/65 min-w-0 overflow-hidden rounded-lg border"
    >
      <div className="border-border/60 bg-muted/30 dark:bg-muted/20 flex items-center justify-between border-b p-4 pb-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <Icon
            className="size-3.5 shrink-0"
            color={option.color}
            aria-hidden="true"
          />
          <span className="truncate text-[0.6875rem] font-semibold sm:text-xs">
            {status}
          </span>
          <span className="border-border text-muted-foreground rounded px-1 py-0.5 text-[0.5625rem]">
            {count}
          </span>
        </div>
        <Ellipsis
          className="text-muted-foreground size-3.5"
          aria-hidden="true"
        />
      </div>
      <motion.div
        className="min-h-20 flex-1 space-y-2.5 p-3 sm:min-h-56 sm:p-4"
        variants={taskListVariants}
        initial={reduced ? "show" : "hidden"}
        animate="show"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Task({
  title,
  priority = "Medium",
  complete = false,
}: {
  title: string;
  priority?: string;
  complete?: boolean;
}) {
  const taskPriorityStyles = priorityStyles[priority] ?? {
    card: "border-s-2 border-s-border/70",
    icon: "text-muted-foreground",
    Icon: Minus,
  };
  const PriorityIcon = taskPriorityStyles.Icon;

  return (
    <motion.div
      layout
      variants={taskVariants}
      className={`border-border/80 bg-card rounded-lg border px-3 py-2 text-left shadow-xs ${taskPriorityStyles.card}`}
    >
      <div className="flex items-start gap-2">
        {complete && (
          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
            <Check className="size-2.5" strokeWidth={3} />
          </span>
        )}
        <p className="min-w-0 flex-1 truncate text-[0.6875rem] font-medium sm:text-xs">
          {title}
        </p>
        <Ellipsis
          className="text-muted-foreground size-3 shrink-0"
          aria-hidden="true"
        />
      </div>
      <div className="text-muted-foreground mt-2 flex items-center justify-between text-[0.5625rem]">
        <span>{complete ? "Done" : "Today"}</span>
        <span className="inline-flex items-center gap-1">
          <PriorityIcon
            className={`${taskPriorityStyles.icon} size-2.5`}
            aria-hidden="true"
          />
          {priority}
        </span>
      </div>
    </motion.div>
  );
}

function Stage({ activeStep }: { activeStep: number }) {
  const reduced = useReducedMotion();
  const boardIdentity = getBoardIdentity("Website Launch", "website-launch");
  const stepBadgeLabel =
    activeStep === 0
      ? "New board"
      : activeStep === 1
        ? "Adding tasks"
        : "Moving to Done";

  return (
    <div
      className="border-border/70 bg-muted/10 flex min-h-[26rem] flex-col overflow-hidden rounded-2xl border p-4 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.65)] sm:min-h-[30rem] sm:p-5 lg:min-h-[34rem] lg:p-6"
      role="img"
      aria-label="Kanbamy workflow demonstration"
    >
      <div className="border-border/60 bg-background/70 mb-3 flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 sm:mb-4 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`${boardIdentity.className} flex size-7 shrink-0 items-center justify-center rounded-md text-xs leading-none font-semibold`}
            aria-hidden="true"
          >
            {boardIdentity.initial}
          </span>
          <div className="min-w-0 text-left">
            <p className="truncate text-xs font-semibold sm:text-sm">
              Website Launch
            </p>
            <p className="text-muted-foreground hidden text-[0.625rem] sm:block">
              {activeStep === 0
                ? "A focused space for your next project"
                : "Plan, build, and ship the next release"}
            </p>
          </div>
        </div>
        <span className="border-primary/20 bg-primary/10 text-[color-mix(in_oklch,var(--primary)_65%,black)] dark:text-primary inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-1 text-[0.625rem] font-medium">
          <span className="relative flex size-1.5 shrink-0" aria-hidden="true">
            {!reduced && (
              <span className="bg-primary/75 absolute inline-flex size-full animate-ping rounded-full" />
            )}
            <span className="bg-primary relative inline-flex size-1.5 rounded-full" />
          </span>
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={activeStep}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {stepBadgeLabel}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={activeStep}
          className="grid min-h-64 flex-1 grid-cols-1 gap-3 sm:grid-cols-3 sm:min-h-72 sm:gap-4"
          variants={columnListVariants}
          initial={reduced ? "show" : "hidden"}
          animate="show"
          exit={reduced ? undefined : "exit"}
        >
          {activeStep === 0 ? (
            <>
              <Column status="To Do" count={0} />
              <Column status="In Progress" count={0} />
              <Column status="Done" count={0} />
            </>
          ) : activeStep === 1 ? (
            <>
              <Column status="To Do" count={2}>
                <Task title="Polish landing page" priority="High" />
                <Task title="Review launch copy" priority="Low" />
              </Column>
              <Column status="In Progress" count={1}>
                <Task title="Prepare release notes" />
              </Column>
              <Column status="Done" count={1}>
                <Task title="Create project brief" complete priority="Low" />
              </Column>
            </>
          ) : (
            <>
              <Column status="To Do" count={1}>
                <Task title="Review launch copy" priority="Low" />
              </Column>
              <Column status="In Progress" count={1}>
                <motion.div
                  variants={taskVariants}
                  className="border-primary/30 bg-primary/5 relative overflow-hidden rounded-lg border border-dashed p-2.5 text-left"
                >
                  <p className="text-[0.6875rem] font-medium sm:text-xs">
                    Prepare release notes
                  </p>
                  <span className="text-muted-foreground mt-2 block text-[0.5625rem]">
                    Moving through the board
                  </span>
                  <motion.span
                    aria-hidden="true"
                    className="via-primary/60 absolute right-3 bottom-0 left-3 h-px bg-gradient-to-r from-transparent to-transparent"
                    animate={reduced ? undefined : { x: ["-100%", "100%"] }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : {
                            duration: 2.2,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }
                    }
                  />
                </motion.div>
              </Column>
              <Column status="Done" count={2}>
                <Task title="Polish landing page" complete priority="High" />
                <Task title="Create project brief" complete priority="Low" />
              </Column>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function HowItWorks() {
  const reduced = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  useEffect(() => {
    if (reduced || resumeAt !== null) return;
    const timer = window.setInterval(
      () => setActiveStep((step) => (step + 1) % steps.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [reduced, resumeAt]);
  useEffect(() => {
    if (resumeAt === null) return;
    const remaining = Math.max(0, resumeAt - Date.now());
    const timer = window.setTimeout(() => setResumeAt(null), remaining);
    return () => window.clearTimeout(timer);
  }, [resumeAt]);
  return (
    <section
      id="how-it-works"
      className="relative isolate scroll-mt-20 py-14 sm:py-16 md:py-24"
      aria-labelledby="how-it-works-title"
    >
      <HowItWorksBackground />
      <div className="relative z-10 grid items-start gap-10 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] lg:gap-16">
        <div className="max-w-md lg:sticky lg:top-28">
          <p className="text-muted-foreground mb-5 text-sm font-medium tracking-wide uppercase">
            How it works
          </p>
          <h2
            id="how-it-works-title"
            className="text-gradient text-3xl font-bold tracking-tighter text-balance md:text-4xl lg:text-5xl"
          >
            From idea to done.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-sm text-base leading-7">
            Turn what’s on your mind into clear, manageable progress.
          </p>
          <div className="mt-8 space-y-1">
            {steps.map(([number, title, description], index) => (
              <button
                key={number}
                type="button"
                aria-current={activeStep === index ? "step" : undefined}
                onClick={() => {
                  setResumeAt(Date.now() + 15_000);
                  setActiveStep(index);
                }}
                className={`group relative flex w-full cursor-pointer items-start gap-4 rounded-lg px-3 py-3 text-left transition-colors ${activeStep === index ? "bg-muted/50" : "hover:bg-muted/25"}`}
              >
                {activeStep === index && (
                  <motion.span
                    layoutId="how-it-works-active-step"
                    className="bg-primary absolute inset-y-3 left-0 w-0.5 rounded-full"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 32 }
                    }
                  />
                )}
                <span
                    className={`pt-0.5 text-xs font-semibold ${activeStep === index ? "text-foreground text-soft-shadow dark:text-primary" : "text-muted-foreground"}`}
                >
                  {number}
                </span>
                <span>
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <Stage activeStep={activeStep} />
      </div>
    </section>
  );
}
