import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function DemoBreadcrumb({ boardTitle }: { boardTitle: string }) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <Link
        href="/demo"
        className="hover:text-foreground flex items-center gap-1 transition-colors"
      >
        <Home size={14} />
        <span>Workspace</span>
      </Link>
      <ChevronRight size={14} />
      <span className="text-foreground max-w-48 truncate font-medium" dir="auto">
        {boardTitle}
      </span>
    </div>
  );
}
