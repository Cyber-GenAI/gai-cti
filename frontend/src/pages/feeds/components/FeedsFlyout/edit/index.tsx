import {
  EuiDescriptionList,
  EuiFlyout,
  EuiFlyoutBody,
  EuiMarkdownFormat,
  useGeneratedHtmlId
} from "@elastic/eui";
import { memo, useCallback, useEffect, useMemo } from "react";
import { LoadingPrompt } from "../../../../../components";
import { useFeeds } from "../../../../../context/feeds/feeds-context";
import { reliabilityLevel } from "../../../../../types/feeds";
import { tableColumnTypes } from "../../../../../types/table";
import { renderCellType } from "../../../../../utils/renderFormater";
import { ConfidenceLevelEditor } from "./components/confidence";
import { ReliabilityLevelEditor } from "./components/reliability";
import { Toastify } from "../../../../../utils/toasts";

export interface IFlyoutProps {
  id: string;
  handleCloseFlyout: () => void;
  onRefetch: () => void;
}

const FlyoutComponent = ({
  id,
  onRefetch,
  handleCloseFlyout
}: IFlyoutProps) => {
  const flyoutTitleId = useGeneratedHtmlId({ prefix: "feedFlyoutTitle" });
  const { feedDetail, getFeedDetail, editFeedConfidenceField, editFeedReliabilityField } = useFeeds();

  useEffect(() => {
    getFeedDetail(id)
  }, [getFeedDetail, id])
  
  const handleEditConfidence = useCallback(async (id: string, confidence: number) => {
    const status = await editFeedConfidenceField(id, confidence)
    if (status) {
      Toastify({ type: 'success', message: 'Confidence score updated successfully.' });
      onRefetch()
    }
  }, [editFeedConfidenceField, onRefetch])

  const handleEditReliability = useCallback(async (id: string, reliability: reliabilityLevel) => {
    const status = await editFeedReliabilityField(id, reliability)
    if (status) {
      Toastify({ type: 'success', message: 'Reliability updated successfully.' });
      onRefetch()
    }
  }, [editFeedReliabilityField, onRefetch])

  const handleRenderDescription = useCallback(
    (type: tableColumnTypes, value: string) => {
      switch (type) {
        case "editable_text":
          return (
            <ConfidenceLevelEditor
              initialValue={Number(value)}
              onSave={(confidence) => handleEditConfidence(id, confidence)}
            />
          );
        case "editable_reliability":
          return (
            <ReliabilityLevelEditor
              initialValue={value as reliabilityLevel}
              onSave={(reliability) => handleEditReliability(id, reliability)}
            />
          );
        case "text":
          return <EuiMarkdownFormat>{value}</EuiMarkdownFormat>;
        default:
          return renderCellType(type, value);
      }
    },
    [handleEditConfidence, handleEditReliability, id]
  );

  const memoizedFeedDetail = useMemo(() => {
    const data = feedDetail?.data ?? [];

    return data.map((item) => ({
      title: item.key,
      description: handleRenderDescription(item.type, item.value) as JSX.Element
    }));
  }, [feedDetail?.data, handleRenderDescription]);


  return (
    <EuiFlyout
      ownFocus
      hideCloseButton
      onClose={handleCloseFlyout}
      aria-labelledby={flyoutTitleId}
    >
      <EuiFlyoutBody>
        {feedDetail.isLoading ? (
          <LoadingPrompt size="xl" />
        ) : (
          <EuiDescriptionList
            type="column"
            align="left"
            columnWidths={["25%", "75%"]}
            rowGutterSize="m"
            listItems={memoizedFeedDetail}
          />
        )}
      </EuiFlyoutBody>
    </EuiFlyout>
  )
};

export const Flyout = memo(FlyoutComponent);
