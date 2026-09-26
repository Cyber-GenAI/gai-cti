import { memo, useCallback, useEffect, useMemo } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPageSection,
  EuiSpacer,
} from "@elastic/eui";
import { useNavigate, useParams } from "react-router-dom";
import { AlertsDetailHeader } from "./alertsDetailHeader";
import { AlertDetailThreat } from "./components/threats";
import { AlertDetailStatistics } from "./components/statistics";
import { AlertDetailRule } from "./components/rules";
import { AlertDetailLogs } from "./components/logs";
import { renderCellType } from "../../../utils/renderFormater";
import { useAlert } from "../../../context/alert/alert-context";

const AlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { alert_detail, alert_assistant, getAlertDetail, getAlertAssistant } =
    useAlert();

  useEffect(() => {
    if (!id) return;
    getAlertDetail(id);
    getAlertAssistant(id);
  }, [id, getAlertDetail, getAlertAssistant]);

  const handleNavigateBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const memoizedRule = useMemo(() => {
    const rule = alert_detail?.data?.rule;
    if (Array.isArray(rule)) {
      return rule.map((item) => ({
        title: item.key,
        description: renderCellType(item.type, item.value) as JSX.Element,
      }));
    }
    return [];
  }, [alert_detail?.data?.rule]);

  const memoizedThreat = useMemo(() => {
    const ti = alert_detail?.data?.ti;
    if (Array.isArray(ti)) {
      return ti.map((item) => ({
        title: item.key,
        description: renderCellType(item.type, item.value) as JSX.Element,
      }));
    }
    return [];
  }, [alert_detail?.data?.ti]);

  const memoizedMap = useMemo(() => {
    const mapData = alert_detail?.data?.map;
    if (Array.isArray(mapData)) {
      return mapData.map((item, index) => ({
        id: String(index),
        description: item.description,
        lat: item.latitude,
        lng: item.longitude,
        name: item.label,
      }));
    }
    return [];
  }, [alert_detail?.data?.map]);

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexItem>
        <AlertsDetailHeader onBack={handleNavigateBack} />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiHorizontalRule margin="none" />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiPageSection className="!h-full" paddingSize="none">
          <AlertDetailStatistics
            isLoading={alert_assistant.isLoading}
            assistant={alert_assistant.data ?? []}
          />
          <EuiSpacer />

          <EuiFlexGroup>
            <EuiFlexItem grow={4}>
              <AlertDetailRule
                isLoading={alert_detail.isLoading}
                ruleDetail={memoizedRule}
              />
            </EuiFlexItem>

            <EuiFlexItem grow={6}>
              {alert_detail?.data?.show_ti ? (
                <AlertDetailThreat
                  isLoading={alert_detail.isLoading}
                  ti={memoizedThreat}
                  map={memoizedMap}
                />
              ) : (
                alert_detail?.data?.logs && (
                  <AlertDetailLogs
                    logs={alert_detail.data.logs}
                    isLoading={alert_detail.isLoading}
                  />
                )
              )}
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer />

          {alert_detail?.data?.show_ti && (
            <AlertDetailLogs
              logs={alert_detail?.data?.logs}
              isLoading={alert_detail.isLoading}
            />
          )}
        </EuiPageSection>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default memo(AlertDetail);
