"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListTodo } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const gatedFeatures = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: ListTodo,
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

            return (
              <SidebarMenuItem key={feature.key}>
                <SidebarMenuButton
                  tooltip={feature.label}
                  isActive={
                    feature.key === "overview"
                      ? pathname === "/demo/overview"
                      : pathname === "/demo/tasks"
                  }
                  asChild
                >
                  <Link
                    href={
                      feature.key === "overview"
                        ? "/demo/overview"
                        : "/demo/tasks"
                    }
                  >
                    <Icon />
                    <span>{feature.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
