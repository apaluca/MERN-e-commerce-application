import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 30, 40],
  itemsLabel = "items",
}) => {
  const pageNumbers = [];

  // Create page number array based on total pages
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Calculate start/end for visible page numbers (show 5 at a time)
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  // Adjust if we're near the end
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  const visiblePageNumbers = pageNumbers.slice(startPage - 1, endPage);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-8 bg-white p-4 rounded-lg shadow-sm">
      {/* Items per page control - Always visible */}
      <div className="mb-4 sm:mb-0">
        <label htmlFor="itemsPerPage" className="text-sm text-gray-700 mr-2">
          {`${itemsLabel.charAt(0).toUpperCase() + itemsLabel.slice(1)} per page:`}
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination buttons - Only visible when multiple pages */}
      {totalPages > 1 ? (
        <>
          <div className="flex items-center">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 mx-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Go to first page"
            >
              &laquo;
            </button>

            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 mx-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Go to previous page"
            >
              &lsaquo;
            </button>

            {startPage > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="px-3 py-1 mx-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                >
                  1
                </button>
                {startPage > 2 && <span className="mx-1">...</span>}
              </>
            )}

            {visiblePageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => onPageChange(number)}
                className={`px-3 py-1 mx-1 border rounded text-sm ${
                  currentPage === number
                    ? "bg-blue-500 text-white border-blue-500"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {number}
              </button>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="mx-1">...</span>}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="px-3 py-1 mx-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 mx-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Go to next page"
            >
              &rsaquo;
            </button>

            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 mx-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Go to last page"
            >
              &raquo;
            </button>
          </div>

          <div className="hidden sm:block text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </>
      ) : (
        <div className="hidden sm:block text-sm text-gray-500">
          Showing all {itemsLabel}
        </div>
      )}
    </div>
  );
};

export default Pagination;
