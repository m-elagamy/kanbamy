import { Ellipsis, Flag, ListFilter, Plus, Search } from "lucide-react";
import columnStatusOptions from "@/app/dashboard/data/column-status-options";
import { BorderTrail } from "@/components/ui/border-trail";
import {
  DashboardPreviewAtmosphere,
  DashboardPreviewFloatingElements,
  DashboardPreviewOrbit,
} from "./dashboard-preview-motion-layer";

const columns = [
  {
    title: "To Do",
    status: "To Do",
    tasks: [
      { title: "Shape onboarding flow", priority: "High", age: "2 days" },
      { title: "Review mobile navigation", priority: "Medium", age: "1 day" },
      { title: "Write release notes", priority: "Low", age: "Today" },
    ],
  },
  {
    title: "In Progress",
    status: "In Progress",
    tasks: [
      { title: "Refine dashboard states", priority: "High", age: "3 days" },
      { title: "Polish task interactions", priority: "Medium", age: "1 day" },
    ],
  },
  {
    title: "Under Review",
    status: "Under Review",
    tasks: [
      { title: "Improve keyboard support", priority: "High", age: "2 days" },
      { title: "Check responsive layout", priority: "Low", age: "Today" },
    ],
  },
  {
    title: "Done",
    status: "Done",
    tasks: [
      { title: "Set up project structure", priority: "Medium", age: "Done" },
      { title: "Create first board", priority: "Low", age: "Done" },
    ],
  },
];

const previewPriorityStyles: Record<string, { card: string; icon: string }> = {
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

function PreviewTask({
  title,
  priority,
  age,
}: {
  title: string;
  priority: string;
  age: string;
}) {
  const priorityStyles = previewPriorityStyles[priority] ?? {
    card: "border-s-2 border-s-border/70",
    icon: "text-muted-foreground",
  };

  return (
    <div
      className={`border-border/80 bg-card rounded-lg border px-3 py-2 text-left shadow-xs ${priorityStyles.card}`}
    >
      <p className="text-foreground truncate text-xs font-medium sm:text-sm">
        {title}
      </p>
      <div className="text-muted-foreground mt-3 flex items-center justify-between gap-3 text-[10px] sm:text-xs">
        <span>{age}</span>
        <span
          className="inline-flex items-center gap-1"
          title={`${priority} priority`}
        >
          <Flag
            className={`${priorityStyles.icon} size-3`}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">{priority}</span>
        </span>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-6xl px-1 sm:px-0">
      <div
        className="pointer-events-none absolute inset-[-18%] z-0 [background-image:linear-gradient(to_right,rgba(210,220,220,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(210,220,220,0.16)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_76%)] [background-size:5rem_5rem] opacity-[0.12]"
        aria-hidden="true"
      />
      <div
        className="bg-foreground/[0.035] pointer-events-none absolute top-[18%] bottom-[10%] left-[15%] z-0 w-px"
        aria-hidden="true"
      />
      <div
        className="bg-foreground/[0.035] pointer-events-none absolute top-[8%] right-[18%] bottom-[4%] z-0 w-px"
        aria-hidden="true"
      />
      <div
        className="bg-primary/20 pointer-events-none absolute top-[18%] left-1/2 z-0 h-56 w-[42%] -translate-x-1/2 rounded-full blur-[105px]"
        aria-hidden="true"
      />
      <div
        className="bg-secondary/10 pointer-events-none absolute top-[35%] -left-10 z-0 size-40 rounded-full blur-[80px]"
        aria-hidden="true"
      />
      <div
        className="bg-secondary/10 pointer-events-none absolute right-0 bottom-[18%] z-0 size-36 rounded-full blur-[80px]"
        aria-hidden="true"
      />

      <div className="hidden sm:block">
        <DashboardPreviewOrbit />
      </div>
      <div
        className="border-primary/8 pointer-events-none absolute -inset-x-[7%] -inset-y-[25%] z-0 rotate-[-5deg] rounded-[50%] border [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)] opacity-65"
        aria-hidden="true"
      />
      <div
        className="border-secondary/10 pointer-events-none absolute inset-x-[4%] -inset-y-[8%] z-0 rotate-[4deg] rounded-[50%] border [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)] opacity-65"
        aria-hidden="true"
      />

      <span
        className="bg-primary/60 pointer-events-none absolute top-[22%] left-[9%] z-0 size-1 rounded-full shadow-[0_0_12px_var(--primary)]"
        aria-hidden="true"
      />
      <span
        className="bg-secondary/60 pointer-events-none absolute top-[30%] right-[12%] z-0 size-1 rounded-full"
        aria-hidden="true"
      />
      <span
        className="bg-primary/50 pointer-events-none absolute right-[8%] bottom-[29%] z-0 size-1.5 rounded-full"
        aria-hidden="true"
      />

      <div
        className="bg-primary/[0.12] pointer-events-none absolute inset-x-[12%] -top-8 -bottom-8 z-0 rounded-[3rem] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="text-muted-foreground/85 pointer-events-none absolute bottom-[15%] -left-36 z-20 hidden w-32 -rotate-6 text-left text-[15px] leading-[1.15] xl:block"
        aria-hidden="true"
      >
        <span className="font-[cursive] italic">Small steps</span>
        <br />
        <span className="font-[cursive] italic">Big progress</span>
        <svg
          className="text-muted-foreground/72 mt-2 ml-8 h-11 w-24"
          viewBox="0 0 64 40"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 4C7 18 18 27 36 29c7 1 13-1 18-5m-8-1 8 1-4 7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <div className="hidden xl:block">
        <DashboardPreviewFloatingElements />
      </div>

      <div
        className="border-border/70 bg-background relative z-10 overflow-hidden rounded-xl border shadow-[0_30px_90px_-42px_rgba(0,0,0,0.65)] sm:rounded-2xl"
        role="img"
        aria-label="Preview of a Kanbamy product board"
      >
        <div className="border-border/60 bg-muted/20 flex h-8 items-center gap-1.5 border-b px-3 sm:h-10 sm:px-4">
          <span className="bg-primary size-2 rounded-full" />
          <span className="bg-primary/55 size-2 rounded-full" />
          <span className="bg-secondary size-2 rounded-full" />
          <div className="bg-background border-border/50 text-muted-foreground mx-1 flex h-6 flex-1 items-center justify-center rounded-md border px-4 text-[9px] sm:mx-2 sm:h-7 sm:text-[11px]">
            kanbamy.com/dashboard/kanbamy
          </div>
        </div>

        <div className="border-border/50 flex items-center justify-between gap-3 border-b px-3 py-3 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className="bg-primary/10 text-primary ring-primary/15 flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ring-1 sm:size-10 sm:rounded-xl sm:text-base">
              K
            </span>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold sm:text-base">
                Kanbamy
              </p>
              <p className="text-muted-foreground hidden truncate text-xs sm:block">
                Organize work, track progress, and keep projects moving
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="border-border text-muted-foreground hidden h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs lg:flex">
              <ListFilter className="size-3.5" aria-hidden="true" />
              All priorities
            </span>
            <span className="border-border text-muted-foreground hidden h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs md:flex">
              <Search className="size-3.5" aria-hidden="true" />
              Search tasks...
            </span>
            <span className="bg-primary text-primary-foreground inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium shadow-xs">
              <Plus className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Add task</span>
              <span className="sm:hidden">Add</span>
            </span>
          </div>
        </div>

        <div className="bg-muted/10 h-[20rem] overflow-hidden p-3 sm:h-[27rem] sm:p-4 md:h-[31rem]">
          <div className="flex h-full min-w-[43rem] gap-3 sm:min-w-[56rem] sm:gap-4">
            {columns.map((column) => {
              const { icon: Icon, color } =
                columnStatusOptions[
                  column.status as keyof typeof columnStatusOptions
                ];

              return (
                <div
                  key={column.title}
                  className="board-lane border-border/80 flex h-full w-52 shrink-0 flex-col overflow-hidden rounded-lg border shadow-sm sm:w-64"
                >
                  <div className="bg-muted/30 dark:bg-muted/20 flex items-center justify-between border-b p-3 pb-2.5 sm:p-4 sm:pb-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Icon
                        className="size-3.5 shrink-0 sm:size-4"
                        color={color}
                        aria-hidden="true"
                      />
                      <p className="truncate text-xs font-semibold sm:text-sm">
                        {column.title}
                      </p>
                      <span className="border-border text-muted-foreground rounded-md border px-1.5 py-0.5 text-[9px] leading-none sm:text-[10px]">
                        {column.tasks.length}
                      </span>
                    </div>
                    <Ellipsis
                      className="text-muted-foreground size-4"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="board-lane-body space-y-2.5 p-3">
                    {column.tasks.map((task) => (
                      <PreviewTask key={task.title} {...task} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="from-background/80 pointer-events-none absolute right-0 bottom-0 left-0 h-12 bg-linear-to-t to-transparent" />
          <div className="from-background/80 pointer-events-none absolute top-0 right-0 bottom-0 w-12 bg-linear-to-l to-transparent sm:hidden" />
        </div>
        <BorderTrail
          size={120}
          className="from-primary/10 via-primary/70 to-secondary/60 bg-linear-to-r opacity-70"
          transition={{ duration: 8 }}
        />
      </div>
    </div>
  );
}
