
import { useState } from 'react';

export const usePagination = <T,>(items: T[], pageSize: number) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageCount = Math.ceil(items.length / pageSize);
  const paginatedItems = items.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return {
    paginatedItems,
    currentPage,
    setCurrentPage,
    pageCount,
  };
};
