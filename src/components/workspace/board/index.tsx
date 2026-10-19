"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useInitializeBoardData } from "@/hooks/use-initialize-board";
import type { SimplifiedBoard } from "@/lib/types/stores/board";
import type { SimplifiedColumn } from "@/lib/types/stores/column";
import type { ClientTask } from "@/lib/types";
import type { Priority } from "@prisma/client";
import {
  type BoardFilters,
  areBoardFiltersEqual,
  getBoardFilterKey,
} from "@/lib/types/stores/task";
import { useTaskStore } from "@/stores/task";
import { getFilteredBoardTasksAction } from "@/actions/task";
import { cn } from "@/lib/utils";
import BoardHeader from "./board-header";
import ColumnsWrapper from "../column";
import BoardContainer from "./board-container";
import TaskModal from "../task/task-modal";

const VALID_PRIORITIES = new Set(["low", "medium", "high"]);

function parseFiltersFromSearchParams(searchParams: URLSearchParams): BoardFilters {
  const priorityParam = searchParams.get("priority") || searchParams.get("priorities");
  const tagsParam = searchParams.get("tags") || searchParams.get("tag");

  const priorities = priorityParam
    ? (priorityParam
        .split(",")
        .map((p) => p.trim().toLowerCase())
        .filter((p) => VALID_PRIORITIES.has(p)) as Priority[])
    : [];

  const tags = tagsParam
    ? tagsParam
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return { priorities, tags };
}

type BoardLayoutProps = {
  initialBoard: SimplifiedBoard & {
    columns: (SimplifiedColumn & {
      tasks: ClientTask[];
      totalCount: number;
      nextCursor: string | null;
    })[];
  };
  linkedTask?: ClientTask | null;
  focusedTaskId?: string;
  animateEntry?: boolean;
  clearEntryQuery?: boolean;
  renderContainer?: boolean;
};

export default function BoardLayout({
  initialBoard,
  linkedTask,
  focusedTaskId,
  animateEntry = false,
  clearEntryQuery = false,
  renderContainer = true,
}: BoardLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hasInitializedTaskPages } = useInitializeBoardData(initialBoard);
  const [isLinkedTaskOpen, setIsLinkedTaskOpen] = useState(Boolean(linkedTask));

  const [filters, setFilters] = useState<BoardFilters>(() =>
    parseFiltersFromSearchParams(new URLSearchParams(searchParams.toString())),
  );

  const {
    replaceBoardTaskPages,
    restoreBoardFilterFromCache,
    setBoardPagesLoading,
  } = useTaskStore(
    useShallow((state) => ({
      replaceBoardTaskPages: state.replaceBoardTaskPages,
      restoreBoardFilterFromCache: state.restoreBoardFilterFromCache,
      setBoardPagesLoading: state.setBoardPagesLoading,
    })),
  );

  const handleFiltersChange = (newFilters: BoardFilters) => {
    setFilters(newFilters);

    const params = new URLSearchParams(window.location.search);
    if (newFilters.priorities.length > 0) {
      params.set("priority", newFilters.priorities.join(","));
    } else {
      params.delete("priority");
      params.delete("priorities");
    }

    if (newFilters.tags.length > 0) {
      params.set("tags", newFilters.tags.join(","));
    } else {
      params.delete("tags");
      params.delete("tag");
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    window.history.replaceState(null, "", newUrl);
  };

  useEffect(() => {
    const onPopState = () => {
      const urlFilters = parseFiltersFromSearchParams(
        new URLSearchParams(window.location.search),
      );
      setFilters(urlFilters);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const inFlightFilterKeyRef = useRef<string | null>(null);

  const filterKey = getBoardFilterKey(filters);
  const activeFilterKeyRef = useRef(filterKey);
  useEffect(() => {
    activeFilterKeyRef.current = filterKey;
  });

  useEffect(() => {
    if (!hasInitializedTaskPages) return;

    const columnIds = initialBoard.columns.map((c) => c.id);
    const pages = useTaskStore.getState().columnPages;
    const allAlreadyFiltered = columnIds.every(
      (colId) =>
        pages[colId] && areBoardFiltersEqual(pages[colId].filter, filters),
    );
    if (allAlreadyFiltered) return;

    if (inFlightFilterKeyRef.current === filterKey) return;

    const restored = restoreBoardFilterFromCache(columnIds, filters);
    if (restored) return;

    const isClearing = filterKey === "p:|t:";
    const delay = isClearing ? 0 : 250;
    const targetKey = filterKey;
    const targetFilters = filters;

    const loadBoardFilteredPages = async () => {
      inFlightFilterKeyRef.current = targetKey;
      setBoardPagesLoading(columnIds, true);

      try {
        const result = await getFilteredBoardTasksAction(
          initialBoard.id,
          targetFilters.priorities,
          targetFilters.tags,
        );

        if (useTaskStore.getState().activeBoardId !== initialBoard.id) return;
        if (activeFilterKeyRef.current !== targetKey) return;

        if (!result.success || !result.fields) {
          setBoardPagesLoading(columnIds, false);
          return;
        }

        replaceBoardTaskPages(result.fields, targetFilters, columnIds);
      } catch {
        if (activeFilterKeyRef.current === targetKey) {
          setBoardPagesLoading(columnIds, false);
        }
      } finally {
        if (inFlightFilterKeyRef.current === targetKey) {
          inFlightFilterKeyRef.current = null;
        }
      }
    };

    const timer = setTimeout(() => {
      void loadBoardFilteredPages();
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [
    filterKey,
    filters,
    hasInitializedTaskPages,
    initialBoard.columns,
    initialBoard.id,
    replaceBoardTaskPages,
    restoreBoardFilterFromCache,
    setBoardPagesLoading,
  ]);

  const isFiltersPending = useTaskStore((state) => {
    if (!hasInitializedTaskPages || state.activeBoardId !== initialBoard.id)
      return false;

    return initialBoard.columns.some((col) => {
      const page = state.columnPages[col.id];
      return !page || !areBoardFiltersEqual(page.filter, filters) || page.isLoading;
    });
  });

  const handleTagClick = (tag: string) => {
    const isSelected = filters.tags.includes(tag);
    const newTags = isSelected
      ? filters.tags.filter((t: string) => t !== tag)
      : [...filters.tags, tag];
    handleFiltersChange({
      ...filters,
      tags: newTags,
    });
  };

  useEffect(() => {
    if (animateEntry || clearEntryQuery) {
      const params = new URLSearchParams(window.location.search);
      params.delete("new");
      params.delete("created");
      const query = params.toString();
      const cleanUrl = query ? `${pathname}?${query}` : pathname;
      window.history.replaceState(null, "", cleanUrl);
    }
  }, [animateEntry, clearEntryQuery, pathname]);

  const boardContent = (
    <>
      <BoardHeader
        board={initialBoard}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isFiltersPending={isFiltersPending}
      />
      <ColumnsWrapper
        boardId={initialBoard.id}
        focusedTaskId={focusedTaskId}
        animateEntry={animateEntry}
        initialColumns={initialBoard.columns}
        filters={filters}
        onTagClick={handleTagClick}
      />
      {linkedTask && initialBoard.id && (
        <TaskModal
          mode="edit"
          task={linkedTask}
          columnId={linkedTask.columnId}
          open={isLinkedTaskOpen}
          onOpenChange={setIsLinkedTaskOpen}
        />
      )}
    </>
  );

  if (renderContainer) {
    return <BoardContainer>{boardContent}</BoardContainer>;
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-1 flex-col",
        animateEntry &&
          "animate-in fade-in-0 duration-300 ease-out motion-reduce:animate-none",
      )}
    >
      {boardContent}
    </div>
  );
}
