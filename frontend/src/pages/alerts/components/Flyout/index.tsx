import React, { memo, useMemo } from "react";
import {
  EuiDescriptionList,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiHorizontalRule,
  EuiSkeletonText,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { IAlertsFlyoutProps } from "./types";

const AlertsFlyoutComponent: React.FC<IAlertsFlyoutProps> = ({
  row,
  onClose,
  isVisible,
  isLoading,
}) => {
  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: "simpleFlyoutTitle",
  });

  const memoizedRule = useMemo(
    () =>
      row &&
      Object.keys(row).map((item) => {
        return {
          title: item,
          description: String(row[item]),
        };
      }),
    [row]
  );

  let flyout;
  if (isVisible) {
    flyout = (
      <EuiFlyout
        ownFocus
      hideCloseButton
        onClose={onClose}
        aria-labelledby={simpleFlyoutTitleId}
      >
        <EuiFlyoutHeader>
          <EuiSkeletonText size="m" isLoading={isLoading} lines={1}>
            <EuiTitle size="m">
              <h2>{String(row["@timestamp"])}</h2>
            </EuiTitle>
          </EuiSkeletonText>
          <EuiHorizontalRule />
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiSkeletonText isLoading={isLoading} lines={10} size="relative">
            <EuiDescriptionList
              type="column"
              align="left"
              columnWidths={["25%", "75%"]}
              rowGutterSize="m"
              listItems={memoizedRule ?? []}
            />
          </EuiSkeletonText>
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  return <>{flyout}</>;
};

export const AlertsFlyout = memo(AlertsFlyoutComponent);
