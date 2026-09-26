import { EuiPageHeader } from '@elastic/eui'
import { logsHeadDescription } from './constants'

export const LogsHeaderComponent = () => {
  return (
    <EuiPageHeader
      pageTitle="Logs"
      description={logsHeadDescription}
    />

  )
}
