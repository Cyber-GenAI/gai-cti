import { EuiButton, EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiMarkdownFormat, EuiPagination, EuiPanel, EuiTitle, EuiToolTip } from '@elastic/eui';
import { useEffect } from 'react';
import { Table } from '../../../../../components';
import { page_size } from '../../../../../constants/table';
import { useFeeds } from '../../../../../context/feeds/feeds-context';
import { usePagination } from '../../../../logs/hooks/usePagination';

interface FeedConnectorsTableProps {
  isLoading: boolean
  onCleanUp: () => void
  onTableAction: (key: string | Record<string, string>, type?: string) => void
}


const FeedConnectorsTable = ({
  isLoading,
  onCleanUp,
  onTableAction
}: FeedConnectorsTableProps) => {
  const { feedsTable, getFeedTable } = useFeeds();
  const { currentPage, pageCount, paginatedItems, setCurrentPage } = usePagination(feedsTable.data?.rows ?? [], page_size);

  useEffect(() => {
    if (!feedsTable.data) { 
      getFeedTable()
    }
  }, [feedsTable.data, getFeedTable])

  return (
    <EuiFlexItem>
      <EuiPanel color='transparent'>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiFlexGroup justifyContent="spaceBetween">
              <EuiFlexGroup gutterSize="s" alignItems="center" justifyContent="flexStart">
                <EuiFlexItem grow={false}>
                  <EuiTitle size="xs">
                    <h4>Connectors</h4>
                  </EuiTitle>
                </EuiFlexItem>
                {
                  !!feedsTable.data?.description?.length &&
                  <EuiFlexItem grow={false}>
                    <EuiToolTip content={
                      <EuiPanel hasShadow={false} className="!w-full !bg-transparent !max-h-96 eui-scrollBar">
                        <EuiMarkdownFormat className="!text-white">{feedsTable.data?.description}</EuiMarkdownFormat>
                      </EuiPanel>
                    }>
                      <EuiButtonIcon
                        iconType="iInCircle"
                        aria-label={"iInCircle"}
                      />
                    </EuiToolTip>
                  </EuiFlexItem>
                }
              </EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <EuiToolTip content="Remove inactive connectors.">
                  <EuiButton isLoading={isLoading} onClick={onCleanUp} >
                    Clean Up
                  </EuiButton>
                </EuiToolTip>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <Table
              rows={paginatedItems ?? []}
              columns={feedsTable?.data?.columns ?? {}}
              total={feedsTable?.data?.total ?? -1}
              isLoading={feedsTable.isLoading}
              filterable={feedsTable?.data?.filterable ?? false}
              description={feedsTable.data?.description}
              uniqueKey="path"
              onClick={(key, type) => onTableAction(key, type)}
              last_row_cursor={""}
              searchable
            />
            <EuiPagination
              pageCount={pageCount}
              activePage={currentPage}
              onPageClick={(pageIndex) => setCurrentPage(pageIndex)}
              aria-label="pagination"
              className="!w-full !justify-end !py-2"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </EuiFlexItem>
    )
}

export default FeedConnectorsTable