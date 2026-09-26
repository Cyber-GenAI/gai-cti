import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPageBody,
  EuiPanel,
  EuiSpacer
} from "@elastic/eui";
import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import { addTimeRangeToQuery, getTimeRange } from "./utils";

import { useAssistant } from "../../context/assistant/assistant-context";
import { useLogs } from "../../context/logs/logs-context";
import { useUrlState } from "../../hooks/useUrlState";
import { esQuery } from "../../types/logs";
import { indexPattern } from "../../types/utilities";
import {
  LogsHeaderComponent,
  LogsToolbar
} from "./components";
import { LogTable } from "./components/LogTable";
import { timeRangeOptions } from "./components/LogTable/LogsToolbar/constants";
import { LogsAnalysis } from "./components/statistics/LogsAnalysis";
import { LogsHeatmap } from "./components/statistics/LogsHeatmap";

const LogsComponent: FC = () => {
  const { getAssistantExplain } = useAssistant();
  const {
    index_pattern,
    logs,
    logDistributionDashboard,
    logIndexDashboard,
    getLogs,
    getIndexPattern,
    getLogDistributionDashboard,
    getLogIndexDashboard,
  } = useLogs();

  const [selectedIndex, setSelectedIndex] = useUrlState("index", "");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("no_filter");
  const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(false);

  useEffect(() => {
    getIndexPattern();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const indexPatterns = useMemo<indexPattern[]>(
    () => index_pattern?.data ?? [],
    [index_pattern]
  );

  const totalCount = useMemo(
    () =>
      indexPatterns.find((i: indexPattern) => i.name === selectedIndex)
        ?.total_count,
    [indexPatterns, selectedIndex]
  );

  const fetchedLogs = logs?.data?.hits.hits;

  const fetchLogs = useCallback(async () => {
    const selected = indexPatterns.find((i) => i.name === selectedIndex);
    if (selected) {
      setIsFetchingLogs(true);
      try {
        let parsedQuery: esQuery = JSON.parse(selected.query);
        const timeRange = getTimeRange(selectedTimeRange);
        parsedQuery = addTimeRangeToQuery(parsedQuery, timeRange);
        await getLogs(selected.pattern, parsedQuery);
      } finally {
        setIsFetchingLogs(false);
      }
    }
  }, [getLogs, indexPatterns, selectedIndex, selectedTimeRange]);

  useEffect(() => {
    if (indexPatterns.length > 0 && !selectedIndex) {
      setSelectedIndex(indexPatterns[0].name);
    }
  }, [indexPatterns, selectedIndex, setSelectedIndex]);

  useEffect(() => {
    if (selectedIndex) {
      fetchLogs();
    }
  }, [selectedIndex, selectedTimeRange, fetchLogs]);

  useEffect(() => {
    getLogDistributionDashboard();
  }, [getLogDistributionDashboard]);


  useEffect(() => {
    const selected = indexPatterns.find((i) => i.name === selectedIndex);
    if (selected) {
      getLogIndexDashboard(selected.pattern);
    }
  }, [getLogIndexDashboard, indexPatterns, selectedIndex]);

  const handleGetLogExplain = useCallback(
    (id: string) => {
      const selected = indexPatterns.find((i) => i.name === selectedIndex);
      if (selected) {
        getAssistantExplain("logs", id, selected.pattern);
      }
    },
    [getAssistantExplain, indexPatterns, selectedIndex]
  );

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem>
        <LogsHeaderComponent />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiPageBody>
          <EuiFlexGroup direction="column" className="!w-full" gutterSize="l">

            {/* Log Distribution Chart */}
            <EuiFlexItem>
              <LogsAnalysis
                isLoading={logDistributionDashboard.isLoading}
                data={logDistributionDashboard.data}
              />
            </EuiFlexItem>

            {/* Index Dashboard */}
            <EuiFlexItem>
              <EuiPanel>
                <LogsToolbar
                  indexPatterns={indexPatterns}
                  selectedIndex={selectedIndex}
                  totalCount={totalCount ?? -1}
                  setSelectedIndex={setSelectedIndex}
                  selectedTimeRange={selectedTimeRange}
                  setSelectedTimeRange={setSelectedTimeRange}
                />

                <EuiFlexItem className="!w-full">
                  <LogsHeatmap
                    data={logIndexDashboard.data}
                    isLoading={logIndexDashboard.isLoading}
                  />
                </EuiFlexItem>

                <EuiSpacer />
                <LogTable
                  isFetching={isFetchingLogs}
                  timeRanges={timeRangeOptions}
                  selectedTimeRange={selectedTimeRange}
                  fetchedLogs={fetchedLogs ?? []}
                  handleSelectTimeRange={(value) => setSelectedTimeRange(value)}
                  handleGetLogExplain={handleGetLogExplain}
                />
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageBody>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default memo(LogsComponent);
