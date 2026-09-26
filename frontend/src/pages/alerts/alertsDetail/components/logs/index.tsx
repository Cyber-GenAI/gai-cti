import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPanel, EuiTitle } from '@elastic/eui'
import { memo, useCallback, useState } from 'react'
import { LogDetailsFlyout } from '../../../../logs/components'
import { genericTable, Table } from '../../../../../components'

interface IAlertDetailLogsProps {
  isLoading: boolean
  logs: genericTable<number | string[]>
}

const AlertDetailLogsComponent = ({
  logs,
  isLoading
}: IAlertDetailLogsProps) => {
  const [selectedHit, setSelectedHit] = useState<string>("");

  const handleSelectRow = useCallback((id: string) => {
    const selectedRow = logs.rows.find((row) => row.id === id)
    setSelectedHit(JSON.stringify((selectedRow as { source: string }).source, null, 2))
  }, [logs.rows])

  return (
    <EuiFlexItem>
      <EuiPanel>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiTitle>
              <h2>Logs</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiHorizontalRule margin="none" />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel color="subdued">
              <Table
                columns={logs.columns}
                rows={logs.rows}
                total={logs.total}
                isLoading={isLoading}
                onClick={handleSelectRow}
                filterable={false}
                hasPagination={false}
                last_row_cursor=""
              />
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      <LogDetailsFlyout
        id=''
        selectedHit={selectedHit}
        onClose={() => setSelectedHit("")}
      />
    </EuiFlexItem>
  )
}

export const AlertDetailLogs = memo(AlertDetailLogsComponent)