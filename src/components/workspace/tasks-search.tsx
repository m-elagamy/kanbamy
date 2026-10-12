"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TasksSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUrlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(currentUrlQuery);
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

  const clearSearch = () => updateQuery("");

  return (
    <div className="relative mb-4 shrink-0 sm:mb-5">
      <label htmlFor="tasks-search" className="sr-only">
        Search tasks
      </label>
      {isPending ? (
        <LoaderCircle
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin"
          aria-hidden="true"
        />
      ) : (
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
      )}
      <Input
        id="tasks-search"
        type="search"
        value={query}
        maxLength={100}
        placeholder="Search tasks..."
        className="pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden"
        aria-busy={isPending}
        onChange={(event) => updateQuery(event.target.value)}
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
          aria-label="Clear task search"
          onClick={clearSearch}
        >
          <X aria-hidden="true" />
        </Button>
      )}
      <span className="sr-only" aria-live="polite">
        {isPending ? "Searching tasks" : "Task search updated"}
      </span>
    </div>
  );
}
