import { Loader, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./button";

type AlertConfirmationProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onClick: () => void;
  isPending?: boolean;
};

const AlertConfirmation = ({
  open,
  setOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onClick,
  isPending,
}: AlertConfirmationProps) => {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-[340px] gap-4 p-4.5 rounded-xl shadow-xl sm:max-w-[360px]">
        <AlertDialogHeader className="gap-2.5 text-left sm:text-left">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Trash2 className="size-4" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-sm font-semibold text-foreground">
                {title}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-end pt-1">
          <AlertDialogCancel className="mt-0 h-8 px-3 text-xs font-normal">
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            className="h-8 px-3 text-xs font-medium"
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={onClick}
          >
            {isPending ? (
              <>
                <Loader className="size-3.5 animate-spin" aria-hidden />
                Deleting...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertConfirmation;
