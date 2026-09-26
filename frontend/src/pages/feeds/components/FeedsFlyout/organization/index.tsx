import { EuiDescriptionList, EuiFlyout, EuiFlyoutBody, EuiFlyoutHeader, EuiHorizontalRule, EuiMarkdownFormat, EuiSkeletonText, EuiTitle, useGeneratedHtmlId } from '@elastic/eui';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { LoadingPrompt } from '../../../../../components';
import { useFeeds } from '../../../../../context/feeds/feeds-context';
import { renderCellType } from '../../../../../utils/renderFormater';
import { tableColumnTypes } from '../../../../../types/table';

interface OrganizationsConnectorsMappingFlyoutProps {
  isVisible: boolean;
  onClose: () => void;
};

const OrganizationsConnectorsMappingFlyoutComponent = ({
  isVisible,
  onClose
}: OrganizationsConnectorsMappingFlyoutProps) => {
  const { feedOrganizationsMap, getFeedOrganizationsMap } = useFeeds();
  const flyoutTitleId = useGeneratedHtmlId({ prefix: "feedFlyout" });

  useEffect(() => {
    if (feedOrganizationsMap.data === null && isVisible) {
      getFeedOrganizationsMap()
    }
  }, [feedOrganizationsMap.data, getFeedOrganizationsMap, isVisible])

  const handleRenderDescription = useCallback(
    (type: tableColumnTypes, value: string) => {
      switch (type) {
        case "text":
          return <EuiMarkdownFormat>{value}</EuiMarkdownFormat>;
        default:
          return renderCellType(type, value);
      }
    },
    []
  );


  const memoizedFeedOrganizationsMap = useMemo(() => {
    const data = feedOrganizationsMap?.data ?? [];

    return data.map((item) => ({
      title: item.key,
      description: handleRenderDescription(item.type, item.value) as JSX.Element
    }));
  }, [feedOrganizationsMap?.data, handleRenderDescription]);

  return isVisible ? (
    <EuiFlyout
      ownFocus
      hideCloseButton
      onClose={onClose}
      aria-labelledby={flyoutTitleId}
    >
      <EuiFlyoutHeader>
        <EuiSkeletonText size="m" isLoading={feedOrganizationsMap.isLoading} lines={1}>
          <EuiTitle size="m">
            <h2>Connector-Organizations Mapping</h2>
          </EuiTitle>
        </EuiSkeletonText>
        <EuiHorizontalRule />
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
         {feedOrganizationsMap.isLoading ? (
           <LoadingPrompt size="xl" />
         ) : 
           <EuiDescriptionList
             type="column"
             align="left"
             columnWidths={["25%", "75%"]}
             rowGutterSize="m"
             listItems={memoizedFeedOrganizationsMap}
           />
         }
      </EuiFlyoutBody>
    </EuiFlyout>
  ) : null;
}

export const OrganizationsConnectorsMappingFlyout = memo(OrganizationsConnectorsMappingFlyoutComponent)