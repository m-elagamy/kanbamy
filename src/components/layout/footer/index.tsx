import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { links } from "./data";
import KanbanLogo from "../header/kanban-logo";
import { ThemeSwitcher } from "./theme-switcher";

const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="border-border bg-card/50 border-t" role="contentinfo">
      <div className="container py-8">
        {/* Brand Section */}
        <div className="flex flex-col gap-4">
          <KanbanLogo size="compact" glow="none" />
          <p className="text-muted-foreground max-w-md text-sm">
            Turn plans into progress with a simple workspace for organizing
            tasks and keeping work moving.
          </p>
          <div className="flex items-center gap-2">
            {links.map((link, index) => {
              const Icon = link.icon;
              return (
                <Button
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-9 w-9 rounded-full transition-all duration-200"
                  variant="ghost"
                  size="icon"
                  asChild
                  key={index}
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{link.label}</span>
                  </a>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-border/50 mt-6 flex flex-col items-center justify-between gap-3 border-t pt-5 md:flex-row">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Kanbamy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Suspense fallback={null}>
              <ThemeSwitcher />
            </Suspense>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
