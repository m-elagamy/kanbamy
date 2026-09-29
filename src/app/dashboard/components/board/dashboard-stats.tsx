import { ChevronRight, ListTodo, LockKeyhole } from "lucide-react";
import Link from "next/link";

interface DashboardStatsProps {
  openTasks: number;
  canNavigateTasks?: boolean;
  basePath?: string;
}

const stats = (values: DashboardStatsProps) => [
  {
    label: "Open Tasks",
    value: values.openTasks,
    icon: ListTodo,
    color: "text-blue-500",
  },
];

export default function DashboardStats({
  openTasks,
  canNavigateTasks = true,
  basePath = "/dashboard",
}: DashboardStatsProps) {
  return (
    <section
      aria-label="Workspace overview"
      className="text-muted-foreground flex items-center gap-2 px-1 pt-1"
    >
      {stats({ openTasks, canNavigateTasks, basePath }).map(
        ({ label, value, icon: Icon, color }) =>
          canNavigateTasks ? (
            <Link
              key={label}
              href={`${basePath}/tasks?attention=open&page=1`}
              aria-label={`View ${value} open tasks`}
              className="group flex cursor-pointer items-center gap-2.5 rounded-md outline-none transition-colors duration-150 hover:text-primary focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Icon
                className={`${color} size-4 shrink-0 opacity-80 transition-opacity group-hover:opacity-100`}
                aria-hidden="true"
              />
              <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                <p className="text-foreground text-sm leading-none font-semibold">
                  {value}
                </p>
                <p className="text-xs leading-tight transition-colors group-hover:text-primary">
                  {label}
                </p>
              </div>
              <ChevronRight
                className="text-muted-foreground/60 size-3.5 shrink-0 transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ) : (
            <span
              key={label}
              aria-label={`${label}: create an account to view tasks.`}
              title="Create an account to view all your tasks."
              className="text-muted-foreground inline-flex cursor-not-allowed items-center gap-2.5 rounded-md opacity-70"
            >
              <Icon className={`${color} size-4 shrink-0 opacity-80`} aria-hidden="true" />
              <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-foreground text-sm leading-none font-semibold">
                  {value}
                </span>
                <span className="text-xs leading-tight">{label}</span>
              </span>
              <LockKeyhole className="size-3.5" aria-hidden="true" />
            </span>
          ),
      )}
    </section>
  );
}
