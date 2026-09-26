import {
  EuiMarkdownFormat,
  EuiPanel,
  EuiPagination,
  EuiSearchBar,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui'
import { memo, useCallback, useMemo, useState } from 'react'
import { genericTable, Table } from '../../../../../components'
import { adversarySection } from '../../../../../types/adversaries'

interface AdversaryTableProps {
  section: adversarySection
  onClickAdversariesDetail: (path: string) => void
}

const AdversaryTableComponent = ({
  section,
  onClickAdversariesDetail
}: AdversaryTableProps) => {
  const [pageIndex, setPageIndex] = useState(0)
  const [query, setQuery] = useState('')
  const rowsPerPage = 10

  const rows = useMemo(() => (section.type === 'Table' && typeof section.data !== 'string')
    ? section.data.rows ?? []
    : [], [section.data, section.type])

  const columns =
    ((section.type === 'Table' && typeof section.data !== 'string')
      ? (section.data.columns)
      : []) as unknown as genericTable<unknown>['columns']

  const filteredRows = useMemo(() => {
    if (!query.trim()) return rows
    const q = query.toLowerCase()
    return rows.filter((row: Record<string, unknown>) =>
      Object.values(row).some((value) =>
        typeof value === "string" && value.toLowerCase().includes(q)
      )
    )
  }, [rows, query])

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage)
  const pagedRows = filteredRows.slice(
    pageIndex * rowsPerPage,
    (pageIndex + 1) * rowsPerPage
  )

  const handleTableAction = useCallback((key: string | Record<string, string>, type?: string) => {
    if (typeof key === "string" && type === "flyout") {
      onClickAdversariesDetail(key);
    } else if (typeof key === "object" && type && key[type]) {
      onClickAdversariesDetail(key[type]);
    }
  }, [onClickAdversariesDetail]);

  const onSearchChange = ({ queryText }: { queryText: string }) => {
    setQuery(queryText)
    setPageIndex(0)
  }

  return (
    <EuiPanel color="plain" hasBorder paddingSize="none">
      {section.type !== 'Table' || typeof section.data === 'string' ? (
        <EuiMarkdownFormat>{String(section.data)}</EuiMarkdownFormat>
      ) : (
        <EuiFlexGroup direction="column" gutterSize="s">
          <EuiFlexItem>
            <EuiSearchBar
              box={{ incremental: true }}
              onChange={onSearchChange}
              query={query}
            />
          </EuiFlexItem>

          <EuiFlexItem>
            <Table
              rows={pagedRows}
              columns={columns}
              filterable={section.data.filterable ?? false}
              hasPagination={false}
              isLoading={false}
              expanded
              onClick={(key, type) => handleTableAction(key, type)}
              uniqueKey="path"
              last_row_cursor=""
              total={filteredRows.length}
            />
          </EuiFlexItem>

            <EuiFlexItem>
              <div className="p-2 flex justify-center">
                <EuiPagination
                  pageCount={totalPages}
                  activePage={pageIndex}
                  onPageClick={(page) => setPageIndex(page)}
                />
              </div>
            </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </EuiPanel>
  )
}

export const AdversaryTable = memo(AdversaryTableComponent)
