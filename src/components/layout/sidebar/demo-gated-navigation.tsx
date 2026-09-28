"use client";

import { useState } from "react";
import { FolderKanban, LayoutDashboard, ListTodo, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const gatedFeatures = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    message: "Create an account to use the full workspace overview.",
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: ListTodo,
    message: "Create an account to review tasks across multiple boards.",
  },
  {
    key: "boards",
    label: "Boards",
    icon: FolderKanban,
    message: "Create an account to manage multiple boards.",
  },
  {
    key: "add-board",
    label: "Add Board",
    icon: Plus,
    message: "Create an account to add more boards.",
  },
] as const;

export default function DemoGatedNavigation() {
  const { setOpenMobile } = useSidebar();
  const [activeFeature, setActiveFeature] = useState<(typeof gatedFeatures)[number] | null>(null);

  const openFeaturePrompt = (feature: (typeof gatedFeatures)[number]) => {
    setOpenMobile(false);
    setActiveFeature(feature);
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="uppercase">Workspace</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {gatedFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <SidebarMenuItem key={feature.key}>
                  <SidebarMenuButton
                    type="button"
                    tooltip={feature.label}
                    onClick={() => openFeaturePrompt(feature)}
                  >
                    <Icon />
                    <span>{feature.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Dialog
        open={Boolean(activeFeature)}
        onOpenChange={(open) => {
          if (!open) setActiveFeature(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{activeFeature?.label} is available with an account</DialogTitle>
            <DialogDescription>
              {activeFeature?.message} Your current demo workspace will be kept.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setActiveFeature(null)}>
              Continue exploring
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
