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
} from "@elastic/charts";
import { RangeBarValue } from "../../../types/visuals";
import { formatDate } from "../../../utils";

interface RangeBarChartProps {
  title?: string;
  description?: string;
  data: RangeBarValue[];
  xTitle: string;
  yTitle: string;
}

export const RangeBarChart = ({
  title,
  description,
  data,
  xTitle,
  yTitle,
}: RangeBarChartProps) => {
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
        showLegend={false}
      />
      <Axis id="bottom"
        tickFormat={(v) => formatDate(v) ?? ''}
        domain={{
          min: NaN,
          max: NaN,
          fit: true,
        }}
        title={xTitle}
        position="bottom" />
      <Axis
        id="left"
        title={yTitle}
        position="left"
      />
      <BarSeries
        id="range-bar"
        hideInLegend
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Time}
        barSeriesStyle={{
          rect: {
            widthPixel: 12
          }
        }}
        xAccessor="name"
        yAccessors={["max"]}
        y0Accessors={["min"]}
        color={['#0fa3b1', '#ef4444']}
        data={data}
      />
    </Chart>
  );
};
