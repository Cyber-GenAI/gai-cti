import { useCallback, useMemo, useState } from "react";
import { page_size } from "../../../constants/table";

export const usePagination = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentPageSize, setCurrentPageSize] = useState<number>(page_size);
  const [totalItem, setTotalItem] = useState<number>(0);

  const totalPage = useMemo(() => Math.ceil((totalItem + 1) / currentPageSize), [totalItem, currentPageSize])

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    }, [])

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setCurrentPageSize(size);
    }, [])

  const setPageConfig = useCallback(
    (page: number, pageSize: number, total: number) => {
      setCurrentPage(page);
      setCurrentPageSize(pageSize);
      setTotalItem(total);
    }, [])

  return {
    currentPage,
    totalPage,
    setPageConfig,
    handlePageChange,
    handlePageSizeChange,
  };
}