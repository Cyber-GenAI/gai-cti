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
  Goal,
  BandFillColorAccessorInput,
} from '@elastic/charts';
import { memo } from 'react';

interface GoalChartProps {
  data: number
  size?: number
}

const COLORS = ['#ffffff', '#e8aeb2' , '#d15c64', '#C42F3A', '#BB111D']

const GoalChartComponent = ({ data, size = 250 }: GoalChartProps) => {
  const { colorMode } = useEuiTheme();
  const chartBaseTheme = colorMode === 'LIGHT' ? LIGHT_THEME : DARK_THEME;
  const htmlId = htmlIdGenerator();
  const exampleOne = htmlId();
  const themeOverrides: PartialTheme = {
    partition: { emptySizeRatio: 0.4 },
  };

  return (
    <Chart size={{ width: size, height: size }}>
      <Settings
        baseTheme={{
          ...chartBaseTheme, background: {
            color: 'transparent',
            fallbackColor: 'transparent'
          }
        }}
        theme={themeOverrides}
        ariaLabelledBy={exampleOne}
        showLegend={true}
      />
      <Goal
        id="spec_1"
        subtype="goal"
        base={0}
        target={0}
        actual={data}
        domain={{ min: 0, max: 100 }}
        bands={[0, 20, 40, 60, 80, 100]}
        ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
        tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
        bandFillColor={(data) => COLORS[data.index - 1]}
        centralMinor="Confidence"
        labelMajor=""
        labelMinor=""
        centralMajor={`${data}%`}
        angleStart={Math.PI}
        angleEnd={0}
      />
    </Chart>
  );
};

export const GoalChart = memo(GoalChartComponent)