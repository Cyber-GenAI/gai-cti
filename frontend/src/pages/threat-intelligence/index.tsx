import {
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPageSection,
  EuiPanel,
  EuiSpacer,
} from "@elastic/eui";
import { useEffect, useCallback, useState } from "react";
import { MalwareDashboard, TIDashboard, ThreatIntelligenceDetailFlyout, IPDashboard } from "./components";
import { useThreatIntelligence } from "../../context/threat-intelligence/threat-intelligence-context";
import { useFlyout } from "../../hooks/useFlyout";
import { initial_table_params } from "../../constants/table";
import { threatIntelligenceTableParams } from "../../types/threat-intelligence";
import { ThreatIntelligenceHeader } from "./components/TIHeader";
import { Table } from "../../components";
import { Toastify } from "../../utils/toasts";

const ThreatIntelligence = () => {
  const {
    getThreatTable,
    getThreatTIDashboard,
    threatTable,
    threatTIDashboard,
    threatMalwareDashboard,
    threatIPDashboard,
    getThreatMalwareDashboard,
    editThreatConfidenceField,
    getThreatIPDashboard,
    setThreatTableParams,
  } = useThreatIntelligence();

  const [selectedIOCId, setSelectedIOCId] = useState<string | undefined>()
  
  const { isFlyoutVisible, handleCloseFlyout, handleOpenFlyout } = useFlyout(false);

  useEffect(() => {
    getThreatTable(initial_table_params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditConfidence = useCallback(async (id: string, confidence: number) => {
    const status = await editThreatConfidenceField(id, confidence);
    if (status) {
      getThreatTable();
      Toastify({
        type: "success",
        message: "Selected IOC confidence has been updated."
      })
    }
  }, [editThreatConfidenceField, getThreatTable])

  useEffect(() => {
    getThreatTIDashboard();
  }, [getThreatTIDashboard]);

  useEffect(() => {
    getThreatMalwareDashboard();
  }, [getThreatMalwareDashboard]);

  useEffect(() => {
    getThreatIPDashboard();
  }, [getThreatIPDashboard]);

  const handleOpenThreatFlyout = useCallback(
    (id: string) => {
      handleOpenFlyout();
      setSelectedIOCId(id);
    },
    [handleOpenFlyout]
  );

  const handleTableSetFilter = useCallback(
    (threatTableParams: threatIntelligenceTableParams) => {
      setThreatTableParams(threatTableParams);
    },
    [setThreatTableParams]
  );

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem>
        <ThreatIntelligenceHeader />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiPageSection paddingSize="none">
          <EuiFlexGrid columns={1}>
            <EuiFlexItem>
              <TIDashboard
                isLoading={threatTIDashboard.isLoading}
                data={threatTIDashboard?.data}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <MalwareDashboard
                isLoading={threatMalwareDashboard.isLoading}
                data={threatMalwareDashboard?.data}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <IPDashboard
                isLoading={threatIPDashboard.isLoading}
                data={threatIPDashboard?.data}
              />
            </EuiFlexItem>
          </EuiFlexGrid>
          <EuiSpacer size="l" />
          <EuiPanel color="plain">
            <Table
              filterable={threatTable?.data?.filterable ?? true}
              isLoading={threatTable.isLoading}
              rows={threatTable?.data?.rows ?? []}
              columns={threatTable?.data?.columns ?? {}}
              total={threatTable?.data?.total ?? 0}
              last_row_cursor={threatTable?.data?.last_row_cursor ?? ''}
              onClick={handleOpenThreatFlyout}
              onSetFilter={handleTableSetFilter}
            />
          </EuiPanel>
          {selectedIOCId && 
            <ThreatIntelligenceDetailFlyout
              id={selectedIOCId}
              isVisible={isFlyoutVisible}
              onClose={handleCloseFlyout}
              onEditConfidence={handleEditConfidence}
            />
          }
        </EuiPageSection>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default ThreatIntelligence;
