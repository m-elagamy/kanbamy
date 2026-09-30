"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import BackgroundEffect from "./components/background-effect";
import { Button } from "@/components/ui/button";

const LegalDocumentModal = dynamic(
  () =>
    import("./components/legal-document").then((mod) => mod.LegalDocumentModal),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showLegalDocument, setShowLegalDocument] = useState(false);

  const handleShowingLegalDocument = () => {
    setShowLegalDocument(true);
  };

  return (
    <main className="bg-muted/30 dark:bg-background relative isolate flex h-dvh min-h-0 items-center justify-center overflow-hidden px-4 py-4 sm:h-auto sm:min-h-dvh sm:px-6 sm:py-8">
      <BackgroundEffect />
      <section className="animate-in fade-in zoom-in-95 motion-reduce:animate-none relative z-10 w-full max-w-[440px] -translate-y-2 ease-out duration-500 sm:-translate-y-5">
        {children}
        <div className="mt-2 px-4 text-center text-xs leading-5">
          <span className="text-muted-foreground">
            By continuing, you agree to our
          </span>
          <Button
            variant="link"
            className="px-1 pr-0"
            onClick={handleShowingLegalDocument}
          >
            Terms of Service
          </Button>
          {showLegalDocument && (
            <LegalDocumentModal
              isOpen={showLegalDocument}
              setIsOpen={setShowLegalDocument}
            />
          )}
          .
        </div>
      </section>
    </main>
  );
}
