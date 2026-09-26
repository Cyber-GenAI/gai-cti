import { EuiFlexGroup, EuiFlexItem, EuiPagination } from '@elastic/eui'
import { memo, useCallback, useMemo, useState } from 'react'
import AlertsGrouped from '.'
import { page_size } from '../../../../constants/table'
import { alertGrouped } from '../../../../types/alerts'
import { usePagination } from '../../../logs/hooks/usePagination'

interface AlertGroupsListProps {
  alertGroups: alertGrouped[]
  alertsGroupedBy: string
  openAlert: (id: string) => void
}

const AlertGroupsListComponent = ({
  alertGroups,
  alertsGroupedBy,
  openAlert,
}: AlertGroupsListProps) => {
  const [openedAlertGroup, setOpenedAlertGroup] = useState('')

  const sortedGroups = useMemo(() => {
    return [...alertGroups].sort((a, b) => {
      if (a.key === "NONE" && b.key !== "NONE") return -1;
      if (b.key === "NONE" && a.key !== "NONE") return 1;

      return a.key.localeCompare(b.key, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }, [alertGroups]);

  const {
    currentPage,
    pageCount,
    paginatedItems,
    setCurrentPage,
  } = usePagination(sortedGroups, page_size / 4);

  const handleOpenAlertGroup = useCallback((key: string) => {
    setOpenedAlertGroup((prev) => (prev === key ? "" : key));
  }, []);

  return (
    <EuiFlexGroup gutterSize="s" direction="column">
      {paginatedItems.map((row) => (
        <EuiFlexItem key={row.key}>
          <AlertsGrouped
            is_opened={row.key === openedAlertGroup}
            showDescription={alertsGroupedBy === "kibana.alert.rule.name"}
            alertsGroupedBy={alertsGroupedBy}
            alert_group={row}
            openAlert={handleOpenAlertGroup}
            selectRow={openAlert}
          />
        </EuiFlexItem>
      ))}
      <EuiPagination
        pageCount={pageCount}
        activePage={currentPage}
        onPageClick={(pageIndex) => setCurrentPage(pageIndex)}
        aria-label="pagination"
        className="!w-full !justify-end !py-2"
      />
    </EuiFlexGroup>
  )
}

export const AlertGroupsList = memo(AlertGroupsListComponent)