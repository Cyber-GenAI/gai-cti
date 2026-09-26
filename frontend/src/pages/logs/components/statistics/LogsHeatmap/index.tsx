import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSelect, EuiText, EuiTitle } from '@elastic/eui';
import { memo, useEffect, useMemo, useState } from 'react';
import { LoadingPrompt } from '../../../../../components';
import { CalenderHeatmap } from '../../../../../components/Charts/nivo/CalenderHeatmap';
import { logIndexDashboard } from '../../../../../types/logs';

interface LogsHeatmapProps {
  isLoading: boolean;
  data: logIndexDashboard | null;
}

const LogsHeatmapComponent = ({
  data,
  isLoading
}: LogsHeatmapProps) => {
  const [selectedYear, setSelectedYear] = useState<string>('');

  const heatmapYears = useMemo(() =>
    Array.from(new Set(data?.data.value.map((item) => Number(item.day.split('-')[0])))),
    [data?.data.value]
  );

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(event.target.value);
  };

  useEffect(() => {
    if (heatmapYears.length) {
      setSelectedYear(heatmapYears?.[0].toString())
    }
  }, [heatmapYears])


  return (
    <EuiPanel
      hasBorder
      hasShadow={false}
      color="plain"
      className="!w-full h-96"
    >
      {isLoading ? (
        <LoadingPrompt rows={1} columns={1} size="l" />
      ) : (
        <EuiFlexGroup
          direction="column"
          className="!h-full !w-full"
        >
          <EuiFlexItem grow={false}>
            <EuiFlexGroup direction="column" gutterSize="s">
              <EuiFlexItem>
                <EuiFlexGroup direction='row' justifyContent='spaceBetween' alignItems='center'>
                  <EuiFlexItem grow>
                    <EuiTitle size="xs">
                      <h4>
                        {data?.data.title ?? ""}
                      </h4>
                    </EuiTitle>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiSelect
                      options={heatmapYears.map(year => ({ value: year.toString(), text: year.toString() }))}
                      value={selectedYear}
                      onChange={handleYearChange}
                      aria-label="Select a year for the heatmap"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiText color="subdued">
                  {data?.data.description ?? ""}
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>

          <EuiFlexItem className="!h-full !w-full">
            <CalenderHeatmap
              from={selectedYear}
              to={selectedYear}
              data={data?.data.value.filter(item => item.day.startsWith(selectedYear)) ?? []}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </EuiPanel>
  );
};

export const LogsHeatmap = memo(LogsHeatmapComponent);
