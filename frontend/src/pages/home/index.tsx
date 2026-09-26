import {
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPageSection,
  EuiPanel,
  EuiSpacer,
} from "@elastic/eui";
import { HomeStatistics } from "./components/statistics";
import { useEffect } from "react";
import { renderCardValue } from "../../utils/renderFormater";
import { useHome } from "../../context/home/home-context";
import { HomeHeader } from "./components/HomeHeader";
import { LoadingPrompt } from "../../components";

const Home = () => {
  const { getDashboard, dashboard } = useHome();

  useEffect(() => {
    getDashboard();
  }, [getDashboard])


  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem>
        <HomeHeader />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>
      <EuiPageSection className="!h-full" paddingSize="none">
        <HomeStatistics
          statistics={dashboard?.data?.top_dashboards ?? []}
          isLoading={dashboard.isLoading}
        />
        <EuiSpacer />
        {
          dashboard.isLoading ? <LoadingPrompt columns={2} rows={2} size="xl" /> :
            <EuiFlexGrid className="!w-full" columns={2}>
              <EuiFlexItem className="!col-span-2">
                <EuiFlexGrid className="!w-full !h-full" columns={4}>
                  <EuiFlexItem className="!col-span-2">
                    <EuiFlexGrid columns={2}>
                      <EuiFlexItem>
                        {
                          dashboard.data?.visuals["active-malwares"] &&
                          <EuiPanel>
                            {renderCardValue(dashboard.data?.visuals["active-malwares"].type, dashboard.data?.visuals["active-malwares"].data.value, dashboard.data?.visuals["active-malwares"].data.title, dashboard.data?.visuals["active-malwares"].data.description)}
                          </EuiPanel>
                        }
                      </EuiFlexItem>
                      <EuiFlexItem>
                        {
                          dashboard.data?.visuals["common-ioc-tags"] &&
                          <EuiPanel>
                            {renderCardValue(dashboard.data?.visuals["common-ioc-tags"].type, dashboard.data?.visuals["common-ioc-tags"].data.value, dashboard.data?.visuals["common-ioc-tags"].data.title, dashboard.data?.visuals["common-ioc-tags"].data.description)}
                          </EuiPanel>
                        }
                      </EuiFlexItem>
                      <EuiFlexItem className="!col-span-2">
                        {
                          dashboard.data?.visuals["ioc-per-adv"] &&
                          <EuiPanel>
                            {renderCardValue(dashboard.data?.visuals["ioc-per-adv"].type, dashboard.data?.visuals["ioc-per-adv"].data.value, dashboard.data?.visuals["ioc-per-adv"].data.title, dashboard.data?.visuals["ioc-per-adv"].data.description)}
                          </EuiPanel>
                        }
                      </EuiFlexItem>
                    </EuiFlexGrid>
                  </EuiFlexItem>
                  <EuiFlexItem className="!col-span-2">
                    {
                      dashboard.data?.visuals["ip-map"] &&
                      <EuiPanel>
                        {renderCardValue(dashboard.data?.visuals["ip-map"].type, dashboard.data?.visuals["ip-map"].data.value, dashboard.data?.visuals["ip-map"].data.title, dashboard.data?.visuals["ip-map"].data.description)}
                      </EuiPanel>
                    }
                  </EuiFlexItem>
                </EuiFlexGrid>
              </EuiFlexItem>
            </EuiFlexGrid>
        }
      </EuiPageSection>
    </EuiFlexGroup >
  );
};

export default Home;
