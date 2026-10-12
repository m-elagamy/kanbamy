import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  ariaLabel: string;
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

function paginationItems(currentPage: number, totalPages: number) {
  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const visiblePages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return visiblePages.flatMap<number | string>((page, index) => {
    const previousPage = visiblePages[index - 1];
    return previousPage && page - previousPage > 1
      ? [`ellipsis-${previousPage}`, page]
      : [page];
  });
}

export default function Pagination({
  ariaLabel,
  currentPage,
  totalPages,
  hrefForPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageItems = paginationItems(currentPage, totalPages);

  return (
    <nav
      aria-label={ariaLabel}
      className="mt-5 flex shrink-0 items-center justify-center gap-1"
    >
      <Link
        href={hrefForPage(currentPage - 1)}
        aria-disabled={currentPage <= 1}
        tabIndex={currentPage <= 1 ? -1 : undefined}
        className={`mr-1 flex size-8 items-center justify-center rounded-md ${currentPage <= 1 ? "text-muted-foreground/40 pointer-events-none" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"}`}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Link>
      {pageItems.map((item) =>
        typeof item === "number" ? (
          <Link
            key={item}
            href={hrefForPage(item)}
            aria-current={item === currentPage ? "page" : undefined}
            aria-label={`Page ${item}`}
            className={`flex size-8 items-center justify-center rounded-md text-sm transition-colors ${item === currentPage ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
          >
            {item}
          </Link>
        ) : (
          <span
            key={item}
            aria-hidden="true"
            className="text-muted-foreground flex size-8 items-center justify-center text-sm"
          >
            …
          </span>
        ),
      )}
      <Link
        href={hrefForPage(currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        tabIndex={currentPage >= totalPages ? -1 : undefined}
        className={`ml-1 flex size-8 items-center justify-center rounded-md ${currentPage >= totalPages ? "text-muted-foreground/40 pointer-events-none" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"}`}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </nav>
  );
}
