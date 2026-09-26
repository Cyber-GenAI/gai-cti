import { EuiButton, EuiPageHeader } from "@elastic/eui";
import { memo } from "react";
import { FEEDS_HEADER_DESCRIPTION, FEEDS_HEADER_TITLE } from "./constants";

interface IFeedsHeaderProps {
  onClickConfiguration: () => void
  onClickOrganizationMap: () => void
}

const FeedsHeaderComponent = ({
  onClickConfiguration,
  onClickOrganizationMap
}: IFeedsHeaderProps) => {
  return (
    <EuiPageHeader
      pageTitle={FEEDS_HEADER_TITLE}
      description={FEEDS_HEADER_DESCRIPTION}
      rightSideItems={[
        <EuiButton onClick={onClickConfiguration} iconType="gear" fill>
          Configuration
        </EuiButton>,
        <EuiButton onClick={onClickOrganizationMap} iconType="indexMapping">
          Connector-Organizations Mapping
        </EuiButton>,
      ]}
    />
  );
};

export const FeedsHeader = memo(FeedsHeaderComponent);