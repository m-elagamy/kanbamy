"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockKeyhole, LayoutDashboard, ListTodo } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const gatedFeatures = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    message: "Create an account to access Overview.",
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: ListTodo,
    message: "Create an account to view all your tasks.",
  },
] as const;

export default function DemoGatedNavigation() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="uppercase">Workspace</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {gatedFeatures.map((feature) => {
            const Icon = feature.icon;

            if (feature.key === "overview") {
              return (
                <SidebarMenuItem key={feature.key}>
                  <SidebarMenuButton
                    tooltip={feature.label}
                    isActive={pathname === "/demo/overview"}
                    asChild
                  >
                    <Link href="/demo/overview">
                      <Icon />
                      <span>{feature.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return (
              <SidebarMenuItem key={feature.key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      type="button"
                      tooltip={feature.label}
                      aria-label={`${feature.label}. ${feature.message}`}
                      aria-disabled="true"
                      title={feature.message}
                      className="text-sidebar-foreground/70"
                      onClick={(event) => event.preventDefault()}
                    >
                      <Icon />
                      <span>{feature.label}</span>
                      <LockKeyhole className="ml-auto size-3.5 text-muted-foreground" aria-hidden="true" />
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">{feature.message}</TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
