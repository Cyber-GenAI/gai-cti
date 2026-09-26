import {
  EuiAccordion,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui";
import { memo } from "react";
import { renderCardValue } from "../../../../utils/renderFormater";
import { LoadingPrompt } from "../../../../components";
import { threatTIDashboard } from "../../../../types/threat-intelligence";
import { useFlyout } from "../../../../hooks/useFlyout";

export type ITIDashboard = {
  data: threatTIDashboard | null;
  isLoading: boolean;
};

const TIDashboardComponent = ({ data, isLoading }: ITIDashboard) => {
  const { isFlyoutVisible, handleToggleFlyout } = useFlyout(true);

  const topCards = data !== null ? Object.keys(data).filter((key) => data[key as keyof threatTIDashboard].type === "MetricVisual").map((i) => data[i as keyof threatTIDashboard]) : [];

  return (
    <EuiPanel>
      <EuiAccordion
        id="accordion-ti-ti-dashboard"
        buttonElement="div"
        buttonContent={
          <EuiTitle>
            <h3>TI Dashboard</h3>
          </EuiTitle>}
        onToggle={handleToggleFlyout}
        initialIsOpen={isFlyoutVisible}
      >
        <EuiSpacer />
        <EuiFlexGroup direction="column" gutterSize="l">
          <EuiFlexItem>
            {isLoading ? (
              <LoadingPrompt rows={1} columns={4} size="m" />
            ) : (
              <EuiFlexGrid columns={4} gutterSize="l">
                {topCards.map((item, index) =>
                  <EuiFlexItem key={index}>
                      <EuiPanel hasBorder hasShadow={false}>
                        {renderCardValue(item.type, item.data.value, item.data.title, item.data.description)}
                      </EuiPanel>
                  </EuiFlexItem>
                )}
              </EuiFlexGrid>
            )}
          </EuiFlexItem>

          <EuiFlexItem>
            {isLoading ? (
              <LoadingPrompt rows={2} columns={2} size="xl" />
            ) : (
              <EuiFlexGrid columns={4} gutterSize="l">
                {
                  data !== null &&
                  <>
                    <EuiFlexItem className="col-span-1 flex">
                      <EuiPanel hasBorder hasShadow={false} className="!w-full flex items-center justify-center">
                        {renderCardValue(data["ioc-type-pie"].type, data["ioc-type-pie"].data.value, data["ioc-type-pie"].data.title, data["ioc-type-pie"].data.description)}
                      </EuiPanel>
                    </EuiFlexItem>
                    <EuiFlexItem className="col-span-3 flex">
                      <EuiPanel hasBorder hasShadow={false} className="!w-full flex items-center justify-center">
                        {renderCardValue(data["cumulative-ioc-count"].type, data["cumulative-ioc-count"].data.value, data["cumulative-ioc-count"].data.title, data["cumulative-ioc-count"].data.description)}
                      </EuiPanel>
                    </EuiFlexItem>
                  <EuiFlexItem className="col-span-2 flex">
                      <EuiPanel hasBorder hasShadow={false} className="!w-full flex items-center justify-center">
                        {renderCardValue(data["diverging-conf-risk"].type, data["diverging-conf-risk"].data.value, data["diverging-conf-risk"].data.title, data["diverging-conf-risk"].data.description)}
                      </EuiPanel>
                    </EuiFlexItem>
                    <EuiFlexItem className="col-span-2 flex">
                      <EuiPanel hasBorder hasShadow={false} className="!w-full flex items-center justify-center">
                        {renderCardValue(data["tag-corr-heatmap"].type, data["tag-corr-heatmap"].data.value, data["tag-corr-heatmap"].data.title, data["tag-corr-heatmap"].data.description)}
                      </EuiPanel>
                    </EuiFlexItem>
                  </>
                }
              </EuiFlexGrid>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiAccordion>
    </EuiPanel>
  );
};

export const TIDashboard = memo(TIDashboardComponent);
