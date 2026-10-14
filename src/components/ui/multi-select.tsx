"use client";

import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import RequiredIndicator from "./required-indicator";

type MultiSelectContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValues: Set<string>;
  toggleValue: (value: string) => void;
  items: Map<string, ReactNode>;
  onItemAdded: (value: string, label: ReactNode) => void;
};
const MultiSelectContext = createContext<MultiSelectContextType | null>(null);

export function MultiSelect({
  children,
  values,
  defaultValues,
  onValuesChange,
}: {
  children: ReactNode;
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [internalValues, setInternalValues] = useState(
    new Set<string>(values ?? defaultValues),
  );
  const selectedValues = values ? new Set(values) : internalValues;
  const [items, setItems] = useState<Map<string, ReactNode>>(new Map());

  function toggleValue(value: string) {
    const getNewSet = (prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    };
    setInternalValues(getNewSet);
    onValuesChange?.([...getNewSet(selectedValues)]);
  }

  const onItemAdded = useCallback((value: string, label: ReactNode) => {
    setItems((prev) => {
      if (prev.get(value) === label) return prev;
      return new Map(prev).set(value, label);
    });
  }, []);

  return (
    <MultiSelectContext
      value={{
        open,
        setOpen,
        selectedValues,
        toggleValue,
        items,
        onItemAdded,
      }}
    >
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        {children}
      </Popover>
    </MultiSelectContext>
  );
}

export function MultiSelectTrigger({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<typeof Button>) {
  const { open } = useMultiSelectContext();

  return (
    <PopoverTrigger asChild>
      <Button
        {...props}
        variant={props.variant ?? "outline"}
        role={props.role ?? "combobox"}
        aria-expanded={props["aria-expanded"] ?? open}
        className={cn(
          "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='text-'])]:text-muted-foreground flex h-auto min-h-9 w-full max-w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded-md border bg-transparent px-3 py-1.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:h-10 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
      >
        {children}
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
  );
}

export function MultiSelectValue({
  placeholder,
  clickToRemove = true,
  className,
  overflowBehavior = "hover",
  maxCount = 3,
  ...props
}: {
  placeholder?: string;
  clickToRemove?: boolean;
  overflowBehavior?: "wrap" | "wrap-when-open" | "cutoff" | "hover";
  maxCount?: number;
} & Omit<ComponentPropsWithoutRef<"div">, "children">) {
  const { selectedValues, toggleValue, items, open } = useMultiSelectContext();
  const [overflowPopoverOpen, setOverflowPopoverOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldWrap =
    overflowBehavior === "wrap" ||
    (overflowBehavior === "wrap-when-open" && open);

  const isHoverBehavior = overflowBehavior === "hover";

  const handleOverflowMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOverflowPopoverOpen(true);
    }, 150);
  };

  const handleOverflowMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOverflowPopoverOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const allSelectedArray = [...selectedValues].filter((value) =>
    items.has(value),
  );

  const hasOverflow =
    !shouldWrap && maxCount != null && allSelectedArray.length > maxCount;
  const visibleValues = hasOverflow
    ? allSelectedArray.slice(0, maxCount)
    : allSelectedArray;
  const hiddenValues = hasOverflow ? allSelectedArray.slice(maxCount) : [];
  const overflowAmount = hiddenValues.length;

  function renderItemBadge(value: string, isPopover = false) {
    const rawItem = items.get(value);
    const onRemove = () => {
      toggleValue(value);
      if (isPopover && hiddenValues.length <= 1) {
        setOverflowPopoverOpen(false);
      }
    };

    if (isValidElement(rawItem)) {
      return (
        <span key={value} data-selected-item className="inline-flex shrink-0">
          {cloneElement(
            rawItem as React.ReactElement<{ onRemove?: () => void }>,
            { onRemove: clickToRemove ? onRemove : undefined },
          )}
        </span>
      );
    }

    return (
      <span
        key={value}
        data-selected-item
        className="border-border/70 bg-muted/60 text-foreground inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium transition-colors"
      >
        <span>{rawItem}</span>
        {clickToRemove && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }
            }}
            className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 -mr-0.5 ml-0.5 flex size-2.5 cursor-pointer items-center justify-center rounded-xs transition-colors"
            aria-label={`Remove ${value}`}
          >
            <XIcon className="size-[7px] shrink-0" strokeWidth={2.5} />
          </span>
        )}
      </span>
    );
  }

  if (selectedValues.size === 0 && placeholder) {
    return (
      <span className="text-muted-foreground min-w-0 overflow-hidden text-sm font-normal">
        {placeholder}
      </span>
    );
  }

  return (
    <div
      {...props}
      className={cn(
        "flex w-full max-w-full min-w-0 flex-1 items-center gap-1.5 overflow-hidden",
        shouldWrap && "h-full flex-wrap",
        className,
      )}
    >
      {visibleValues.map((value) => renderItemBadge(value))}

      {hasOverflow && (
        <Popover
          open={overflowPopoverOpen}
          onOpenChange={setOverflowPopoverOpen}
        >
          <PopoverTrigger asChild>
            <span
              role="button"
              tabIndex={0}
              className="border-border/80 bg-muted/80 text-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-5 shrink-0 cursor-pointer items-center justify-center rounded-md border px-1.5 text-[10px] font-semibold transition-colors select-none"
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setOverflowPopoverOpen((prev) => !prev);
              }}
              onMouseEnter={
                isHoverBehavior ? handleOverflowMouseEnter : undefined
              }
              onMouseLeave={
                isHoverBehavior ? handleOverflowMouseLeave : undefined
              }
            >
              +{overflowAmount}
            </span>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={6}
            className="border-border/80 w-64 rounded-lg p-2.5 shadow-md"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseEnter={
              isHoverBehavior ? handleOverflowMouseEnter : undefined
            }
            onMouseLeave={
              isHoverBehavior ? handleOverflowMouseLeave : undefined
            }
          >
            <div className="space-y-2">
              <div className="border-border/60 flex items-center justify-between border-b pb-1.5 text-xs">
                <span className="text-foreground font-medium">
                  Selected tags
                </span>
                <span className="text-muted-foreground text-[10px]">
                  +{overflowAmount} hidden
                </span>
              </div>
              <ScrollArea className="max-h-48">
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hiddenValues.map((value) => renderItemBadge(value, true))}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export function MultiSelectContent({
  search = true,
  children,
  contentClassName,
  side,
  align,
  ...props
}: {
  search?: boolean | { placeholder?: string; emptyMessage?: string };
  children: ReactNode;
  contentClassName?: string;
  side?: ComponentPropsWithoutRef<typeof PopoverContent>["side"];
  align?: ComponentPropsWithoutRef<typeof PopoverContent>["align"];
} & Omit<ComponentPropsWithoutRef<typeof Command>, "children">) {
  const canSearch = typeof search === "object" ? true : search;

  return (
    <>
      <div style={{ display: "none" }}>
        <Command>
          <CommandList>{children}</CommandList>
        </Command>
      </div>
      <PopoverContent
        side={side}
        align={align}
        className={cn(
          "multi-select-content min-w-(--radix-popover-trigger-width) p-0",
          contentClassName,
        )}
      >
        <Command {...props}>
          {canSearch ? (
            <CommandInput
              placeholder={
                typeof search === "object" ? search.placeholder : undefined
              }
            />
          ) : (
            <button autoFocus className="sr-only" />
          )}
          <CommandList>
            {canSearch && (
              <CommandEmpty>
                {typeof search === "object" ? search.emptyMessage : undefined}
              </CommandEmpty>
            )}
            {children}
          </CommandList>
        </Command>
      </PopoverContent>
    </>
  );
}

export function MultiSelectItem({
  value,
  children,
  badgeLabel,
  onSelect,
  ...props
}: {
  badgeLabel?: ReactNode;
  value: string;
} & Omit<ComponentPropsWithoutRef<typeof CommandItem>, "value">) {
  const { toggleValue, selectedValues, onItemAdded } = useMultiSelectContext();
  const isSelected = selectedValues.has(value);

  useEffect(() => {
    onItemAdded(value, badgeLabel ?? children);
  }, [value, children, onItemAdded, badgeLabel]);

  return (
    <CommandItem
      {...props}
      onSelect={() => {
        toggleValue(value);
        onSelect?.(value);
      }}
      className={cn("m-1", props.className)}
    >
      {children}
      <CheckIcon
        className={cn(
          "ms-auto size-4",
          isSelected ? "opacity-100" : "opacity-0",
        )}
      />
    </CommandItem>
  );
}

export function MultiSelectGroup(
  props: ComponentPropsWithoutRef<typeof CommandGroup>,
) {
  return <CommandGroup {...props} />;
}

export function MultiSelectSeparator(
  props: ComponentPropsWithoutRef<typeof CommandSeparator>,
) {
  return <CommandSeparator {...props} />;
}

export function MultiSelectLabel(
  props: ComponentPropsWithoutRef<typeof Label> & { required?: boolean },
) {
  return (
    <Label className="mb-1 flex items-center gap-1 text-sm" {...props}>
      {props.children}
      {props.required && <RequiredIndicator />}
    </Label>
  );
}

function useMultiSelectContext() {
  const context = useContext(MultiSelectContext);
  if (context == null) {
    throw new Error(
      "useMultiSelectContext must be used within a MultiSelectContext",
    );
  }
  return context;
}

function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
