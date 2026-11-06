import { Loader2, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AiImproveButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function AiImproveButton({
  onClick,
  isLoading = false,
  disabled = false,
  label = "Improve with AI",
  className,
}: AiImproveButtonProps) {
  const currentLabel = isLoading ? "Improving..." : label;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled || isLoading}
      title={currentLabel}
      aria-label={currentLabel}
      className={cn(
        "size-6 rounded p-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
    >
      {isLoading ? (
        <Loader2
          className="size-3.5 animate-spin text-primary"
          aria-hidden="true"
        />
      ) : (
        <WandSparkles className="size-3.5!" aria-hidden="true" />
      )}
      <span className="sr-only">{currentLabel}</span>
    </Button>
  );
}
