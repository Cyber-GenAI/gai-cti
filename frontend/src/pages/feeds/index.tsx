import {
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPageSection,
  EuiPanel,
  EuiTab,
  EuiTabs
} from "@elastic/eui";
import { useCallback, useMemo, useState } from "react";
import { useAssistant } from "../../context/assistant/assistant-context";
import { useFeeds } from "../../context/feeds/feeds-context";
import { useFlyout } from "../../hooks/useFlyout";
import { Toastify } from "../../utils/toasts";
import { ConfigurationFlyout, FeedsHeader, Flyout } from "./components";
import { OrganizationsConnectorsMappingFlyout } from "./components/FeedsFlyout/organization";
import FeedConnectorsTable from "./components/FeedTables/Connectors";
import FeedOrganizationTable from "./components/FeedTables/Organization";
import { FeedStatistics } from "./components/statistics";

const Feeds = () => {
  const {
    getFeedTable,
    getFeedSecondTable,
    cleanUpConnectors
  } = useFeeds();
  const { getHelp } = useAssistant();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [selectedTabId, setSelectedTabId] = useState('connectors');

  const editFlyout = useFlyout(false);
  const organizationsConnectorsMapFlyout = useFlyout(false);
  const configurationFlyout = useFlyout(false);

  const handleCleanUp = useCallback(async () => {
    setIsLoading(true)
    const status = await cleanUpConnectors().finally(() => setIsLoading(false))
    if (status) {
      await getFeedTable()
      Toastify({
        type: 'success',
        message: 'Inactive connectors removed successfully.'
      })
    }
  }, [cleanUpConnectors, getFeedTable])

  const handleOpenFeedsFlyout = useCallback(
    (id: string) => {
      setSelectedId(id);
      editFlyout.handleOpenFlyout();
    },
    [editFlyout]
  );

  const handleTableAction = useCallback((key: string | Record<string, string>, type?: string) => {
    if (typeof key === "object" && type && key[type]) {
      getHelp(key[type]);
    }
  }, [getHelp]);

  const tableTabs = useMemo(() => [
    {
      id: 'connectors',
      name: 'Connectors',
      content: <FeedConnectorsTable isLoading={isLoading} onCleanUp={handleCleanUp} onTableAction={handleTableAction} />
    },
    {
      id: 'organizations',
      name: 'Organizations',
      content: <FeedOrganizationTable onOpenFlyout={handleOpenFeedsFlyout} />
    },
  ], [handleCleanUp, handleOpenFeedsFlyout, handleTableAction, isLoading])

  const selectedTabContent = useMemo(() => {
    return tableTabs.find((obj) => obj.id === selectedTabId)?.content;
  }, [selectedTabId, tableTabs]);

  const onSelectedTabChanged = (id: string) => {
    setSelectedTabId(id);
  };

  const renderTabs = () => {
    return tableTabs.map((tab, index) => (
      <EuiTab
        key={index}
        onClick={() => onSelectedTabChanged(tab.id)}
        isSelected={tab.id === selectedTabId}
      >
        {tab.name}
      </EuiTab>
    ));
  };

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem>
        <FeedsHeader onClickOrganizationMap={organizationsConnectorsMapFlyout.handleOpenFlyout} onClickConfiguration={configurationFlyout.handleOpenFlyout} />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiPageSection paddingSize="none">
          <EuiFlexGrid columns={1}>
            <EuiFlexItem>
              <FeedStatistics />
            </EuiFlexItem>
            <EuiPanel>
              <EuiTabs>{renderTabs()}</EuiTabs>
              {selectedTabContent}
            </EuiPanel>
          </EuiFlexGrid>
        </EuiPageSection>
      </EuiFlexItem>

      {editFlyout.isFlyoutVisible && selectedId && (
        <Flyout
          id={selectedId}
          handleCloseFlyout={editFlyout.handleCloseFlyout}
          onRefetch={getFeedSecondTable}
        />
      )}

      {organizationsConnectorsMapFlyout.isFlyoutVisible && (
        <OrganizationsConnectorsMappingFlyout
          isVisible={organizationsConnectorsMapFlyout.isFlyoutVisible}
          onClose={organizationsConnectorsMapFlyout.handleCloseFlyout}
        />
      )}

      <ConfigurationFlyout
        isFlyoutVisible={configurationFlyout.isFlyoutVisible}
        handleCloseFlyout={configurationFlyout.handleCloseFlyout}
      />

    </EuiFlexGroup>
  );
};

export default Feeds;
