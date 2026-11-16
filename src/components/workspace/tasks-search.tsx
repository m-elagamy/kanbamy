"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TasksSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUrlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(currentUrlQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPendingLocalQuery = useRef(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (hasPendingLocalQuery.current) {
      if (currentUrlQuery === query.trim()) {
        hasPendingLocalQuery.current = false;
      }
      return;
    }

    setQuery(currentUrlQuery);
  }, [currentUrlQuery, query]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery === currentUrlQuery) return;

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (normalizedQuery) params.set("q", normalizedQuery);
      else params.delete("q");
      params.delete("page");

      const search = params.toString();
      startTransition(() => {
        router.replace(`${pathname}${search ? `?${search}` : ""}`, {
          scroll: false,
        });
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [currentUrlQuery, pathname, query, router, searchParams]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        e.key !== "/" ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        el?.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(el?.tagName ?? "")
      ) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const updateQuery = (value: string) => {
    hasPendingLocalQuery.current = true;
    setQuery(value);
  };

  const clearSearch = () => {
    updateQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full shrink-0">
      <label htmlFor="tasks-search" className="sr-only">
        Search tasks
      </label>
      <div className="border-border/80 bg-card/60 hover:border-primary/40 focus-within:border-primary/50 focus-within:ring-primary/20 relative flex h-9 w-full items-center rounded-lg border shadow-xs transition-all focus-within:ring-1">
        <div className="text-muted-foreground pointer-events-none pl-3 pr-2">
          {isPending ? (
            <LoaderCircle
              className="size-3.5 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Search
              className="size-3.5"
              aria-hidden="true"
            />
          )}
        </div>
        <input
          ref={inputRef}
          id="tasks-search"
          type="search"
          value={query}
          maxLength={100}
          placeholder="Search tasks..."
          className="placeholder:text-muted-foreground/70 h-full w-full bg-transparent pr-3 text-xs placeholder:text-xs sm:text-[13px] sm:placeholder:text-[13px] outline-none [&::-webkit-search-cancel-button]:hidden"
          aria-busy={isPending}
          onChange={(event) => updateQuery(event.target.value)}
          onKeyDown={(e) => e.key === "Escape" && !query && inputRef.current?.blur()}
        />
        {query ? (
          <div className="flex shrink-0 items-center pr-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-accent/70 size-6 rounded-md"
              aria-label="Clear task search"
              onClick={clearSearch}
            >
              <X aria-hidden="true" className="size-3.5" />
            </Button>
          </div>
        ) : (
          <kbd
            aria-hidden="true"
            className="bg-muted text-muted-foreground pointer-events-none mr-2.5 hidden rounded border px-1.5 py-0.5 font-mono text-[0.625rem] select-none sm:inline-flex"
          >
            /
          </kbd>
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {isPending ? "Searching tasks" : "Task search updated"}
      </span>
    </div>
  );
}
