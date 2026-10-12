import WorkspaceContentFrame from "@/components/layout/workspace-content-frame";

const BoardContainer = ({ children }: { children: React.ReactNode }) => (
  <WorkspaceContentFrame ariaLabel="Board Container">
    {children}
  </WorkspaceContentFrame>
);

export default BoardContainer;
