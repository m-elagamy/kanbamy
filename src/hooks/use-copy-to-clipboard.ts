import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseCopyToClipboardOptions {
  timeout?: number;
  errorMessage?: string;
  successMessage?: string;
}

export function useCopyToClipboard({
  timeout = 2000,
  errorMessage = "Failed to copy link",
  successMessage,
}: UseCopyToClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard?.writeText) {
      toast.error("Clipboard is not supported in this environment");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (successMessage) {
        toast.success(successMessage);
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, timeout);

      return true;
    } catch {
      toast.error(errorMessage);
      return false;
    }
  };

  return { copied, copy };
}
