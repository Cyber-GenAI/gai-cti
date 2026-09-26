import { EuiPagination } from "@elastic/eui";
import { LogsPaginationProps } from "./types";

export const LogsPagination: React.FC<LogsPaginationProps> = ({
  pageCount,
  currentPage,
  onPageChange,
}) => {
  return (
    <EuiPagination
      pageCount={pageCount}
      activePage={currentPage}
      onPageClick={onPageChange}
    />
  );
};

