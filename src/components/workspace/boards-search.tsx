"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BoardsSearch() {
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

  const updateQuery = (value: string) => {
    hasPendingLocalQuery.current = true;
    setQuery(value);
  };

  const clearSearch = () => {
    updateQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative mb-5 shrink-0 sm:mb-6">
      <label htmlFor="boards-search" className="sr-only">
        Search boards
      </label>
      <div className="border-border/80 bg-card/60 hover:border-primary/40 focus-within:border-primary/50 focus-within:ring-primary/20 relative flex h-11 w-full items-center rounded-md border shadow-xs transition-all focus-within:ring-1">
        <div className="text-muted-foreground pointer-events-none pl-3.5 pr-2.5">
          {isPending ? (
            <LoaderCircle
              className="size-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Search
              className="size-4"
              aria-hidden="true"
            />
          )}
        </div>
        <input
          ref={inputRef}
          id="boards-search"
          type="search"
          value={query}
          maxLength={100}
          placeholder="Search boards by name or description..."
          className="placeholder:text-muted-foreground/70 h-full w-full bg-transparent pr-3.5 text-sm outline-none [&::-webkit-search-cancel-button]:hidden"
          aria-busy={isPending}
          onChange={(event) => updateQuery(event.target.value)}
        />
        {query && (
          <div className="flex shrink-0 items-center pr-2.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-accent/70 size-7 rounded-lg"
              aria-label="Clear board search"
              onClick={clearSearch}
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </div>
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {isPending ? "Searching boards" : "Board search updated"}
      </span>
    </div>
  );
}
