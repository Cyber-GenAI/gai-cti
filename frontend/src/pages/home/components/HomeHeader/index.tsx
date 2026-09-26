import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiPageHeader, EuiPageHeaderSection, EuiTitle } from "@elastic/eui";
import { memo } from "react";

const homeHeaderComponent = () => {
  return (
    <EuiPageHeader>
      <EuiPageHeaderSection>
        <EuiFlexGroup justifyContent="center" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiIcon size="l" type="home" />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Home page</h1>
            </EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageHeaderSection>
    </EuiPageHeader>
  );
};

export const HomeHeader = memo(homeHeaderComponent);