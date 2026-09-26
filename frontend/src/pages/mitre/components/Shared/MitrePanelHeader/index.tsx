import React, { memo } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
} from "@elastic/eui";
import { IMitreHeaderComponentProps } from "./types";

const mitreHeaderComponent: React.FC<IMitreHeaderComponentProps> = ({
  onBack,
  title,
  headerTitle = "MITRE ATT&CK Matrix"
}) => (
  <EuiPageHeader>
    <EuiPageHeaderSection>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiLink onClick={onBack}>
            <EuiFlexGroup gutterSize="m">
              <EuiFlexItem grow={false}>
                <EuiIcon type="arrowLeft" />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>Browse all {title}</EuiFlexItem>
            </EuiFlexGroup>
          </EuiLink>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiTitle size="l">
            <h1>{headerTitle}</h1>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPageHeaderSection>
  </EuiPageHeader>
);

export const MitreCoverageHeader = memo(mitreHeaderComponent);
