import { EuiBadge, EuiFlexGroup, EuiFlexItem, EuiHealth, EuiPagination, EuiPanel, EuiText, EuiTitle, IconColor } from '@elastic/eui';
import { useEffect } from 'react';
import { LoadingPrompt } from '../../../../components';
import { page_size } from '../../../../constants/table';
import { useAlert } from '../../../../context/alert/alert-context';
import { useDidMountEffect } from '../../../../hooks/useDidMountEffect';
import { alertGrouped } from '../../../../types/alerts';
import { usePagination } from '../../../rules/hooks/usePagination';
import { AlertsTable } from '../Table';

interface IAlertsGroupedProps {
  alert_group: alertGrouped,
  showDescription?: boolean,
  alertsGroupedBy: string
  is_opened: boolean
  isTI?: boolean
  openAlert: (id: string) => void
  selectRow: (id: string) => void
}

const health_colors: Record<string, IconColor> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "success",
};

const AlertsGrouped = ({
  alert_group,
  showDescription,
  alertsGroupedBy,
  is_opened,
  isTI,
  openAlert,
  selectRow,
}: IAlertsGroupedProps) => {

  const { currentPage, totalPage, setPageConfig, handlePageChange } = usePagination();
  const { alerts_table, getAlertsTable } = useAlert();

  useDidMountEffect(() => {
    if (!is_opened) return;

    if (alerts_table.data?.total != null) {
      setPageConfig(currentPage, page_size, alerts_table.data.total);
    }
  }, [alerts_table.data?.total, currentPage]);

  useEffect(() => {
    if (!is_opened) return;
    const filters =
      alertsGroupedBy !== "none"
        ? { field: alertsGroupedBy, value: alert_group.key }
        : undefined;

    getAlertsTable(undefined, currentPage, filters, isTI);
  }, [alert_group.key, alertsGroupedBy, currentPage, getAlertsTable, isTI, is_opened]);

  const renderFlatAlerts = () => {
    if (alerts_table.isLoading) {
      return (
        <EuiPanel hasBorder hasShadow={false}>
          <LoadingPrompt size="s" rows={5} />
        </EuiPanel>
      );
    }

    const rows = alerts_table.data?.rows ?? [];

    return (
      <EuiPanel hasBorder hasShadow={false}>
        <AlertsTable
          data={rows}
          selectRow={selectRow}
          isLoading={alerts_table.isLoading}
        />
        <EuiPagination
          pageCount={totalPage}
          activePage={currentPage - 1}
          onPageClick={(p) => handlePageChange(p + 1)}
          aria-label="Alerts pagination"
          className="!w-full !justify-end !py-2"
        />
      </EuiPanel>
    );
  };

  return (
    <EuiFlexGroup gutterSize='none' direction='column'>
      <EuiFlexItem onClick={() => openAlert(alert_group.key)} className='cursor-pointer'>
        <EuiPanel hasBorder>
          <EuiFlexGroup justifyContent='spaceBetween' alignItems='center'>
            <EuiFlexItem grow={5}>
              <EuiFlexGroup gutterSize='s' direction='column'>
                <EuiFlexItem>
                  <EuiTitle size='xs'>
                    <h2>{alert_group.key ?? "_"}</h2>
                  </EuiTitle>
                </EuiFlexItem>
                {
                  showDescription &&
                  <EuiFlexItem>
                    <EuiText size='s'>
                      <p>{alert_group?.description?.buckets[0]?.key}</p>
                    </EuiText>
                  </EuiFlexItem>
                }
                <EuiFlexItem></EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow={1} />
            <EuiFlexItem grow={3}>
              <EuiFlexGroup justifyContent='flexEnd'>
                <EuiFlexItem>
                  <EuiFlexGroup alignItems='center' gutterSize='s'>
                    <EuiFlexItem grow={false}>
                      severity:
                    </EuiFlexItem>
                    {alert_group.severitiesSubAggregation.buckets.map((severity, index) =>
                      <EuiFlexItem key={index} grow={false}>
                        <EuiHealth color={health_colors[severity.key]}>
                          {severity.key}
                        </EuiHealth>
                      </EuiFlexItem>
                    )}
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFlexGroup alignItems='center' gutterSize='s'>
                    <EuiFlexItem grow={false}>
                      rules:
                    </EuiFlexItem>
                    <EuiBadge>
                      {alert_group.ruleName.buckets.length}
                    </EuiBadge>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFlexGroup alignItems='center' gutterSize='s'>
                    <EuiFlexItem grow={false}>
                      hosts:
                    </EuiFlexItem>
                    <EuiBadge>
                      {alert_group.hostsCountAggregation.value}
                    </EuiBadge>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFlexGroup alignItems='center' gutterSize='s'>
                    <EuiFlexItem grow={false}>
                      users:
                    </EuiFlexItem>
                    <EuiBadge>
                      {alert_group.usersCountAggregation.value}
                    </EuiBadge>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFlexGroup alignItems='center' gutterSize='s'>
                    <EuiFlexItem grow={false}>
                      alerts:
                    </EuiFlexItem>
                    <EuiBadge >
                      {alert_group.doc_count}
                    </EuiBadge>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>
      {is_opened && renderFlatAlerts()}
    </EuiFlexGroup>
  )
}

export default AlertsGrouped