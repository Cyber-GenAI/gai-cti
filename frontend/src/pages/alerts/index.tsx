import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPanel, EuiSpacer, EuiTab, EuiTabs, EuiSuperDatePicker, EuiPageHeader } from "@elastic/eui";
import { memo, useMemo } from "react";
import { AlertsTab } from "./components/tabs";
import { useAlert } from "../../context/alert/alert-context";
import { ALERTS_HEADER_DESCRIPTION } from "./components/AlertsHeader/constants";
import { useUrlState } from "../../hooks/useUrlState";

const Alerts = () => {
  const [selectedTabId, setSelectedTabId] = useUrlState("mode", "all");
  const { dateRange, setDateRange } = useAlert();

  const tabs = useMemo(() => [
    { id: "all", name: "All", content: <AlertsTab date={(dateRange?.from ?? "") + (dateRange?.to ?? '')} variant="all" /> },
    { id: "ti", name: "Threat Intelligence", content: <AlertsTab date={(dateRange?.from ?? "") + (dateRange?.to ?? '')} variant="ti" /> },
  ], [dateRange?.from, dateRange?.to])

  const selectedTabContent = useMemo(() => tabs.find((obj) => obj.id === selectedTabId)?.content, [selectedTabId, tabs]);

  const onSelectedTabChanged = (id: string) => setSelectedTabId(id);

  const renderTabs = () =>
    tabs.map((tab, index) => (
      <EuiTab key={index} onClick={() => onSelectedTabChanged(tab.id)} isSelected={tab.id === selectedTabId}>
        {tab.name}
      </EuiTab>
    ));

  const handleTimeChange = ({ start, end }: { start: string; end: string }) => {
    setDateRange({ from: start, to: end });
  };

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem>
        <EuiPageHeader
          pageTitle="Alerts"
          description={ALERTS_HEADER_DESCRIPTION}
          rightSideItems={[
            <EuiSuperDatePicker
              start={dateRange?.from ?? "now/y"}
              end={dateRange?.to ?? "now"}
              onTimeChange={handleTimeChange}
              isPaused={false}
              commonlyUsedRanges={[
                {
                  label: "All Time",
                  start: new Date(0).toISOString(),
                  end: new Date().toISOString()
                }
              ]}
              isAutoRefreshOnly={false}
              showUpdateButton={false}
              refreshMinInterval={3600}
              refreshIntervalUnits="h"
            />
          ]}
        />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiPanel>
          <EuiTabs>{renderTabs()}</EuiTabs>
          <EuiSpacer />
          {selectedTabContent}
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default memo(Alerts);
