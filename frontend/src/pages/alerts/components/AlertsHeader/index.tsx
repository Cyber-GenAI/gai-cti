import { EuiPageHeader } from '@elastic/eui'
import { memo } from 'react'
import { ALERTS_HEADER_DESCRIPTION } from './constants'

const alertsHeaderComponent = () => {
  return (
    <EuiPageHeader
      pageTitle="Alerts"
      description={ALERTS_HEADER_DESCRIPTION}
    />
  )
}

export const AlertsHeader = memo(alertsHeaderComponent)