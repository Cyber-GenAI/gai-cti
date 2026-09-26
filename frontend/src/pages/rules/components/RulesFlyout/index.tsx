import {
  EuiButton,
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiHorizontalRule,
  EuiSkeletonText,
  EuiTitle,
  useGeneratedHtmlId
} from "@elastic/eui";
import { memo, useCallback, useEffect, useMemo } from "react";
import { LoadingPrompt } from "../../../../components";
import { useAssistant } from "../../../../context/assistant/assistant-context";
import { useRules } from "../../../../context/rules/rules-context";
import { tableColumnTypes } from "../../../../types/table";
import { renderCellType } from "../../../../utils/renderFormater";
import IntervalLevelEditor from "./components/IntervalEdit";

interface RuleDetailFlyoutProps {
  id: string;
  isVisible: boolean;
  onClose: () => void;
  onEditInterval: (id: string, interval: string) => Promise<boolean>;
}

const RuleDetailFlyoutComponent = ({
  id,
  isVisible,
  onClose,
  onEditInterval,
}: RuleDetailFlyoutProps) => {
  const { ruleDetail, getRuleDetail } = useRules();
  const { getAssistantExplain } = useAssistant();
  
  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: "RuleTableDetailFlyout",
  });

  useEffect(() => {
    getRuleDetail(id);
  }, [getRuleDetail, id]);

  const handleRenderDescription = useCallback(
    (type: tableColumnTypes, value: string, id?: string) => {
      switch (type) {
        case "editable_text":
          return id && (
            <IntervalLevelEditor
              initialValue={value}
              onSave={(interval: string) => onEditInterval(id, interval)}
            />
          );
        default:
          return renderCellType(type, value);
      }
    },
    [onEditInterval]
  );

  const handleExplainRule = useCallback(() => {
    if (id)
      getAssistantExplain('rules', id)
  }, [id, getAssistantExplain])

  const memoizedRuleDetail = useMemo(() => {
    const data = ruleDetail?.data ?? [];
    const idItem = data.find((item) => item.key.toLowerCase() === "id");
    const id = idItem ? String(idItem.value) : undefined;

    return data.map((item) => ({
      title: item.key,
      description: handleRenderDescription(item.type, item.value, id) as JSX.Element
    }));
  }, [ruleDetail?.data, handleRenderDescription]);

  const memoizedIndicator = useMemo(() => ruleDetail.data?.find(item => item.key === 'Name')?.value ?? '', [ruleDetail.data])

  if (!isVisible) return null;

  return (
    <EuiFlyout
      ownFocus
      hideCloseButton
      onClose={onClose}
      aria-labelledby={simpleFlyoutTitleId}
    >
      <EuiFlyoutHeader>
        <EuiSkeletonText size="m" isLoading={ruleDetail.isLoading} lines={1}>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem>
              <EuiTitle size="m">
                <h2>Rule: {memoizedIndicator}</h2>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton onClick={handleExplainRule} color="success" iconType="sparkles">
                Explain
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiSkeletonText>
        <EuiHorizontalRule />
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {ruleDetail.isLoading ? (
          <LoadingPrompt size="xl" />
        ) : 
          memoizedRuleDetail?.length === 1 ?
          memoizedRuleDetail?.[0]?.description:
          <EuiDescriptionList
            type="column"
            align="left"
            columnWidths={["25%", "75%"]}
            rowGutterSize="m"
            listItems={memoizedRuleDetail}
          />
        }
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export const RuleDetailFlyout = memo(RuleDetailFlyoutComponent);
