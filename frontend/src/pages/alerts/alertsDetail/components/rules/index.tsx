import { memo } from 'react'
import { EuiDescriptionList, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiPanel, EuiSkeletonText, EuiTitle } from '@elastic/eui'

interface IAlertDetailRuleProps {
  isLoading: boolean
  ruleDetail: {
    title: string;
    description: JSX.Element;
  }[]
}

const alertDetailRuleComponent = ({
  isLoading,
  ruleDetail
}: IAlertDetailRuleProps) => {
  return (
    <EuiPanel className="!w-[35vw]">
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiTitle>
            <h2>Rule</h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiHorizontalRule margin="none" />
        </EuiFlexItem>
        <EuiFlexItem className="!max-h-[85vh] eui-yScrollWithShadows">
          <EuiPanel color="subdued">
            <EuiSkeletonText isLoading={isLoading} lines={10} size='relative'>
              <EuiDescriptionList
                type="column"
                align="left"
                columnWidths={["25%", "75%"]}
                rowGutterSize="m"
                listItems={ruleDetail ?? []}
              />
            </EuiSkeletonText>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  )
}

export const AlertDetailRule = memo(alertDetailRuleComponent)