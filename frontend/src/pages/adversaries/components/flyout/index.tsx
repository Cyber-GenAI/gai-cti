import {
  EuiBadge,
  EuiButtonIcon,
  EuiDescriptionList,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiMarkdownFormat,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useAdversaries } from "../../../../context/adversaries/adversaries-context";
import { LoadingPrompt } from "../../../../components";
import { renderCellType } from "../../../../utils/renderFormater";
import { tableColumnTypes } from "../../../../types/table";

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

interface AdversariesDetailFlyoutProps {
  path: string;
  isVisible: boolean;
  onClose: () => void;
  onEditConfidence: (id: string, confidence: number) => void;
}

const AdversariesDetailFlyoutComponent = ({
  isVisible,
  path,
  onClose,
  onEditConfidence,
}: AdversariesDetailFlyoutProps) => {
  const { adversariesDetail, getAdversariesDetail } = useAdversaries();
  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: "adversariesTableDetailFlyout",
  });

  useEffect(() => {
    if (path) getAdversariesDetail(path);
  }, [getAdversariesDetail, path]);

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
        case "text":
          return <EuiMarkdownFormat>{value}</EuiMarkdownFormat>;
        default:
          return renderCellType(type, value);
      }
    },
    [onEditConfidence]
  );

  const memoizedAdversariesDetail = useMemo(() => {
    const data = adversariesDetail?.data ?? [];
    const idItem = data.find((item) => item?.key ? item?.key?.toLowerCase() === "id" : undefined);
    const id = idItem ? String(idItem.value) : undefined;

    return data.map((item) => ({
      title: item.key,
      description: handleRenderDescription(item.type, item.value, id) as JSX.Element
    }));
  }, [adversariesDetail?.data, handleRenderDescription]);

  if (!isVisible) return null;

  return (
    <EuiFlyout
      ownFocus
      hideCloseButton
      onClose={onClose}
      aria-labelledby={simpleFlyoutTitleId}
    >
      <EuiFlyoutBody>
        {adversariesDetail.isLoading ? (
          <LoadingPrompt size="xl" />
        ) : 
          memoizedAdversariesDetail?.length === 1 ?
          memoizedAdversariesDetail?.[0]?.description:
          <EuiDescriptionList
            type="column"
            align="left"
            columnWidths={["25%", "75%"]}
            rowGutterSize="m"
            listItems={memoizedAdversariesDetail}
          />
        }
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export const AdversariesDetailFlyout = memo(AdversariesDetailFlyoutComponent);
