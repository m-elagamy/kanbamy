"use client";

import { Plus } from "lucide-react";
import type { BoardSummary } from "@/lib/types";
import { getBoardIdentity } from "@/lib/utils/board-identity";
import BoardActions from "./board-actions";
import { BoardFilter } from "./board-filter";
import { BoardSearch } from "./board-search";
import TaskModal from "../task/task-modal";
import { Button } from "@/components/ui/button";
import type { BoardFilters } from "@/lib/types/stores/task";
import TagBadge from "../task/tag-badge";
import { BOARD_TAG_OPTIONS, isBoardTag } from "../data/board-tags";
import useBoardStore from "@/stores/board";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MOBILE_MAX_VISIBLE_TAGS = 2;
const DESKTOP_MAX_VISIBLE_TAGS = 3;

type BoardHeaderProps = {
  board: BoardSummary;
  filters: BoardFilters;
  onFiltersChange: (filters: BoardFilters) => void;
  isFiltersPending?: boolean;
};

const BoardHeader = ({
  board,
  filters,
  onFiltersChange,
  isFiltersPending = false,
}: BoardHeaderProps) => {
  const storeBoard = useBoardStore((state) =>
    board.id ? state.boards[board.id] : null,
  );
  const currentBoard = storeBoard ?? board;
  const identity = getBoardIdentity(currentBoard.title, currentBoard.id);
  const validTags = Array.from(new Set(currentBoard.tags ?? [])).filter(isBoardTag);

  const mobileOverflowCount = validTags.length - MOBILE_MAX_VISIBLE_TAGS;
  const mobileHiddenLabels =
    mobileOverflowCount > 0
      ? validTags
          .slice(MOBILE_MAX_VISIBLE_TAGS)
          .map((tag) => BOARD_TAG_OPTIONS[tag]?.label ?? tag)
          .join(", ")
      : undefined;

  const desktopOverflowCount = validTags.length - DESKTOP_MAX_VISIBLE_TAGS;
  const desktopHiddenLabels =
    desktopOverflowCount > 0
      ? validTags
          .slice(DESKTOP_MAX_VISIBLE_TAGS)
          .map((tag) => BOARD_TAG_OPTIONS[tag]?.label ?? tag)
          .join(", ")
      : undefined;

  return (
    <section className="border-border/50 bg-background/95 supports-backdrop-filter:bg-background/60 mb-4 shrink-0 border-b backdrop-blur">
      <div className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-h-14 min-w-0 items-start gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span
              className={`${identity.className} mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-base font-semibold`}
              aria-hidden="true"
            >
              {identity.initial}
            </span>
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="max-w-full truncate text-[clamp(1.25rem,2vw,1.5rem)] leading-tight font-semibold capitalize">
                  {currentBoard.title?.replace(/-/g, " ")}
                </h1>
                {validTags.length > 0 && (
                  <div
                    className="flex flex-wrap items-center gap-1.5"
                    aria-label="Board tags"
                  >
                    {validTags.slice(0, MOBILE_MAX_VISIBLE_TAGS).map((tag) => (
                      <TagBadge
                        key={tag}
                        tag={tag}
                        option={BOARD_TAG_OPTIONS[tag]}
                        size="sm"
                      />
                    ))}

                    {validTags
                      .slice(MOBILE_MAX_VISIBLE_TAGS, DESKTOP_MAX_VISIBLE_TAGS)
                      .map((tag) => (
                        <TagBadge
                          key={tag}
                          tag={tag}
                          option={BOARD_TAG_OPTIONS[tag]}
                          size="sm"
                          className="hidden sm:inline-flex"
                        />
                      ))}

                    {mobileOverflowCount > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="border-border/70 bg-muted/60 text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex cursor-pointer items-center rounded-md border px-1.5 py-0.5 text-[0.6875rem] font-medium transition-colors sm:hidden"
                            aria-label={`${mobileOverflowCount} more tags: ${mobileHiddenLabels}`}
                            title={mobileHiddenLabels}
                          >
                            +{mobileOverflowCount}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          side="bottom"
                          align="start"
                          sideOffset={6}
                          className="w-auto max-w-64 p-2 shadow-md"
                        >
                          <div className="flex flex-wrap gap-1.5">
                            {validTags.slice(MOBILE_MAX_VISIBLE_TAGS).map((tag) => (
                              <TagBadge
                                key={tag}
                                tag={tag}
                                option={BOARD_TAG_OPTIONS[tag]}
                                size="sm"
                              />
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                    {desktopOverflowCount > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="border-border/70 bg-muted/60 text-muted-foreground hover:bg-accent hover:text-accent-foreground hidden cursor-pointer items-center rounded-md border px-1.5 py-0.5 text-[0.6875rem] font-medium transition-colors sm:inline-flex"
                            aria-label={`${desktopOverflowCount} more tags: ${desktopHiddenLabels}`}
                            title={desktopHiddenLabels}
                          >
                            +{desktopOverflowCount}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          side="bottom"
                          align="start"
                          sideOffset={6}
                          className="w-auto max-w-64 p-2 shadow-md"
                        >
                          <div className="flex flex-wrap gap-1.5">
                            {validTags.slice(DESKTOP_MAX_VISIBLE_TAGS).map((tag) => (
                              <TagBadge
                                key={tag}
                                tag={tag}
                                option={BOARD_TAG_OPTIONS[tag]}
                                size="sm"
                              />
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                )}
              </div>
              {currentBoard.description && (
                <p
                  className="text-muted-foreground mt-1 max-w-full truncate text-sm"
                  title={currentBoard.description}
                >
                  {currentBoard.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-[1fr_auto] items-center justify-between gap-2 sm:flex sm:items-center sm:gap-2.5 xl:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:contents">
            <BoardFilter
              filters={filters}
              onFiltersChange={onFiltersChange}
              isPending={isFiltersPending}
              mobileCompact
            />
            <BoardSearch boardId={currentBoard.id} enableShortcut mobileCompact />
            {currentBoard.id && (
              <TaskModal
                mode="create"
                boardId={currentBoard.id}
                trigger={
                  <Button
                    className="max-[639px]:size-9 max-[639px]:shrink-0 max-[639px]:gap-0 max-[639px]:p-0"
                    aria-label="Add task"
                  >
                    <Plus size={16} />
                    <span className="max-[639px]:hidden">Add task</span>
                  </Button>
                }
              />
            )}
          </div>
          <div className="shrink-0">
            <BoardActions board={currentBoard} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardHeader;
