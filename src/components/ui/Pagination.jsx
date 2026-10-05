import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("start");

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < total - 1) items.push("end");

  items.push(total);
  return items;
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pages">
      <button
        type="button"
        className="pagination-button"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {getPageItems(page, totalPages).map((item) =>
        typeof item === "string" ? (
          <span key={item} className="pagination-ellipsis">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`pagination-button ${item === page ? "active" : ""}`}
            onClick={() => onPage(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        className="pagination-button"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export default Pagination;