import { EuiPanel } from '@elastic/eui'
import { memo } from 'react'
import { LoadingPrompt } from '../../../../../components'
import { RangeBarChart } from '../../../../../components/Charts/RangeBarChart'
import { logDistributionDashboard } from '../../../../../types/logs'

interface LogsAnalysisProps {
  isLoading: boolean
  data: logDistributionDashboard | null
}

const LogsAnalysisComponent = ({
  data,
  isLoading
}: LogsAnalysisProps) => {
  return (
    <EuiPanel>
      {isLoading ? (
        <LoadingPrompt rows={1} columns={1} size="l" />
      ) : (
        <RangeBarChart
          xTitle="time"
          yTitle=""
          description={data?.data.description}
          title={data?.data.title}
          data={data?.data.value ?? []}
        />
      )}
    </EuiPanel>
  )
}

export const LogsAnalysis = memo(LogsAnalysisComponent)