import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
} from "@elastic/eui";
import { LogDetailsFlyoutProps } from "./types";
import { useCallback } from "react";

export const LogDetailsFlyout: React.FC<LogDetailsFlyoutProps> = ({
  id,
  selectedHit,
  onClose,
  onExplain
}) => {

  const handleExplainLog = useCallback(() => {
    onExplain?.(id)
  }, [id, onExplain])

  if (!selectedHit) return null;

  return (
    <EuiFlyout onClose={onClose} hideCloseButton side="right" aria-labelledby="flyoutTitle">
      <EuiFlyoutHeader hasBorder>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiTitle size="s">
              <h2 id="flyoutTitle">Log Details</h2>
            </EuiTitle>
          </EuiFlexItem>
          {
            onExplain &&
            <EuiFlexItem grow={false}>
              <EuiButton onClick={handleExplainLog} color="success" iconType="sparkles">
                Explain
              </EuiButton>
            </EuiFlexItem>
          }
        </EuiFlexGroup>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiCodeBlock language="json" fontSize="m">
          {selectedHit}
        </EuiCodeBlock>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

