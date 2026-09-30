import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrivacyPolicy from "./privacy-policy";
import TermsOfService from "./terms-of-service";

type LegalDocumentModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export function LegalDocumentModal({
  isOpen,
  setIsOpen,
}: LegalDocumentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="flex max-h-[calc(100dvh-5rem)] min-h-0 flex-col gap-0 overflow-hidden p-0 sm:max-h-none sm:max-w-xl">
        <DialogHeader className="shrink-0 px-4 py-4 pr-12 sm:px-5 sm:py-4">
          <DialogTitle className="flex items-center gap-1 text-2xl font-bold">
            <FileText className="size-6" />
            Legal Documents
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="privacy" className="min-h-0 flex-1 sm:flex-none">
          <TabsList className="bg-muted/30 w-full rounded-none px-4 *:transition-colors dark:bg-primary-foreground sm:px-5">
            <TabsTrigger value="privacy" className="flex-1">
              Privacy Policy
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex-1">
              Terms of Service
            </TabsTrigger>
          </TabsList>
          <TabsContent value="privacy" className="mt-0 min-h-0 sm:flex-none">
            <ScrollArea className="h-[70dvh] min-h-0 max-h-[calc(100dvh-8rem)] px-4 py-4 sm:h-[min(36rem,calc(100dvh-8rem))] sm:max-h-none sm:px-5 sm:py-5">
              <PrivacyPolicy />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="terms" className="mt-0 min-h-0 sm:flex-none">
            <ScrollArea className="h-[70dvh] min-h-0 max-h-[calc(100dvh-8rem)] px-4 py-4 sm:h-[min(36rem,calc(100dvh-8rem))] sm:max-h-none sm:px-5 sm:py-5">
              <TermsOfService />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
