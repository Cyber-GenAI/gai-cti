import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiMarkdownFormat, EuiPagination, EuiPanel, EuiTitle, EuiToolTip } from '@elastic/eui';
import { useFeeds } from '../../../../../context/feeds/feeds-context';
import { Table } from '../../../../../components';
import { useEffect } from 'react';
import { usePagination } from '../../../../logs/hooks/usePagination';
import { page_size } from '../../../../../constants/table';

interface FeedOrganizationTableProps {
  onOpenFlyout: (id: string) => void
}

const FeedOrganizationTable = ({
  onOpenFlyout
}: FeedOrganizationTableProps) => {
  const { feedsSecondTable, getFeedSecondTable } = useFeeds();
  const { currentPage, pageCount, paginatedItems, setCurrentPage } = usePagination(feedsSecondTable.data?.rows ?? [], page_size);


  useEffect(() => {
    if (!feedsSecondTable.data) {
      getFeedSecondTable()
    }
  }, [feedsSecondTable.data, getFeedSecondTable])

  return (
    <EuiFlexItem>
      <EuiPanel color='transparent'>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiFlexGroup justifyContent="spaceBetween">
              <EuiFlexGroup gutterSize="s" alignItems="center" justifyContent="flexStart">
                <EuiFlexItem grow={false}>
                  <EuiTitle size="xs">
                    <h4>Organizations</h4>
                  </EuiTitle>
                </EuiFlexItem>
                {
                  !!feedsSecondTable.data?.description?.length &&
                  <EuiFlexItem grow={false}>
                    <EuiToolTip content={
                      <EuiPanel hasShadow={false} className="!w-full !bg-transparent !max-h-96 eui-scrollBar">
                        <EuiMarkdownFormat className="!text-white">{feedsSecondTable.data?.description}</EuiMarkdownFormat>
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
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <Table
              rows={paginatedItems ?? []}
              columns={feedsSecondTable?.data?.columns ?? {}}
              total={feedsSecondTable?.data?.total ?? -1}
              isLoading={feedsSecondTable.isLoading}
              filterable={feedsSecondTable?.data?.filterable ?? false}
              description={feedsSecondTable.data?.description}
              onClick={onOpenFlyout}
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

export default FeedOrganizationTable