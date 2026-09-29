import { Ellipsis, Flag, GripVertical, ListFilter, Search } from "lucide-react";
import columnStatusOptions from "@/app/dashboard/data/column-status-options";
import { Badge } from "../ui/badge";

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

function TaskSnippet({
  title,
  priority = "Medium",
  active = false,
}: {
  title: string;
  priority?: string;
  active?: boolean;
}) {
  const styles = priorityStyles[priority] ?? {
    card: "border-s-2 border-s-border/70",
    icon: "text-muted-foreground",
  };

  return (
    <div
      className={`border-border/80 bg-card rounded-lg border px-3 py-2 shadow-xs ${styles.card} ${active ? "border-primary/45 bg-primary/[0.055] ring-primary/15 shadow-primary/10 shadow-md ring-1" : ""}`}
    >
      <div className="flex items-start gap-2">
        <span className="border-muted-foreground/50 mt-0.5 size-3.5 shrink-0 rounded-full border" />
        <p className="min-w-0 flex-1 text-xs font-medium sm:text-sm">{title}</p>
        <Ellipsis className="text-muted-foreground size-3.5 shrink-0" />
      </div>
      <div className="text-muted-foreground mt-3 flex items-center justify-between text-[10px] sm:text-xs">
        <span className="inline-flex items-center gap-1">
          <Flag className={`${styles.icon} size-3`} aria-hidden="true" />
          {priority}
        </span>
        <span>Today</span>
      </div>
    </div>
  );
}

function DragPreview() {
  const todo = columnStatusOptions["To Do"];
  const inProgress = columnStatusOptions["In Progress"];
  const ToDoIcon = todo.icon;
  const InProgressIcon = inProgress.icon;

  return (
    <div className="board-lane border-border/80 relative overflow-hidden rounded-xl border p-3 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.65)] sm:p-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="border-border/80 bg-background/70 overflow-hidden rounded-lg border">
          <div className="bg-muted/30 dark:bg-muted/20 flex items-center gap-2 border-b p-3 pb-2.5">
            <ToDoIcon
              className="size-3.5"
              color={todo.color}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold">To Do</span>
          </div>
          <div className="board-lane-body space-y-2 p-3">
            <TaskSnippet title="Review project scope" priority="Low" />
            <TaskSnippet title="Polish task states" priority="High" active />
          </div>
        </div>

        <div className="border-border/80 bg-background/70 overflow-hidden rounded-lg border">
          <div className="bg-muted/30 dark:bg-muted/20 flex items-center gap-2 border-b p-3 pb-2.5">
            <InProgressIcon
              className="size-3.5"
              color={inProgress.color}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold">In Progress</span>
          </div>
          <div className="board-lane-body space-y-2 p-3">
            <TaskSnippet title="Prepare handoff" priority="Medium" />
          </div>
        </div>
      </div>
      <div className="text-primary text-soft-shadow bg-white dark:bg-background pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium shadow-sm sm:flex">
        <GripVertical className="size-3" aria-hidden="true" /> Move
      </div>
    </div>
  );
}

function TaskDetailPreview() {
  return (
    <div className="board-lane border-border/80 overflow-hidden rounded-xl border p-3 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.65)] sm:p-4">
      <div className="border-border/80 bg-card rounded-lg border p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-[10px] font-medium tracking-[0.14em] uppercase">
              Task details
            </p>
            <h3 className="mt-2 text-sm font-semibold sm:text-base">
              Polish responsive states
            </h3>
          </div>
          <Ellipsis className="text-muted-foreground size-4" />
        </div>
        <p className="text-muted-foreground mt-4 text-xs leading-5 sm:text-sm">
          Review the board on narrow screens and tighten the interactions that
          help work stay clear.
        </p>
        <div className="border-border/60 mt-5 flex items-center justify-between border-t pt-3">
          <span className="bg-white text-primary text-soft-shadow dark:bg-primary/10 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium sm:text-xs">
            <Flag className="size-3" aria-hidden="true" /> High priority
          </span>
          <span className="text-muted-foreground text-[10px] sm:text-xs">
            In Progress
          </span>
        </div>
      </div>
    </div>
  );
}

function FocusPreview() {
  return (
    <div className="board-lane border-border/80 overflow-hidden rounded-xl border p-3 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.65)] sm:p-4">
      <div className="border-border/80 bg-card rounded-lg border p-3 sm:p-4">
        <div className="flex gap-2">
          <span className="border-border text-muted-foreground flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border px-2.5 text-[10px] sm:text-xs">
            <Search className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Search tasks...</span>
          </span>
          <span className="border-primary/25 bg-white text-primary text-soft-shadow dark:bg-primary/[0.06] inline-flex h-8 items-center gap-1.5 rounded-md border px-2 text-[10px] font-medium sm:text-xs">
            <ListFilter className="size-3.5" aria-hidden="true" />
            High
          </span>
        </div>
        <div className="border-border/60 mt-3 overflow-hidden rounded-md border">
          <div className="flex items-center justify-between border-b px-3 py-2 text-[10px] sm:text-xs">
            <span className="font-medium">Polish responsive states</span>
            <span className="text-foreground text-soft-shadow dark:text-primary">In Progress</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-[10px] sm:text-xs">
            <span className="font-medium">Review empty board</span>
            <span className="text-muted-foreground">To Do</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const highlights = [
  {
    number: "01",
    title: "Move tasks between stages.",
    description: "Drag, reorder, and keep momentum visible.",
    visual: DragPreview,
  },
  {
    number: "02",
    title: "Keep task context close.",
    description: "Description and priority stay with the work.",
    visual: TaskDetailPreview,
  },
  {
    number: "03",
    title: "Find what needs attention.",
    description: "Search and priority filters cut through the board.",
    visual: FocusPreview,
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 md:py-24">
      <div
        aria-hidden="true"
        className="mx-auto mb-6 flex w-full items-center justify-center gap-2"
      >
        <span className="h-px flex-1 bg-linear-to-r from-transparent to-border/90" />
        <span className="bg-primary/80 size-1 rounded-full" />
        <span className="h-px flex-1 bg-linear-to-l from-transparent to-border/90" />
      </div>
      <div className="mx-auto max-w-2xl text-center">
        <Badge
          variant="outline"
          animate={false}
          className="border-primary/20 bg-primary/[0.06] text-foreground mb-6 shadow-none"
        >
          Product highlights
        </Badge>
        <h2 className="text-gradient text-3xl font-bold tracking-tighter text-balance md:text-4xl lg:text-5xl">
          The board is the workspace.
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-7 md:text-lg">
          The essentials for keeping personal work moving.
        </p>
      </div>

      <div className="mt-12 space-y-12 md:mt-16 md:space-y-16">
        {highlights.map((highlight, index) => {
          const Visual = highlight.visual;

          return (
            <article
              key={highlight.number}
              className="grid min-w-0 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12"
            >
              <div
                className={
                  index % 2 === 1 ? "min-w-0 lg:order-2" : "min-w-0"
                }
              >
                <span className="text-foreground text-soft-shadow dark:text-primary text-xs font-semibold tracking-[0.16em]">
                  {highlight.number}
                </span>
                <h3 className="mt-2 max-w-md text-2xl font-semibold tracking-tight text-balance md:text-3xl">
                  {highlight.title}
                </h3>
                <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6 sm:text-base">
                  {highlight.description}
                </p>
              </div>
              <div
                className={
                  index % 2 === 1
                    ? "min-w-0 w-full lg:order-1"
                    : "min-w-0 w-full"
                }
              >
                <Visual />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
