import { memo, useCallback, useEffect, useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPageSection,
  EuiPanel,
} from "@elastic/eui";
import { useNavigate } from "react-router-dom";
import { AdversariesHeader } from "./components/header";
import { Adversaries as AdversariesSidebar } from "./components/adversaries";
import { AdversaryScheduleModal } from "./components/modal";
import { useFlyout } from "../../hooks/useFlyout";
import { useDidMountEffect } from "../../hooks/useDidMountEffect";
import { useAdversaries } from "../../context/adversaries/adversaries-context";
import { adversary as adversaryType } from "../../types/adversaries";
import { AdversariesDashboard } from "./components/dashboard";
import { Adversary } from "./components/adversary";
import { useUrlState } from "../../hooks/useUrlState";
import { AdversariesDetailFlyout } from "./components/flyout";
import { useThreatIntelligence } from "../../context/threat-intelligence/threat-intelligence-context";
import { Toastify } from "../../utils/toasts";

const Adversaries = memo(() => {
  const { adversaries, getAdversaries } = useAdversaries();
  const { editThreatConfidenceField } = useThreatIntelligence();

  const [adversariesDetailPath, setAdversariesDetailPath] = useState<string | undefined>();

  const { isFlyoutVisible, handleOpenFlyout, handleCloseFlyout } = useFlyout(false);
  const adversariesDetailFlyout = useFlyout(false);

  const [selectedAdversary, setSelectedAdversary] = useUrlState("adversaryId");

  const navigate = useNavigate();

  const handleSelectApt = useCallback(
    (apt: adversaryType) => {
      setSelectedAdversary(apt.id);
    },
    [setSelectedAdversary]
  );

  const handleClickSpecificity = useCallback(
    () => navigate("mitre/specificity"),
    [navigate]
  );

  const handleClickAdversariesDetail = useCallback((path: string) => {
    setAdversariesDetailPath(path)
    adversariesDetailFlyout.handleOpenFlyout();
  }, [adversariesDetailFlyout])

  const handleEditConfidence = useCallback(async (id: string, confidence: number) => {
    const status = await editThreatConfidenceField(id, confidence);
    if (status) {
      Toastify({
        type: "success",
        message: "Selected IOC confidence has been updated."
      })
    }
  }, [editThreatConfidenceField])

  const handleClickMap = useCallback(() => navigate("mitre/map"), [navigate]);

  useEffect(() => {
    getAdversaries();
  }, [getAdversaries]);

  useDidMountEffect(() => {
    if (adversaries.data?.length && !selectedAdversary) {
      handleSelectApt(adversaries.data[0]);
    }
  }, [adversaries.data]);

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem>
        <AdversariesHeader
          onSpecificityClick={handleClickSpecificity}
          onMapClick={handleClickMap}
          onScheduleClick={handleOpenFlyout}
        />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiPageSection paddingSize="none">
          <EuiFlexGroup direction="column" gutterSize="m">
            <AdversariesDashboard />

            <EuiFlexItem>
              <EuiFlexGroup gutterSize="m" responsive style={{height: '75rem'}}>
                <EuiFlexItem grow={2}>
                  <AdversariesSidebar
                    isLoading={adversaries.isLoading}
                    adversaries={adversaries.data ?? []}
                    handleSelectApt={handleSelectApt}
                    selectedAdversary={selectedAdversary}
                  />
                </EuiFlexItem>

                <EuiFlexItem grow={8}>
                  <EuiPanel style={{ height: "75rem" }}>
                    <Adversary
                      onClickAdversariesDetail={handleClickAdversariesDetail}
                      selectedAdversary={selectedAdversary}
                    />
                  </EuiPanel>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPageSection>
      </EuiFlexItem>

      {isFlyoutVisible && (
        <AdversaryScheduleModal
          isOpen={isFlyoutVisible}
          handleCloseModal={handleCloseFlyout}
        />
      )}
      {
        adversariesDetailPath &&
          <AdversariesDetailFlyout
            isVisible={adversariesDetailFlyout.isFlyoutVisible}
            onClose={adversariesDetailFlyout.handleCloseFlyout}
            onEditConfidence={handleEditConfidence}
            path={adversariesDetailPath}
          />
      }
    </EuiFlexGroup>
  );
});

export default memo(Adversaries);
