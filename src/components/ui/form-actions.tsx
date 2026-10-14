import { Loader } from "lucide-react";
import type { FormMode } from "@/lib/types";
import { DialogClose } from "./dialog";
import AnimatedButton from "./animated-button";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility

type FormActionsProps = {
  isFormInvalid?: boolean;
  isPending?: boolean;
  formMode?: FormMode;
  className?: string;
  leftContent?: React.ReactNode;
};

export default function FormActions({
  isFormInvalid,
  isPending,
  formMode = "create",
  className,
  leftContent,
}: Readonly<FormActionsProps>) {
  const isDisabled = isFormInvalid || isPending;
  const isEditMode = formMode === "edit";

  const actionText = !isEditMode ? "Create" : "Save";
  const actionTextPlural = !isEditMode ? "Creating..." : "Saving...";
  const buttonText = isPending ? actionTextPlural || actionText : actionText;

  return (
    <div
      className={cn(
        "flex items-center gap-2 pt-2",
        leftContent ? "justify-between" : "justify-end",
        className,
      )}
    >
      {leftContent ? (
        <div className="text-muted-foreground flex items-center text-xs">
          {leftContent}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
      <DialogClose asChild>
        <AnimatedButton
          type="button"
          variant="outline"
          className="border-border/80 bg-transparent text-foreground hover:bg-accent dark:bg-transparent dark:hover:bg-accent/50"
          title="Cancel"
          disabled={isPending}
        >
          Cancel
        </AnimatedButton>
      </DialogClose>

      <AnimatedButton
        type="submit"
        title={isPending ? `${actionText}ing...` : actionText}
        disabled={isDisabled}
        aria-busy={isPending}
      >
        {isPending && <Loader className="animate-spin" aria-hidden="true" />}
        {buttonText}
      </AnimatedButton>
      </div>
    </div>
  );
}
