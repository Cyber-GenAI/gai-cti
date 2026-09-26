import { EuiButton, EuiPageHeader } from '@elastic/eui'
import { memo } from 'react'
import { ADVERSARIES_HEADER_DESCRIPTION, ADVERSARIES_HEADER_TITLE } from '../../constants'

interface adversariesHeaderProps {
  onSpecificityClick: () => void;
  onMapClick: () => void;
  onScheduleClick: () => void
}

const adversariesHeaderComponent = ({
  onMapClick,
  onSpecificityClick,
  onScheduleClick
}: adversariesHeaderProps) => {
  return (
    <EuiPageHeader
      pageTitle={ADVERSARIES_HEADER_TITLE}
      description={ADVERSARIES_HEADER_DESCRIPTION}
      rightSideItems={[
        <EuiButton onClick={onSpecificityClick} iconType="heatmap" fill>
          Technique Specificity
        </EuiButton>,
        <EuiButton onClick={onMapClick} iconType="logPatternAnalysis">
          Map to MITRE
        </EuiButton>,
        <EuiButton onClick={onScheduleClick} iconType="logPatternAnalysis">
          Manage Schedule
        </EuiButton>,
      ]}
      />
  )
}

export const AdversariesHeader = memo(adversariesHeaderComponent)