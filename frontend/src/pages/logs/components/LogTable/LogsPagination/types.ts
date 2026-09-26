 export interface LogsPaginationProps {
    pageCount: number;
    currentPage: number;
    onPageChange: (pageIndex: number) => void;
  }