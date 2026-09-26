import { memo } from 'react'
import {
  EuiBadge,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiText,
  EuiToolTip,
} from '@elastic/eui'
import { adversary } from '../../../../../types/adversaries'

interface ISidebarItemProps {
  apt: adversary
  isSelected: boolean
  onSelectItem: (apt: adversary) => void
}

const sidebarItemComponent = ({
  apt,
  isSelected,
  onSelectItem,
}: ISidebarItemProps) => {
  return (
    <EuiFlexItem
      grow={false}
      onClick={() => onSelectItem(apt)}
      className="cursor-pointer"
    >
      <EuiPanel
        paddingSize="s"
        color={isSelected ? 'primary' : 'subdued'}
      >
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiFlexGroup gutterSize="s" alignItems="center">
                  <EuiFlexItem grow={false}>
                    {apt.warn_sign && <EuiIcon color="warning" type="warning" />}
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiText size="s">
                      <p className={isSelected ? 'font-semibold' : ''}>
                        {apt.name}
                      </p>
                    </EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>

              <EuiFlexItem>
                <EuiFlexGroup>
                  {apt.sources.map((source, index) => (
                    <EuiToolTip
                      key={index}
                      content={
                        source === 'M'
                          ? 'Source: MITRE'
                          : 'Source: Threat Intelligence'
                      }
                    >
                      <EuiBadge
                        color="hollow"
                        className="!text-xs pointer-events-none"
                      >
                        {source}
                      </EuiBadge>
                    </EuiToolTip>
                  ))}
                </EuiFlexGroup>
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiToolTip content={`Confidence: ${apt.confidence}`}>
                  <EuiFlexGroup
                    className="relative"
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <div className="!w-full !h-full !bg-white !absolute !rounded" />
                    <EuiBadge
                      className="!z-10 pointer-events-none"
                      color={`rgba(252, 191, 73, ${
                        (parseInt(String(apt.confidence)) / 100) * 1.15
                      })`}
                    >
                      <EuiText size="xs">
                        <p>{apt.confidence}</p>
                      </EuiText>
                    </EuiBadge>
                  </EuiFlexGroup>
                </EuiToolTip>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </EuiFlexItem>
  )
}

export const SidebarItem = memo(sidebarItemComponent)
