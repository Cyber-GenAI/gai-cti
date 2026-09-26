import {
  EuiEmptyPrompt,
  EuiTitle,
  htmlIdGenerator,
  useEuiTheme,
} from '@elastic/eui';
import {
  Chart,
  Partition,
  Settings,
  PartitionLayout,
  PartialTheme,
  LIGHT_THEME,
  DARK_THEME,
} from '@elastic/charts';
import { badge_colors } from '../../../constants/colors';
import { PieSlice } from '../../../types/global';
import { memo } from 'react';

interface TreeMapChartProps {
  data: PieSlice[]
  size?: number
}

const TreeMapChartComponent = ({ data }: TreeMapChartProps) => {
  const { colorMode } = useEuiTheme();
  const chartBaseTheme = colorMode === 'LIGHT' ? LIGHT_THEME : DARK_THEME;
  const htmlId = htmlIdGenerator();
  const exampleOne = htmlId();

  const themeOverrides: PartialTheme = {
    partition: { emptySizeRatio: 0.4 },
  };

  return (
    <div className='w-full h-full flex justify-center items-center'>
      {
        !data.length ?
          <EuiEmptyPrompt title={<EuiTitle><h2>No Data</h2></EuiTitle>} /> :
          <div style={{ width: '80%', height: '80%' }}>
            <Chart>
              <Settings
                baseTheme={{
                  ...chartBaseTheme,
                  background: { color: 'transparent', fallbackColor: 'transparent' },
                }}
                theme={themeOverrides}
                ariaLabelledBy={exampleOne}
              />
              <Partition
                id="pieByPR"
                data={data}
                layout={PartitionLayout.treemap}
                valueAccessor={(d) => d.percent}
                layers={[
                  {
                    groupByRollup: (d: typeof data[0]) => d.name,
                    shape: {
                      fillColor: (_, sortIndex) => badge_colors[sortIndex],
                    },
                  },
                ]}
                clockwiseSectors={false}
              />
            </Chart>
          </div>
      }
    </div>
  );
};

export const TreeMapChart = memo(TreeMapChartComponent)