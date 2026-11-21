import ClientAuthButtons from "./client-auth-buttons";
import HeaderScrollShell from "./header-scroll-shell";
import KanbanLogo from "./kanban-logo";

export default function Header() {
  return (
    <HeaderScrollShell>
      <div className="container !max-w-[1440px] flex h-full items-center justify-between">
        <KanbanLogo size="compact" className="mx-0" />
        <ClientAuthButtons />
      </div>
    </HeaderScrollShell>
  );
}
