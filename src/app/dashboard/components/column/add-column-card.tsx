import { PlusCircle } from "lucide-react";

const AddColumnCard = ({
  onClick,
  label = "Add column",
}: {
  onClick?: () => void;
  label?: string;
}) => {
  return (
    <button
      type="button"
      className="group bg-background/50 text-muted-foreground hover:border-primary/30 hover:bg-accent/70 hover:text-accent-foreground focus-visible:ring-ring flex h-14 w-64 min-w-64 snap-start items-center justify-center gap-2 rounded-xl border border-dashed px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 md:w-84 md:min-w-84"
      onClick={onClick}
      aria-disabled={!onClick}
      tabIndex={onClick ? 0 : -1}
    >
      <PlusCircle
        className="group-hover:text-primary size-4 transition-colors"
        aria-hidden="true"
      />
      {label}
    </button>
  );
};

export default AddColumnCard;
