import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const SidebarTitle = () => {
  return (
    <SidebarHeader className="pointer-events-none ps-0.5">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton aria-label="Kanbamy">
            <span
              aria-hidden="true"
              className="bg-[#d87943] size-6 shrink-0"
              style={{
                WebkitMaskImage: "url('/brand/kanbamy.webp')",
                maskImage: "url('/brand/kanbamy.webp')",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
            <span className="text-base font-semibold">Kanbamy</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};

export default SidebarTitle;
