"use client";

import Link from "next/link";
import { CircleUserRound, ChevronsUpDown, Home, LogIn, UserPlus } from "lucide-react";
import { ThemeSwitcher } from "@/components/layout/footer/theme-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function DemoIdentity() {
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:border-sidebar-accent border-sidebar-border data-[state=open]:text-sidebar-accent-foreground overflow-visible border"
                size="lg"
                tooltip="Demo workspace"
              >
                <span className="relative block shrink-0">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
                      <CircleUserRound className="size-4" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                  <span aria-hidden="true" className="absolute right-0 bottom-0 flex size-3 items-center justify-center">
                    <span className="border-background relative size-2.5 rounded-full border-2 bg-amber-500" />
                  </span>
                </span>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">Demo workspace</span>
                  <span className="truncate text-xs text-muted-foreground">Temporary session</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
                      <CircleUserRound className="size-4" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 leading-tight">
                    <span className="truncate font-semibold">Demo workspace</span>
                    <span className="truncate text-xs text-muted-foreground">Temporary session</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home /> Home page
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/sign-up">
                    <UserPlus /> Create account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/sign-in">
                    <LogIn /> Sign in
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  Preferences
                </DropdownMenuLabel>
                <div className="flex items-center justify-between px-2 py-1.5 text-sm">
                  Theme
                  <ThemeSwitcher size="sm" />
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
