import { EuiPageHeader } from "@elastic/eui";
import { memo } from "react";
import { TI_HEADER_DESCRIPTION, TI_HEADER_TITLE } from "./constants";

const threatIntelligenceHeaderComponent = () => {
  return (
    <EuiPageHeader
      pageTitle={TI_HEADER_TITLE}
      description={TI_HEADER_DESCRIPTION}
    />
  );
};

export const ThreatIntelligenceHeader = memo(threatIntelligenceHeaderComponent);
