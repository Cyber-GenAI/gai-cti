import { ResponsiveChordCanvas } from '@nivo/chord'
import { memo } from 'react'

interface ChordDiagramProps {
  data: number[][],
  keys: string[]
}

const ChordDiagramComponent = ({
  data,
  keys
}: ChordDiagramProps) => (
    <ResponsiveChordCanvas
        data={data}
        keys={keys}
        margin={{ top: 60, right: 200, bottom: 60, left: 60 }}
        padAngle={0.006}
        innerRadiusRatio={0.86}
        arcBorderWidth={0}
        ribbonBorderWidth={0}
        labelOffset={9}
        labelRotation={-90}
        colors={{ scheme: 'spectral' }}
        legends={[
            {
                anchor: 'right',
                direction: 'column',
                translateX: 120,
                itemWidth: 80,
                itemHeight: 11,
                symbolSize: 12
            }
        ]}
    />
)

export const ChordDiagram = memo(ChordDiagramComponent)