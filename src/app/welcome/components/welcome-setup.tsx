"use client";

import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  ClipboardList,
  LoaderCircle,
  Plus,
  Sparkles,
} from "lucide-react";
import columnsTemplates from "@/app/dashboard/data/columns-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBoardCreation } from "@/hooks/use-board-creation";
import type { Templates } from "@/lib/types";
import { cn } from "@/lib/utils";
import { boardSchema } from "@/schemas/board";
import generateUUID from "@/utils/generate-UUID";

const setupOptions: Record<
  Templates,
  { label: string; description: string; title: string }
> = {
  personal: {
    label: "My tasks",
    description: "Make room for what matters each day.",
    title: "Personal Tasks",
  },
  agile: {
    label: "A development project",
    description: "Take work from backlog to delivery.",
    title: "My Project",
  },
  "bug-tracking": {
    label: "Bugs & issues",
    description: "Track issues from report to resolution.",
    title: "Bug Tracker",
  },
  custom: {
    label: "Start from scratch",
    description: "Choose your own columns as you go.",
    title: "My Board",
  },
};

export default function WelcomeSetup({
  firstName,
}: {
  firstName: string | null;
}) {
  const [selected, setSelected] = useState<Templates>("personal");
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string>();
  const shouldReduceMotion = useReducedMotion();
  const submitting = useRef(false);
  const {
    submitBoardCreation,
    retryBoardCreation,
    isCreating,
    hasError,
    failedBoard,
  } = useBoardCreation({
    animateOnCreate: true,
  });
  const needsRetry = hasError && !!failedBoard;
  const busy = isCreating;
  const locked = busy || needsRetry;
  const templateId = needsRetry ? (failedBoard.template ?? selected) : selected;
  const template = columnsTemplates.find((item) => item.id === templateId)!;
  const title = needsRetry
    ? failedBoard.title
    : (customTitle ?? setupOptions[selected].title);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || busy) return;
    const result = boardSchema.safeParse({
      title,
      template: selected,
      description: "",
    });
    if (!needsRetry && !result.success) {
      setTitleError(result.error.issues[0]?.message);
      return;
    }
    submitting.current = true;
    try {
      await (needsRetry
        ? retryBoardCreation()
        : result.success &&
          submitBoardCreation({ ...result.data, id: generateUUID() }));
    } finally {
      submitting.current = false;
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
      <div className="welcome-gradient pointer-events-none absolute inset-0" />
      <section className="relative mx-auto w-full max-w-5xl">
        <header className="mb-10 max-w-2xl space-y-4">
          <div className="text-muted-foreground flex items-center gap-3 text-xs tracking-[0.3em] uppercase sm:text-sm">
            <Sparkles className="size-4" aria-hidden="true" />
            Welcome to Kanbamy 👋
          </div>
          <h1 className="text-[clamp(1.875rem,3vw,2.25rem)] font-semibold tracking-tight text-balance">
            {firstName
              ? `Let’s set up your first board, ${firstName}!`
              : "Let’s set up your first board!"}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Choose a template or start from scratch to organize your work.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-busy={busy}
          className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12"
        >
          <fieldset
            disabled={locked}
            aria-label="Board template"
            className="min-w-0 space-y-3"
          >
            <legend className="mb-4 text-sm font-medium">
              What would you like to organize?
            </legend>
            {columnsTemplates.map((item) => {
              const id = item.id as Templates;
              const option = setupOptions[id];
              const Icon = item.icon;
              const active = templateId === id;
              return (
                <label
                  key={id}
                  className={cn(
                    "focus-within:ring-ring group relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-[border-color,background-color,box-shadow,transform] duration-200 outline-none focus-within:ring-offset-0 motion-reduce:transition-none",
                    active
                      ? "border-primary/35 bg-primary/[0.07] shadow-primary/80 shadow-[0_12px_30px_-24px]"
                      : "border-border/70 bg-background/70 hover:border-primary/25 hover:bg-card/70 hover:-translate-y-0.5 hover:shadow-md",
                    id === "custom" &&
                      !active &&
                      "bg-background/70 border-dashed",
                    locked && "cursor-default opacity-70",
                  )}
                >
                  <input
                    type="radio"
                    name="template"
                    value={id}
                    checked={active}
                    onChange={() => {
                      setSelected(id);
                      setTitleError(undefined);
                    }}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 motion-reduce:transition-none",
                      active
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/70 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {option.label}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                      {option.description}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 motion-reduce:transition-none",
                      active
                        ? "border-primary/70 bg-primary/15 text-primary"
                        : "border-border/70 text-transparent",
                    )}
                  >
                    {active && <Check className="size-3" />}
                  </span>
                </label>
              );
            })}
          </fieldset>

          <div className="min-w-0 space-y-5">
            <div className="border-border/70 bg-card/45 overflow-hidden rounded-xl border shadow-xs">
              <div className="flex items-start gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
                <span className="bg-primary/10 text-primary ring-primary/15 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1">
                  <ClipboardList className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 space-y-0.5">
                  <label
                    htmlFor="welcome-board-name"
                    className="block text-sm font-semibold"
                  >
                    Name your board
                  </label>
                  <p
                    id="welcome-name-hint"
                    className="text-muted-foreground text-xs leading-relaxed"
                  >
                    We’ve suggested a name. You can change it now or anytime
                    later.
                  </p>
                </div>
              </div>
              <div className="px-4 pt-3.5 pb-4 sm:px-5 sm:pb-5">
                <Input
                  id="welcome-board-name"
                  name="title"
                  value={title}
                  disabled={locked}
                  maxLength={50}
                  required
                  aria-invalid={!!titleError}
                  aria-describedby={
                    titleError
                      ? "welcome-name-error welcome-name-hint"
                      : "welcome-name-hint"
                  }
                  onChange={(event) => {
                    setCustomTitle(event.target.value);
                    setTitleError(undefined);
                  }}
                      className="border-input bg-background/80 hover:border-primary/40 hover:bg-accent/50 focus-visible:border-primary/70 focus-visible:ring-primary/25 dark:bg-input/50 dark:hover:bg-accent/30 h-11 cursor-text rounded-lg px-3 text-base font-medium shadow-xs transition-[color,background-color,border-color,box-shadow] focus-visible:ring-2"
                />
              </div>
              {titleError && (
                <p
                  id="welcome-name-error"
                  role="alert"
                  className="text-destructive px-4 pb-4 text-sm sm:px-5"
                >
                  {titleError}
                </p>
              )}
            </div>

            <section
              aria-label="Board preview"
              className="border-border/70 bg-muted/20 flex h-[360px] flex-col overflow-hidden rounded-xl border shadow-[0_20px_60px_-42px_rgba(0,0,0,0.65)] sm:h-[280px]"
            >
              <div className="border-border/60 bg-card/55 shrink-0 space-y-1.5 border-b px-5 py-4 sm:px-6">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Your board preview
                </p>
                <h2 className="truncate text-lg font-semibold">
                  {title.trim() || "Your board"}
                </h2>
                <p className="text-muted-foreground text-xs" aria-live="polite">
                  {template.status.length
                    ? `${template.status.length} columns ready for your tasks`
                    : "A blank board to build your own workflow"}
                </p>
              </div>
              <div className="bg-background/45 min-h-0 flex-1 p-3 sm:p-4">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={templateId}
                    initial={
                      shouldReduceMotion
                        ? false
                        : { opacity: 0, y: 10, scale: 0.985 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                      shouldReduceMotion
                        ? undefined
                        : { opacity: 0, y: -8, scale: 0.99 }
                    }
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="h-full"
                  >
                    {template.status.length ? (
                      <div className="grid min-h-34 grid-cols-2 gap-2 sm:flex sm:gap-2.5">
                        {template.status.map((status, index) => (
                          <div
                            key={status}
                            className="border-border/45 bg-card/60 flex min-h-28 min-w-0 flex-1 flex-col rounded-md border px-2.5 py-2.5 shadow-xs"
                          >
                            <div className="flex items-center gap-2 text-[0.6875rem] font-semibold tracking-wide">
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "size-1.5 shrink-0 rounded-full",
                                  index === template.status.length - 1
                                    ? "bg-emerald-500"
                                    : index === 0
                                      ? "bg-muted-foreground/50"
                                      : "bg-primary/70",
                                )}
                              />
                              <span className="truncate">{status}</span>
                            </div>
                            <div
                              aria-hidden="true"
                              className="text-muted-foreground/40 mt-auto flex items-center justify-center pt-3"
                            >
                              <Plus className="size-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-border/70 text-muted-foreground flex min-h-34 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-5 text-center">
                        <Plus className="size-5" aria-hidden="true" />
                        <p className="text-sm">
                          Add your first column once you’re inside.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>

            {needsRetry && (
              <p role="alert" className="text-destructive text-sm">
                We couldn’t confirm your board was saved. Retry to finish
                creating this same board.
              </p>
            )}
            <Button
              type="submit"
              disabled={busy}
              size="lg"
              className="border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/50 h-10 w-full rounded-lg border px-5 text-sm font-semibold shadow-none transition duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-px active:shadow-none"
              effect="ringHover"
            >
              {isCreating && (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              )}
              {isCreating
                ? "Creating your board…"
                : needsRetry
                  ? "Retry creating my board"
                  : "Create my board"}
              {!busy && <ArrowRight aria-hidden="true" />}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
