import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
} from "@elastic/eui";
import React, { memo } from "react";

interface IAlertsDetailHeaderComponentProps {
  onBack: () => void;
}

const alertsDetailHeaderComponent: React.FC<
  IAlertsDetailHeaderComponentProps
> = ({ onBack }) => {
  return (
    <EuiPageHeader>
      <EuiPageHeaderSection>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiLink onClick={onBack}>
              <EuiFlexGroup gutterSize="m">
                <EuiFlexItem grow={false}>
                  <EuiIcon type="arrowLeft" />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>Browse all Alerts</EuiFlexItem>
              </EuiFlexGroup>
            </EuiLink>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup justifyContent="center" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiIcon size="l" type="warning"/>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiTitle size="l">
                  <h1>Alert Detail</h1>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageHeaderSection>
    </EuiPageHeader>
  );
};

export const AlertsDetailHeader = memo(alertsDetailHeaderComponent);
