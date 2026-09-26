import {
  EuiBadge,
  EuiButton,
  EuiButtonIcon,
  EuiDescriptionList,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiHorizontalRule,
  EuiSkeletonText,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { LoadingPrompt } from "../../../../components";
import { renderCellType } from "../../../../utils/renderFormater";
import { tableColumnTypes } from "../../../../types/table";
import { useThreatIntelligence } from "../../../../context/threat-intelligence/threat-intelligence-context";
import { useAssistant } from "../../../../context/assistant/assistant-context";

const ConfidenceLevelEditor = ({
  initialValue,
  onSave,
}: {
  initialValue: number;
  onSave: (val: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => setValue(initialValue), [initialValue]);

  const saveValue = () => {
    setIsEditing(false);
    if (value !== initialValue) onSave(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveValue();
    if (e.key === "Escape") {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  return (
    <EuiFlexGroup alignItems="center" gutterSize="s">
      <EuiFlexItem grow={false}>
        {isEditing ? (
          <EuiFieldText
            compressed
            type="number"
            value={value}
            onChange={(e) => setValue(Math.min(Number(e.target.value), 100))}
            onBlur={saveValue}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <EuiBadge
            color={`rgba(77, 210, 202, ${(value / 100) * 1.15})`}
            className="!z-10"
          >
            {String(value)}
          </EuiBadge>
        )}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          size="xs"
          iconType={isEditing ? "check" : "pencil"}
          aria-label={isEditing ? "save" : "edit"}
          onClick={() => (isEditing ? saveValue() : setIsEditing(true))}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

interface ThreatIntelligenceDetailFlyoutProps {
  id: string;
  isVisible: boolean;
  onClose: () => void;
  onEditConfidence: (id: string, confidence: number) => void;
}

const ThreatIntelligenceDetailFlyoutComponent = ({
  id,
  isVisible,
  onClose,
  onEditConfidence,
}: ThreatIntelligenceDetailFlyoutProps) => {
  const { threatMetadata, getThreatMetadata } = useThreatIntelligence();
  const { getAssistantExplain } = useAssistant();
  
  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: "ThreatIntelligenceTableDetailFlyout",
  });

  useEffect(() => {
    getThreatMetadata(id);
  }, [getThreatMetadata, id]);

  const handleRenderDescription = useCallback(
    (type: tableColumnTypes, value: string, id?: string) => {
      switch (type) {
        case "editable_text":
          return (
            <ConfidenceLevelEditor
              initialValue={Number(value)}
              onSave={(confidence) => id && onEditConfidence(id, confidence)}
            />
          );
        default:
          return renderCellType(type, value);
      }
    },
    [onEditConfidence]
  );

  const handleExplainThreat = useCallback(() => {
    if (id)
      getAssistantExplain('ti', id)
  }, [id, getAssistantExplain])

  const memoizedThreatIntelligenceDetail = useMemo(() => {
    const data = threatMetadata?.data ?? [];
    const idItem = data.find((item) => item.key.toLowerCase() === "id");
    const id = idItem ? String(idItem.value) : undefined;

    return data.map((item) => ({
      title: item.key,
      description: handleRenderDescription(item.type, item.value, id) as JSX.Element
    }));
  }, [threatMetadata?.data, handleRenderDescription]);

  const memoizedIndicator = useMemo(() => threatMetadata.data?.find(item => item.key === 'Name')?.value ?? '', [threatMetadata.data])

  if (!isVisible) return null;

  return (
    <EuiFlyout
      ownFocus
      hideCloseButton
      onClose={onClose}
      aria-labelledby={simpleFlyoutTitleId}
    >
      <EuiFlyoutHeader>
        <EuiSkeletonText size="m" isLoading={threatMetadata.isLoading} lines={1}>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem>
              <EuiTitle size="m">
                <h2>Indicator: {memoizedIndicator}</h2>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton onClick={handleExplainThreat} color="success" iconType="sparkles">
                Explain
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiSkeletonText>
        <EuiHorizontalRule />
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {threatMetadata.isLoading ? (
          <LoadingPrompt size="xl" />
        ) : 
          memoizedThreatIntelligenceDetail?.length === 1 ?
          memoizedThreatIntelligenceDetail?.[0]?.description:
          <EuiDescriptionList
            type="column"
            align="left"
            columnWidths={["25%", "75%"]}
            rowGutterSize="m"
            listItems={memoizedThreatIntelligenceDetail}
          />
        }
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export const ThreatIntelligenceDetailFlyout = memo(ThreatIntelligenceDetailFlyoutComponent);
