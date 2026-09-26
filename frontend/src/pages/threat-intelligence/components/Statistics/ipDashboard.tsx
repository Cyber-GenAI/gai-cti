import {
  EuiAccordion,
  EuiFlexGrid,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui";
import { memo } from "react";
import { renderCardValue } from "../../../../utils/renderFormater";
import { LoadingPrompt } from "../../../../components";
import { threatIPDashboard } from "../../../../types/threat-intelligence";
import { useFlyout } from "../../../../hooks/useFlyout";

export type IIPDashboard = {
  data: threatIPDashboard | null;
  isLoading: boolean;
};

const IPDashboardComponent = ({ data, isLoading }: IIPDashboard) => {
  const { isFlyoutVisible, handleToggleFlyout } = useFlyout(false);

  return (
    <EuiPanel>
      <EuiAccordion
        id="accordion-ti-ip-dashboard"
        buttonElement="div"
        buttonContent={
          <EuiTitle>
            <h3>IP Dashboard</h3>
          </EuiTitle>}
        onToggle={handleToggleFlyout}
        initialIsOpen={isFlyoutVisible}
      >
        <EuiSpacer />
        <EuiFlexGrid columns={1} gutterSize="l">
          {
            isLoading ? <LoadingPrompt size="xl" /> :
              data !== null &&
              <EuiFlexItem className="!col-span-2">
                <EuiPanel hasBorder hasShadow={false}>
                  {renderCardValue(data["ip-geo-map"].type, data["ip-geo-map"].data.value, data["ip-geo-map"].data.title, data["ip-geo-map"].data.description)}
                </EuiPanel>
              </EuiFlexItem>
          }
        </EuiFlexGrid>
      </EuiAccordion>
    </EuiPanel>
  );
};

export const IPDashboard = memo(IPDashboardComponent);
