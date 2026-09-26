import {
  EuiText,
  EuiBasicTable,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  useEuiTheme,
} from "@elastic/eui";
import {
  Chart,
  Settings,
  Partition,
  PartitionLayout,
  PrimitiveValue,
  LIGHT_THEME,
  DARK_THEME,
} from "@elastic/charts";
import { columns, severityConfig, themeOverrides } from "./constants";
import { keyedBucket, severities } from "../../../../types/third-party";

interface ISeverityPieChartProps { 
  buckets: keyedBucket<severities>[]
}

export const SeverityPieChart = ({ buckets } : ISeverityPieChartProps) => {
  const { colorMode } = useEuiTheme();
  const chartBaseTheme = colorMode === 'LIGHT' ? LIGHT_THEME : DARK_THEME;
  const chartData = buckets.map(({ key, doc_count }) => ({
    key,
    count: doc_count,
  }));

  return (
    <EuiPanel className="!max-h-[21rem]" hasBorder hasShadow={false}>
      <EuiFlexGroup direction="row" gutterSize="xl" responsive={false} wrap>
        <EuiFlexItem>
          <EuiText textAlign="left">
            <h4>Severity levels</h4>
          </EuiText>
          <EuiSpacer size="l" />
          <EuiBasicTable
            items={buckets}
            columns={columns}
            className="severity-table"
          />
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiFlexGroup
            direction="row"
            justifyContent="center"
            style={{ height: "100%" }}
          >
            <EuiFlexItem>
              <Chart>
                <Settings
                  baseTheme={{
                    ...chartBaseTheme, background: {
                      color: 'transparent',
                      fallbackColor: 'transparent'
                    }
                  }}
                  showLegend={false} theme={themeOverrides} />
                <Partition
                  id="severityPie"
                  data={chartData}
                  valueAccessor={({ count }) => count}
                  layout={PartitionLayout.sunburst}
                  layers={[
                    {
                      groupByRollup: (d: { key: string; count: number }) =>
                        d.key,
                      nodeLabel: (d: PrimitiveValue) => `${d ?? ""}`,
                      shape: {
                        fillColor: (d: string) =>
                          severityConfig[d as keyof typeof severityConfig]
                            ?.color || severityConfig.default.color,
                      },
                    },
                  ]}
                />
              </Chart>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};


