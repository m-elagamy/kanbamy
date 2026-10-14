"use client";

import {
  createContext,
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
          "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='text-'])]:text-muted-foreground flex h-auto min-h-9 w-fit items-center justify-between gap-2 overflow-hidden rounded-md border bg-transparent px-3 py-1.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:h-10 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
  ...props
}: {
  placeholder?: string;
  clickToRemove?: boolean;
  overflowBehavior?: "wrap" | "wrap-when-open" | "cutoff" | "hover";
} & Omit<ComponentPropsWithoutRef<"div">, "children">) {
  const { selectedValues, toggleValue, items, open } = useMultiSelectContext();
  const [overflowAmount, setOverflowAmount] = useState(0);
  const [hiddenValues, setHiddenValues] = useState<Set<string>>(new Set());
  const [overflowPopoverOpen, setOverflowPopoverOpen] = useState(false);
  const valueRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);
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

  const checkOverflow = useCallback(() => {
    if (valueRef.current == null) return;

    const containerElement = valueRef.current;
    const overflowElement = overflowRef.current;
    const itemElements = containerElement.querySelectorAll<HTMLElement>(
      "[data-selected-item]",
    );

    if (overflowElement != null) overflowElement.style.display = "none";
    itemElements.forEach((child) => child.style.removeProperty("display"));

    const selectedValuesArray = [...selectedValues].filter((value) =>
      items.has(value),
    );
    const hidden = new Set<string>();
    let amount = 0;

    for (let i = itemElements.length - 1; i >= 0; i--) {
      const child = itemElements[i]!;
      if (containerElement.scrollWidth <= containerElement.clientWidth) {
        break;
      }
      amount = itemElements.length - i;
      const value = selectedValuesArray[i];
      if (value) {
        hidden.add(value);
      }
      child.style.display = "none";
      overflowElement?.style.removeProperty("display");
    }

    setOverflowAmount(amount);
    setHiddenValues(hidden);
  }, [selectedValues, items]);

  const handleResize = useCallback(
    (node: HTMLDivElement) => {
      valueRef.current = node;

      const mutationObserver = new MutationObserver(checkOverflow);
      const observer = new ResizeObserver(debounce(checkOverflow, 100));

      mutationObserver.observe(node, {
        childList: true,
        attributes: true,
        attributeFilter: ["class", "style"],
      });
      observer.observe(node);

      return () => {
        observer.disconnect();
        mutationObserver.disconnect();
        valueRef.current = null;
      };
    },
    [checkOverflow],
  );

  if (selectedValues.size === 0 && placeholder) {
    return (
      <span className="text-muted-foreground min-w-0 overflow-hidden font-normal">
        {placeholder}
      </span>
    );
  }

  return (
    <div
      {...props}
      ref={handleResize}
      className={cn(
        "flex w-full gap-1.5",
        shouldWrap && "h-full flex-wrap",
        className,
      )}
    >
      {[...selectedValues]
        .filter((value) => items.has(value))
        .map((value) => (
          <Badge
            variant="outline"
            data-selected-item
            className="group flex items-center gap-1"
            key={value}
          >
            {items.get(value)}
            {clickToRemove && (
              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleValue(value);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleValue(value);
                  }
                }}
                role="button"
              >
                <XIcon className="text-muted-foreground group-hover:text-destructive pointer-events-auto cursor-pointer" />
              </span>
            )}
          </Badge>
        ))}
      {overflowAmount > 0 && !shouldWrap && (
        <Popover
          open={overflowPopoverOpen}
          onOpenChange={setOverflowPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Badge
              variant="outline"
              ref={overflowRef}
              className="hover:bg-accent cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (isHoverBehavior) {
                  setOverflowPopoverOpen((prev) => !prev);
                } else {
                  setOverflowPopoverOpen(true);
                }
              }}
              onMouseEnter={
                isHoverBehavior ? handleOverflowMouseEnter : undefined
              }
              onMouseLeave={
                isHoverBehavior ? handleOverflowMouseLeave : undefined
              }
            >
              +{overflowAmount}
            </Badge>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-3"
            onMouseEnter={
              isHoverBehavior ? handleOverflowMouseEnter : undefined
            }
            onMouseLeave={
              isHoverBehavior ? handleOverflowMouseLeave : undefined
            }
          >
            <div className="space-y-2">
              <ScrollArea className="max-h-60">
                <div className="flex flex-wrap gap-1.5">
                  {[...selectedValues]
                    .filter(
                      (value) => items.has(value) && hiddenValues.has(value),
                    )
                    .map((value) => (
                      <Badge
                        variant="outline"
                        className="group flex items-center gap-1"
                        key={value}
                      >
                        {items.get(value)}
                        {clickToRemove && (
                          <span
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleValue(value);
                              if (hiddenValues.size === 1) {
                                setOverflowPopoverOpen(false);
                              }
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleValue(value);
                                if (hiddenValues.size === 1) {
                                  setOverflowPopoverOpen(false);
                                }
                              }
                            }}
                            role="button"
                          >
                            <XIcon className="text-muted-foreground group-hover:text-destructive pointer-events-auto size-2.5 cursor-pointer" />
                          </span>
                        )}
                      </Badge>
                    ))}
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
