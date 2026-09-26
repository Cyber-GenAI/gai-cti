/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EuiEmptyPrompt,
  EuiTitle,
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
  BarSeries,
  ScaleType,
} from '@elastic/charts';
import { BarSlice } from '../../../types/global';
import { badge_colors } from '../../../constants/colors';

interface BarChartProps {
  title?: string
  description?: string
  data: BarSlice
}

export const BarChart = ({
  description,
  title,
  data
}: BarChartProps) => {
  const { colorMode } = useEuiTheme();
  const chartBaseTheme = colorMode === 'LIGHT' ? LIGHT_THEME : DARK_THEME;
  const htmlId = htmlIdGenerator();
  const exampleOne = htmlId();
  const themeOverrides: PartialTheme = {
    partition: { emptySizeRatio: 0.4 },
  };

  return !data.data.length ? <EuiEmptyPrompt title={<EuiTitle><h2>No Data</h2></EuiTitle>} /> : (
    <Chart className='!w-full !h-72' title={title} description={description}>
      <Settings
        baseTheme={{
          ...chartBaseTheme, background: {
            color: 'transparent',
            fallbackColor: 'transparent'
          }
        }}
        theme={themeOverrides}
        ariaLabelledBy={exampleOne}
      />
      <Axis labelFormat={(v: any) => typeof v === 'string' ? v.slice(0, 7) : v} id="horizontal" position={'bottom'} title={data.x_title} />
      <Axis id="vertical" title={data.y_title} position={'left'} />
      <BarSeries
        id={data.x_title}
        color={badge_colors}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={data.x_accessor}
        yAccessors={data.y_accessors}
        data={data.data}
      />
    </Chart>
  );
};
