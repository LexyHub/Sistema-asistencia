import { useState, useEffect } from 'react';

/**
 * Custom hook for handling pagination
 * @param {Array} data - The full data array to paginate
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Object} Pagination controls and current page data
 */
const usePagination = (data = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    // Reset to first page when data changes
    setCurrentPage(1);
  }, [data]);

  useEffect(() => {
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedData(data.slice(startIndex, endIndex));
  }, [data, currentPage, itemsPerPage]);

  // Go to specific page
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    hasPrevPage: currentPage > 1,
    hasNextPage: currentPage < totalPages
  };
};

export default usePagination;
