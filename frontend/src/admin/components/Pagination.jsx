import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalItems, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-300">
      <span>
        Page {page} of {totalPages} ({totalItems} items)
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
