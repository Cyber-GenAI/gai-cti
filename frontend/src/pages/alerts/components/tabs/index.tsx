import {
  EuiButtonGroup,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPageSection,
  EuiPagination,
  EuiPanel,
  EuiSearchBar,
  EuiSearchBarOnChangeArgs,
  EuiSpacer,
} from "@elastic/eui";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { LoadingPrompt } from "../../../../components";
import { page_size } from "../../../../constants/table";
import { useAlert } from "../../../../context/alert/alert-context";
import { useDidMountEffect } from "../../../../hooks/useDidMountEffect";
import { usePagination } from "../../../rules/hooks/usePagination";
import {
  AlertsByNameTable,
  AlertsTable,
  SeverityPieChart,
  TopAlerts,
} from "../../components";
import { source_options } from "../../constants";
import { AlertGroupsList } from "../AlertsGrouped/group";
import { column } from "./../../components/Table/constants";

interface AlertsTabProps {
  variant: "all" | "ti";
  date: string;
}

const AlertsTabComponent = ({ variant, date }: AlertsTabProps) => {
  const isTI = variant === "ti";
  const navigate = useNavigate();
  const {
    alerts_by_name,
    severity_levels,
    top_alerts,
    alerts_table,
    alerts_grouped,
    getDashboard,
    getTopAlerts,
    getAlertsTable,
    getAlertsGrouped,
  } = useAlert();

  const [alerts_grouped_by, setAlerts_grouped_by] = useState<string>("none");
  const [topAlertsBy, setTopAlertsBy] = useState<string>("");
  const [opened_alert_group, setOpened_alert_group] = useState<string>("");
  const [searchName, setSearchName] = useState<string | undefined>()

  const { currentPage, totalPage, setPageConfig, handlePageChange } = usePagination();

  const alerts_groups = useMemo(
    () =>
      Object.entries(column)
        .filter(([, cfg]) => cfg.type !== "hidden" && cfg.type !== "date")
        .map(([id, cfg]) => ({
          label: cfg.name,
          id,
        })),
    []
  );

  const handleSelectAlert = useCallback(
    (id: string) => navigate(id),
    [navigate]
  );

  const handleSearchInput = useCallback(
    (event: EuiSearchBarOnChangeArgs) => {
      setSearchName(event.queryText);
      handlePageChange(1);
    },
    [handlePageChange]
  );

  const handleSelectAlertsGroupedBy = useCallback((value: string) => {
    setAlerts_grouped_by(value);
    setOpened_alert_group("");
    setSearchName("")
  }, []);

  const handleChangeTopAlertsField = useCallback(
    (field: string) => {
      setTopAlertsBy(field);
      getTopAlerts(field, isTI);
    },
    [getTopAlerts, isTI]
  );

  useEffect(() => {
    getDashboard(isTI);
  }, [getDashboard, isTI]);

  useEffect(() => {
    setAlerts_grouped_by("none");
    setOpened_alert_group("");
    getAlertsTable(undefined, 1, undefined, isTI, undefined);
  }, [date, isTI, getAlertsTable]);

  useEffect(() => {
    if (alerts_grouped_by === "none") {
      handlePageChange(1)
      getAlertsTable(undefined, 1, undefined, isTI, undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTI, alerts_grouped_by]);

  useDidMountEffect(() => {
    const filters =
      alerts_grouped_by !== "none"
        ? { field: alerts_grouped_by, value: opened_alert_group }
        : undefined;

    if (alerts_grouped_by !== "none") {
      getAlertsGrouped(alerts_grouped_by, isTI);
      getAlertsTable(undefined, 1, filters, isTI);
    } else {
      getAlertsTable(undefined, currentPage, undefined, isTI);
    }
  }, [alerts_grouped_by, opened_alert_group, isTI]);

  useDidMountEffect(() => {
    if (alerts_table.data?.total != null) {
      setPageConfig(currentPage, page_size, alerts_table.data.total);
    }
  }, [alerts_table.data?.total, currentPage]);

  useEffect(() => {
    if (alerts_grouped_by !== "none") return;
    getAlertsTable(undefined, currentPage, undefined, isTI, searchName);
  }, [currentPage, getAlertsTable, isTI, alerts_grouped_by, searchName]);

  const renderGroupedAlerts = () => {
    if (alerts_grouped.isLoading) {
      return <LoadingPrompt size="m" rows={3} />;
    }

    const data = alerts_grouped.data ?? [];

    if (data.length === 0) {
      return (
        <EuiPanel hasBorder hasShadow={false}>
          <LoadingPrompt size="s" rows={1} />
        </EuiPanel>
      );
    }

    return <AlertGroupsList
      alertGroups={data}
      alertsGroupedBy={alerts_grouped_by}
      openAlert={handleSelectAlert}
    />
   };

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
          selectRow={handleSelectAlert}
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

  const isSummaryLoading =
    severity_levels.isLoading ||
    alerts_by_name.isLoading ||
    top_alerts.isLoading;

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem>
        <EuiPageSection paddingSize="none">
          <EuiFlexGroup direction="column" gutterSize="l">
            <EuiFlexItem>
              <EuiFlexGrid columns={3}>
                {isSummaryLoading ? (
                  <LoadingPrompt size="l" columns={3} />
                ) : (
                  <>
                    <EuiFlexItem grow={1} style={{ minWidth: 300 }}>
                      <SeverityPieChart buckets={severity_levels.data ?? []} />
                    </EuiFlexItem>
                    <EuiFlexItem grow={1} style={{ minWidth: 300 }}>
                      <AlertsByNameTable buckets={alerts_by_name.data ?? []} />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <TopAlerts
                        selectedField={topAlertsBy}
                        buckets={top_alerts.data ?? []}
                        sourceOptions={source_options}
                        onChangeField={handleChangeTopAlertsField}
                      />
                    </EuiFlexItem>
                  </>
                )}
              </EuiFlexGrid>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiPanel hasBorder hasShadow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiIcon className="!rotate-90" type="aggregate" />
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiButtonGroup
                      legend="Group alerts by"
                      isFullWidth
                      isDisabled={alerts_table.isLoading}
                      options={[{ label: "All", id: "none" }, ...alerts_groups]}
                      idSelected={alerts_grouped_by}
                      color="primary"
                      onChange={handleSelectAlertsGroupedBy}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
                {alerts_grouped_by === "none" &&
                  <>
                    <EuiSpacer />
                    <EuiSearchBar box={{ placeholder: 'Search over rule name' }} onChange={handleSearchInput} />
                  </>
                }
                <EuiSpacer />

                {alerts_grouped_by !== "none" ? renderGroupedAlerts() : renderFlatAlerts()}
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageSection>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export const AlertsTab = memo(AlertsTabComponent);