import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiSearchBar,
  EuiSpacer,
  EuiTableFieldDataColumnType,
} from '@elastic/eui';
import { memo, useCallback, useMemo, useState } from 'react';
import { Filters } from './components/FilterControls';
import { renderCellType, renderWidth } from './renders';
import { cn } from '../../utils';
import { usePagination } from './hooks/usePagination';
import { useDidMountEffect } from '../../hooks/useDidMountEffect';
import { LoadingPrompt } from '../LoadingPrompt';
import { genericTableRow, ITableProps } from './types';
import { page_size } from '../../constants/table';
import { threatIntelligenceTableParams } from '../../types/threat-intelligence';


const TableComponent = ({
  filterable,
  hasPagination = true,
  expanded = false,
  searchable = false,
  isLoading,
  columns,
  rows,
  total,
  last_row_cursor,
  uniqueKey = "id",
  onClick,
  onSetFilter
}: ITableProps) => {
  const { length, lastCursor, prevCursor, nextCursor, clearCursor } = usePagination();
  const [selectedId, setSelectedId] = useState<string>('');
  const [query, setQuery] = useState('')

  const memoizedPageCount = useMemo(() => {
    return Math.ceil(total / page_size);
  }, [total])

  const filters = useMemo(() => {
    return Object.keys(columns).filter((key) => columns[key].filter !== null).map((item) => columns[item])
  }, [columns])

  const handleSelectId = useCallback((id: string) => {
    setSelectedId(id);
  }, [])

  const fillColumns = useCallback(
    () => {
      const refilled_columns: Array<EuiBasicTableColumn<genericTableRow<unknown>>> = [];
      if (rows.length) {
        let id: string;
        Object.keys(columns).map((key) => {
          refilled_columns.push(
            {
              field: key,
              name: columns[key].name,
              truncateText: true,
              width: renderWidth(columns[key].type, expanded),
              align: columns[key].type === 'action' ? 'right' : 'left',
              render: (item: genericTableRow<unknown>) => {
                if (key === uniqueKey)
                  id = item as unknown as string;
                return <>
                  {renderCellType(columns[key].type, item, id, selectedId, handleSelectId, onClick)}
                </>
              },
            },
          )
        })
      }
      return refilled_columns;
    }, [columns, expanded, handleSelectId, onClick, rows.length, selectedId, uniqueKey])

  useDidMountEffect(() => {
    if (onSetFilter) {
      onSetFilter({
        cursor: lastCursor
      })
    }
  }, [lastCursor])

  const getCellProps = (
    row: genericTableRow<unknown>,
    column: EuiTableFieldDataColumnType<genericTableRow<unknown>>
  ) => {
    const { _id } = row;
    const { field } = column;

    return {
      className: cn(
        field !== 'actions' && '!cursor-pointer',
      ),
      'rows-subj': `cell-${row[uniqueKey]}-${String(field)}`,
      textOnly: true,
      onClick: () => {
        if (onClick && (field !== 'actions')) {
          onClick((row[uniqueKey] as string || _id as string), 'flyout');
        }
      },
    };
  };

  const handleMoveNext = useCallback(
    () => {
      nextCursor(last_row_cursor)
    }, [last_row_cursor, nextCursor])

  const handleMovePrev = useCallback(
    () => {
      prevCursor()
    }, [prevCursor])

  const handleSetFilter = useCallback(
    (tableParams: threatIntelligenceTableParams) => {
      if (onSetFilter) {
        onSetFilter(tableParams)
        clearCursor()
      }
    }, [clearCursor, onSetFilter])

  const searchedRows = useMemo(() => {
    if (!query.trim()) return rows
    const q = query.toLowerCase()
    return rows.filter((row: Record<string, unknown>) =>
      Object.values(row).some((value) =>
        typeof value === "string" && value.toLowerCase().includes(q)
      )
    )
  }, [rows, query])

  const onSearchChange = ({ queryText }: { queryText: string }) => {
    setQuery(queryText)
  }

  return (
    <>
      {
        filterable && onSetFilter &&
        <>
          <Filters
            filters={filters}
            onSelectFilter={handleSetFilter}
            handleMoveNext={handleMoveNext}
            handleMovePrev={handleMovePrev}
            pageCount={memoizedPageCount}
            length={length}
            total={total}
            page_size={page_size}
            hasPagination={hasPagination}
          />
          <EuiSpacer />
        </>
      }
      {searchable && (
        <>
          <EuiSearchBar
            box={{ incremental: true }}
            onChange={onSearchChange}
            query={query}
          />
          <EuiSpacer />
        </>
      )}
      {
        isLoading ? <LoadingPrompt size='xl' /> :
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <div style={{ minWidth: '100%' }}>
              <EuiBasicTable
                tableCaption="table"
                items={searchable ? searchedRows : rows}
                rowHeader="id"
                columns={fillColumns()}
                cellProps={getCellProps}
              />
            </div>
          </div>
      }
    </>
  );
};

export const Table = memo(TableComponent)