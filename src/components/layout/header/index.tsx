import AuthButtons from "./auth-buttons";
import HeaderScrollShell from "./header-scroll-shell";
import KanbanLogo from "./kanban-logo";

type HeaderUser = { fullName: string | null; firstName: string | null; imageUrl: string };

const Header = ({ user }: { user: HeaderUser | null }) => {
  return (
    <HeaderScrollShell>
      <div className="container !max-w-[1440px] flex h-full items-center justify-between">
        <KanbanLogo size="compact" className="mx-0" />
        <AuthButtons user={user} />
      </div>
    </HeaderScrollShell>
  );
};

export default Header;
