import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AddColumnCardProps = {
  onClick?: () => void;
  className?: string;
};

const AddColumnCard = ({ onClick, className }: AddColumnCardProps) => {
  return (
    <Button
      type="button"
      className={cn(
        "active:scale-95 border-dashed shrink-0",
        className,
      )}
      onClick={onClick}
      aria-disabled={!onClick}
      tabIndex={onClick ? 0 : -1}
      title="Add column"
      aria-label="Add column"
      variant="outline"
      size="icon"
    >
      <Plus
        size={16}
        strokeWidth={2}
        className="transition-transform duration-150 group-hover:scale-110"
        aria-hidden="true"
      />
    </Button>
  );
};

export default AddColumnCard;
