import {
  htmlIdGenerator,
  useEuiTheme,
} from '@elastic/eui';
import {
  Chart,
  Settings,
  PartialTheme,
  LIGHT_THEME,
  DARK_THEME,
  Axis,
  AreaSeries,
  ScaleType,
  CurveType,
} from '@elastic/charts';
import { BarSlice } from '../../../types/global';
import { badge_colors } from '../../../constants/colors';
import { formatDate } from '../../../utils';

interface AreaChartProps {
  title?: string;
  description?: string;
  data: BarSlice;
}

export const AreaChart = ({
  description,
  title,
  data,
}: AreaChartProps) => {
  const { colorMode } = useEuiTheme();
  const chartBaseTheme = colorMode === 'LIGHT' ? LIGHT_THEME : DARK_THEME;
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
          background: { color: 'transparent', fallbackColor: 'transparent' },
        }}
        theme={themeOverrides}
        ariaLabelledBy={exampleOne}
        showLegend={false}
      />
      <Axis
        tickFormat={(v) => formatDate(v) ?? ''}
        id="horizontal"
        position="bottom"
        title={data.x_title}
      />
      <Axis id="vertical" title={data.y_title} position="left" />
      <AreaSeries
        id="Adversaries"
        color={badge_colors}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={data.x_accessor}
        yAccessors={data.y_accessors}
        data={data.data}
        curve={CurveType.CURVE_BASIS}
      />
    </Chart>
  );
};
