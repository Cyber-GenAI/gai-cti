import { ResponsiveCalendarCanvas } from '@nivo/calendar'
import { memo } from 'react'

interface CalenderHeatmapProps {
  data: { value: number, day: string }[]
  from: string
  to: string
}

const CalenderHeatmapComponent = ({
  data,
  from,
  to
}: CalenderHeatmapProps) => {
  const rawMax = Math.max(...data.map(d => d.value))
  const effectiveMax = rawMax / 5

  return (
    <ResponsiveCalendarCanvas
      data={data}
      from={from}
      to={to}
      emptyColor="#eeeeee"
      margin={{ top: 40, right: 40, bottom: 50, left: 40 }}
      direction="horizontal"
      daySpacing={4}
      monthBorderColor="#ffffff"
      dayBorderWidth={0}
      pixelRatio={1.2}
      minValue={0}
      maxValue={effectiveMax}
      dayBorderColor="#ffffff"
      colors={[
        "#eeeeee",
        "#d8f3dc",
        "#b7e4c7",
        "#74c69d",
        "#52b788",
        "#40916c"
      ]}
      legends={[
        {
          anchor: 'bottom-right',
          direction: 'row',
          translateY: 36,
          itemCount: 4,
          itemWidth: 42,
          itemHeight: 36,
          itemsSpacing: 14,
          itemDirection: 'right-to-left'
        }
      ]}
    />
  )
}

export const CalenderHeatmap = memo(CalenderHeatmapComponent)
