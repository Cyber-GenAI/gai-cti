import { memo, useEffect, useMemo } from 'react'
import { genericTable, genericTableRow, Table } from '../../../../../../components'
import { column } from '../constants'
import { EuiPagination, EuiPanel } from '@elastic/eui';
import { usePagination } from '../../../../../rules/hooks/usePagination';

interface IAlertDetailLogsTableProps {
  data: unknown[];
  isLoading: boolean;
  selectRow: (id: string) => void;
}

const PAGE_SIZE = 7;

const AlertDetailLogsTableComponent = ({
  data,
  isLoading,
  selectRow,
}: IAlertDetailLogsTableProps) => {
  const { currentPage, handlePageChange, setPageConfig, totalPage } = usePagination()

  const memoizedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [currentPage, data]);
  
  useEffect(() => {
    if (data) {
      setPageConfig(currentPage, PAGE_SIZE, data.length);
    }
  }, [currentPage, data, setPageConfig]);

  const handleSelectRow = (id: string) => {
    const selectedRow = memoizedRows.find((item) => (item as {_id: string})._id === id)
    selectRow(JSON.stringify((selectedRow as { _source: unknown})._source, null, 2))
  }

  return (
    <EuiPanel>
      <Table
        columns={column as unknown as genericTable<unknown>["columns"]}
        rows={(memoizedRows as unknown as genericTableRow<unknown>[]) ?? []}
        total={memoizedRows?.length ?? 0}
        onClick={handleSelectRow}
        isLoading={isLoading}
        filterable={false}
        hasPagination={false}
        last_row_cursor=""
      />
        <EuiPagination
          pageCount={totalPage}
          activePage={currentPage}
          onPageClick={(pageIndex) => handlePageChange(pageIndex)}
          aria-label="pagination"
          className="!w-full !justify-end !py-2"
        />
    </EuiPanel>
  )
}

export const AlertDetailLogsTable = memo(AlertDetailLogsTableComponent)