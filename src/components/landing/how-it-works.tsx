"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Ellipsis, Flag, Plus } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import columnStatusOptions from "@/app/dashboard/data/column-status-options";
import HowItWorksBackground from "./how-it-works-background";

const steps = [
  ["01", "Start with a board", "Give your work a place to live."],
  ["02", "Turn ideas into tasks", "Capture what needs doing while it’s fresh."],
  ["03", "Keep work moving", "See progress happen, one task at a time."],
] as const;

const priorityStyles: Record<string, { card: string; icon: string }> = {
  High: {
    card: "border-s-2 border-s-destructive/70",
    icon: "text-destructive/75",
  },
  Medium: {
    card: "border-s-2 border-s-amber-500/60",
    icon: "text-amber-500/75",
  },
  Low: {
    card: "border-s-2 border-s-sky-400/55",
    icon: "text-sky-400/75",
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
          <span className="truncate text-[11px] font-semibold sm:text-xs">
            {status}
          </span>
          <span className="border-border text-muted-foreground rounded px-1 py-0.5 text-[9px]">
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
  };

  return (
    <motion.div
      layout
      variants={taskVariants}
      className={`border-border/80 bg-card rounded-lg border px-3 py-2 text-left shadow-xs ${taskPriorityStyles.card}`}
    >
      <div className="flex items-start gap-2">
        {complete && (
          <span className="bg-secondary/15 text-secondary mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full">
            <Check className="size-2.5" strokeWidth={3} />
          </span>
        )}
        <p className="min-w-0 flex-1 truncate text-[11px] font-medium sm:text-xs">
          {title}
        </p>
        <Ellipsis
          className="text-muted-foreground size-3 shrink-0"
          aria-hidden="true"
        />
      </div>
      <div className="text-muted-foreground mt-2 flex items-center justify-between text-[9px]">
        <span>{complete ? "Done" : "Today"}</span>
        <span className="inline-flex items-center gap-1">
          <Flag
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

  return (
    <div
      className="border-border/70 bg-muted/10 flex min-h-[34rem] flex-col overflow-hidden rounded-2xl border p-4 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.65)] sm:p-5 lg:min-h-[38rem] lg:p-6"
      role="img"
      aria-label="Kanbamy workflow demonstration"
    >
      <div className="border-border/60 bg-background/70 mb-3 flex items-center justify-between rounded-lg border px-3 py-2.5 sm:mb-4 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
                <span className="bg-white text-primary text-soft-shadow dark:bg-primary/10 ring-primary/15 flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold ring-1">
            W
          </span>
          <div className="min-w-0 text-left">
            <p className="truncate text-xs font-semibold sm:text-sm">
              Website Launch
            </p>
            <p className="text-muted-foreground hidden text-[10px] sm:block">
              {activeStep === 0
                ? "A focused space for your next project"
                : "Plan, build, and ship the next release"}
            </p>
          </div>
        </div>
        {activeStep === 0 ? (
          <span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium">
            <Plus className="size-3" aria-hidden="true" /> Create board
          </span>
        ) : activeStep === 1 ? (
          <span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium">
            <Plus className="size-3" aria-hidden="true" /> Add task
          </span>
        ) : null}
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
                  <p className="text-[11px] font-medium sm:text-xs">
                    Polish landing page
                  </p>
                  <span className="text-muted-foreground mt-2 block text-[9px]">
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
      className="relative isolate scroll-mt-20 py-20 md:py-24"
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
                onClick={() => {
                  setResumeAt(Date.now() + 15_000);
                  setActiveStep(index);
                }}
                className={`group relative flex w-full items-start gap-4 rounded-lg px-3 py-3 text-left transition-colors ${activeStep === index ? "bg-muted/50" : "hover:bg-muted/25"}`}
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
