import { EuiButtonEmpty, EuiPageHeader } from "@elastic/eui";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const RulesHeaderComponent = () => {
  const navigate = useNavigate();

  const handleCoverageLink = useCallback(() => {
    navigate("coverage");
  }, [navigate]);

  return (
      <EuiPageHeader
        pageTitle="Rules"
        description="On this page, you can view, enable, disable, and create detection rules. The rules fall into three categories: TI (IoC) Rules, Sigma (Atomic) Rules, and APT (Compound) Rules. It allows you to customize detection logic according to your organization’s needs."
        rightSideItems={[
          <EuiButtonEmpty onClick={handleCoverageLink} iconType={"popout"}>
            MITRE Coverage
          </EuiButtonEmpty>,
        ]}
      />
  );
};

export const RulesHeader = memo(RulesHeaderComponent);
