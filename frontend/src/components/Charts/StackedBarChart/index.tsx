import {
  htmlIdGenerator,
  useEuiTheme,
} from "@elastic/eui";
import {
  Chart,
  Settings,
  PartialTheme,
  LIGHT_THEME,
  DARK_THEME,
  Axis,
  BarSeries,
  ScaleType,
  StackMode,
} from "@elastic/charts";
import { StackedBarDatum } from "../../../types/global";
import { formatDate } from "../../../utils";

interface StackedBarChartProps {
  title?: string;
  description?: string;
  data: StackedBarDatum[];
  xTitle: string;
  yTitle: string;
  percentage?: boolean;
}

export const StackedBarChart = ({
  title,
  description,
  data,
  xTitle,
  yTitle,
  percentage = false,
}: StackedBarChartProps) => {
  const { colorMode } = useEuiTheme();
  const chartBaseTheme = colorMode === "LIGHT" ? LIGHT_THEME : DARK_THEME;
  const htmlId = htmlIdGenerator();
  const exampleOne = htmlId();
  const themeOverrides: PartialTheme = {
    partition: { emptySizeRatio: 0.4 },
  };

  return (
    <Chart className="!w-full !h-72" title={title} description={description}>
      <Settings
        baseTheme={{
          ...chartBaseTheme,  
          background: { color: "transparent", fallbackColor: "transparent" },
        }}
        theme={themeOverrides}
        ariaLabelledBy={exampleOne}
        rotation={90}
      />
      <Axis id="bottom" tickFormat={(v) => Math.abs(Number(v)).toFixed(2).toString()} title={xTitle} position="bottom" />
      <Axis
        id="left"
        title={yTitle}
        position="left"
        tickFormat={(v) => formatDate(v, true) ?? ''}
      />
      <BarSeries
        id="stacked-bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={["y"]}
        splitSeriesAccessors={["group"]}
        stackAccessors={["x"]}
        stackMode={percentage ? StackMode.Percentage : undefined}
        color={['#0fa3b1','#ef4444']}
        data={data}
      />
    </Chart>
  );
};
