"use client";

import { useCallback, useRef, useState } from "react";
import {
  Bold,
  Italic,
  List,
  Code,
  Quote,
  Eye,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import RichDescription from "./rich-description";
import FormMessage from "@/components/ui/form-message";
import { AiImproveButton } from "@/components/ui/ai-improve-button";
import { cn } from "@/lib/utils";

interface ToolbarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  prefix: string;
  suffix?: string;
  defaultText: string;
  shortcut?: string;
}

const TOOLBAR_ITEMS: readonly ToolbarItem[] = [
  {
    id: "bold",
    label: "Bold",
    icon: Bold,
    prefix: "**",
    suffix: "**",
    defaultText: "bold text",
    shortcut: "Ctrl+B",
  },
  {
    id: "italic",
    label: "Italic",
    icon: Italic,
    prefix: "*",
    suffix: "*",
    defaultText: "italic text",
    shortcut: "Ctrl+I",
  },
  {
    id: "list",
    label: "Bullet list",
    icon: List,
    prefix: "\n* ",
    defaultText: "list item",
  },
  {
    id: "code",
    label: "Inline code",
    icon: Code,
    prefix: "`",
    suffix: "`",
    defaultText: "code",
    shortcut: "Ctrl+E",
  },
  {
    id: "quote",
    label: "Quote",
    icon: Quote,
    prefix: "\n> ",
    defaultText: "quote",
  },
] as const;

export interface MarkdownTextareaProps {
  name: string;
  id?: string;
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  disabled?: boolean;
  onAiImprove?: () => void;
  isAiImproving?: boolean;
  isAiDisabled?: boolean;
  aiImproveLabel?: string;
  toolbarAction?: React.ReactNode;
}

export default function MarkdownTextarea({
  name,
  id,
  label,
  defaultValue = "",
  value: controlledValue,
  onChange,
  error,
  placeholder = "Add description or notes...",
  maxLength = 2000,
  className,
  disabled = false,
  onAiImprove,
  isAiImproving,
  isAiDisabled,
  aiImproveLabel = "Improve description with AI",
  toolbarAction,
}: MarkdownTextareaProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = isControlled ? controlledValue : internalValue;

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const elementId = id || name;

  // Sync internal state with defaultValue changes without effect cascading renders
  const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue);
  if (!isControlled && defaultValue !== prevDefaultValue) {
    setPrevDefaultValue(defaultValue);
    setInternalValue(defaultValue);
  }

  const handleTextChange = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  const insertFormatting = useCallback(
    (prefix: string, suffix = "", defaultText = "") => {
      const textarea = textareaRef.current;
      if (!textarea || disabled) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selected = text.slice(start, end);
      const replacement = selected || defaultText;
      const formatted = `${prefix}${replacement}${suffix}`;
      const newText = text.slice(0, start) + formatted + text.slice(end);

      // Trigger native input to notify any attached form handlers
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      nativeSetter?.call(textarea, newText);
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      handleTextChange(newText);

      // Restore focus and selection
      requestAnimationFrame(() => {
        textarea.focus();
        const cursorStart = start + prefix.length;
        const cursorEnd = cursorStart + replacement.length;
        textarea.setSelectionRange(cursorStart, cursorEnd);
      });
    },
    [disabled, handleTextChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!e.ctrlKey && !e.metaKey) return;

      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          insertFormatting("**", "**", "bold text");
          break;
        case "i":
          e.preventDefault();
          insertFormatting("*", "*", "italic text");
          break;
        case "e":
          e.preventDefault();
          insertFormatting("`", "`", "code");
          break;
      }
    },
    [insertFormatting],
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Field Label & Tab Switcher */}
      <div className="flex items-center justify-between gap-3">
        {label && (
          <Label htmlFor={elementId} className="text-sm font-medium">
            {label}
          </Label>
        )}

        <div className="flex items-center gap-2">
          {/* Write / Preview Tab Switcher */}
          <div
            role="tablist"
            aria-label="Editor mode"
            className="bg-muted/60 inline-flex items-center rounded-md p-0.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "write"}
              onClick={() => setActiveTab("write")}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer",
                activeTab === "write"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <PenLine className="size-3" aria-hidden="true" />
              <span>Write</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "preview"}
              onClick={() => setActiveTab("preview")}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer",
                activeTab === "preview"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Eye className="size-3" aria-hidden="true" />
              <span>Preview</span>
            </button>
          </div>

          {maxLength !== undefined && (
            <span
              aria-live="polite"
              className={cn(
                "text-xs font-mono",
                value.length > maxLength
                  ? "text-destructive font-semibold"
                  : "text-muted-foreground",
              )}
            >
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      </div>

      {/* Editor Container */}
      <div
        className={cn(
          "border-border/80 bg-input/20 focus-within:border-ring focus-within:ring-ring/20 rounded-lg border shadow-2xs transition-all focus-within:ring-2",
          error &&
            "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {/* Micro-Toolbar */}
        {activeTab === "write" && (
          <div
            role="toolbar"
            aria-label="Markdown formatting"
            className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-1 border-b px-2 py-1"
          >
            <div className="flex items-center gap-0.5">
              {TOOLBAR_ITEMS.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  className="text-muted-foreground hover:text-foreground size-6 rounded cursor-pointer"
                  title={
                    item.shortcut
                      ? `${item.label} (${item.shortcut})`
                      : item.label
                  }
                  onClick={() =>
                    insertFormatting(
                      item.prefix,
                      item.suffix,
                      item.defaultText,
                    )
                  }
                >
                  <item.icon className="size-3.25" aria-hidden="true" />
                  <span className="sr-only">{item.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {onAiImprove ? (
                <AiImproveButton
                  onClick={onAiImprove}
                  isLoading={isAiImproving}
                  disabled={isAiDisabled || disabled}
                  label={aiImproveLabel}
                />
              ) : (
                toolbarAction
              )}
              <span className="text-muted-foreground/60 select-none px-1 text-[10px] font-mono tracking-wide">
                Markdown
              </span>
            </div>
          </div>
        )}

        {/* Write Pane */}
        <div className={activeTab === "write" ? "block" : "hidden"}>
          <textarea
            ref={textareaRef}
            id={elementId}
            name={name}
            value={value}
            disabled={disabled}
            maxLength={maxLength}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="placeholder:text-muted-foreground/60 min-h-[110px] max-h-48 w-full resize-none bg-transparent p-3 text-sm leading-relaxed outline-none [overflow-wrap:anywhere] disabled:cursor-not-allowed"
            dir="auto"
          />
        </div>

        {/* Preview Pane */}
        {activeTab === "preview" && (
          <div className="min-h-35.5 max-h-48 overflow-y-auto p-3 text-sm overflow-x-hidden">
            {value.trim() ? (
              <RichDescription content={value} size="sm" />
            ) : (
              <p className="text-muted-foreground/50 py-6 text-center text-xs italic">
                Nothing to preview yet. Write some markdown first.
              </p>
            )}
          </div>
        )}
      </div>

      {error && <FormMessage variant="error">{error}</FormMessage>}
    </div>
  );
}
