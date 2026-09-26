import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSelect, EuiSelectOption, EuiSpacer, EuiText, EuiTitle } from '@elastic/eui'
import { memo } from 'react'
import { LoadingPrompt } from '../../../../components'
import { LogsTable } from './logsTable'
import { Hit } from './logsTableRow/types'
import { NoLogsPlaceholder } from './NoLogsPlaceholder'

interface LogTableProps {
  isFetching: boolean
  timeRanges: EuiSelectOption[]
  selectedTimeRange: string
  fetchedLogs: unknown[]
  handleSelectTimeRange: (time: string) => void
  handleGetLogExplain: (id: string) => void
} 

const LogTableComponent = ({
  isFetching,
  timeRanges,
  selectedTimeRange,
  fetchedLogs,
  handleSelectTimeRange,
  handleGetLogExplain,
}: LogTableProps) => {
  return (
    <EuiPanel hasBorder hasShadow={false}>
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem>
          <EuiTitle size="xs"><h4>Logs</h4></EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                Time filter:
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSelect
                options={timeRanges}
                value={selectedTimeRange}
                onChange={(e) => handleSelectTimeRange(e.target.value)}
                aria-label="Time range selector"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      {isFetching ? (
        <LoadingPrompt rows={3} columns={1} size="m" />
      ) : Array.isArray(fetchedLogs) && fetchedLogs.length > 0 ? (
        <LogsTable
          explainLog={handleGetLogExplain}
          logs={fetchedLogs as Hit[]}
        />
      ) : (
        <NoLogsPlaceholder />
      )}
    </EuiPanel>
  )
}

export const LogTable = memo(LogTableComponent)