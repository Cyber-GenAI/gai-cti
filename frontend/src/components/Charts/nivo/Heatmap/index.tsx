import { ResponsiveHeatMapCanvas } from '@nivo/heatmap'
import { memo } from 'react'
import { HeatmapDataRow } from '../../../../types/visuals'

interface HeatmapProps {
  data: HeatmapDataRow[]
  key: string
  domain: [number, number]
}

const HeatmapComponent = ({
  domain,
  data,
}: HeatmapProps) => (
    <ResponsiveHeatMapCanvas
        data={data}
        margin={{ top: 70, right: 60, bottom: 20, left: 80 }}
        valueFormat={(value) => value.toFixed(2)}
        axisTop={{ tickRotation: -45 }}
        axisRight={{  legendOffset: 40 }}
        axisLeft={null}
        colors={{ type: 'diverging', minValue: domain[0], maxValue: domain[1], colors: ['#ffffff', '#0fa3b1', '#08575E']}}
        emptyColor="#ffffff"
        borderWidth={1}
        borderColor="#000000"
        enableLabels={false}
        legends={[
            {
                anchor: 'left',
                translateX: -50,
                translateY: 0,
                length: 200,
                thickness: 10,
                direction: 'column',
                tickPosition: 'after',
                tickSize: 3,
                tickSpacing: 4,
                tickOverlap: false,
                title: 'Value →',
                titleAlign: 'start',
                titleOffset: 4
            }
        ]}
    />
)

export const Heatmap = memo(HeatmapComponent) 