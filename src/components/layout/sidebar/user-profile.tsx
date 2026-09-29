import { ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserMenuContent from "@/components/layout/user-menu-content";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type UserProfileUser = {
  fullName: string | null;
  firstName: string | null;
  imageUrl: string;
  email: string;
};

export function UserProfile({ user }: { user: UserProfileUser | null }) {
  const name = user?.fullName || user?.firstName || "Your account";
  const email = user?.email || "";
  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const identity = (
    <>
      <span className="relative block shrink-0">
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={user?.imageUrl} alt={name} />
          <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
        </Avatar>
        <span
          aria-hidden="true"
          className="absolute right-0 bottom-0 flex size-3 items-center justify-center"
        >
          <span className="border-background relative size-2.5 rounded-full border-2 bg-emerald-500" />
        </span>
      </span>
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
        <span className="truncate font-semibold">
          {name}
        </span>
        <span className="truncate text-xs">{email}</span>
      </div>
    </>
  );

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:border-sidebar-accent border-sidebar-border data-[state=open]:text-sidebar-accent-foreground overflow-visible border"
                size="lg"
                tooltip="Account"
              >
                {identity}
                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <UserMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              sideOffset={4}
            />
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
