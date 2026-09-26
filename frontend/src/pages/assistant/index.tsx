import { memo, useEffect, useMemo } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiHorizontalRule,
  EuiSelect,
  EuiSelectOption,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import AssistantMessagingComponent from "./components/messaging";
import { useSocket } from "../../context/socketContext";
import { LoadingPrompt } from "../../components";
import { useLocation } from "react-router-dom";
import { useAssistant } from "../../context/assistant/assistant-context";

interface AssistantFlyoutProps {
  onClose: () => void;
  isVisible: boolean;
}

const AssistantFlyoutComponent = ({ onClose, isVisible }: AssistantFlyoutProps) => {
  const { sessionId, socket } = useSocket();
  const location = useLocation();
  const flyoutTitleId = useGeneratedHtmlId();
  const { llm: selectedLlm, availableLlms, getAvailableLlms, setLlm } = useAssistant();

  const llms: string[] = useMemo(() => availableLlms?.data ?? [], [availableLlms?.data]);

  useEffect(() => {
    if (availableLlms.data === null) {
      getAvailableLlms();
    }
  }, [availableLlms.data, getAvailableLlms])

  useEffect(() => {
    if (llms.length > 0 && !selectedLlm?.data) {
      setLlm(llms[0]);
    }
  }, [llms, selectedLlm?.data, setLlm]);

  useEffect(() => {
    if (isVisible && !sessionId) {
      const fullPath = location.pathname + location.search;
      socket?.emit("on_session_start", fullPath.substring(1));
    }
  }, [isVisible, location.pathname, location.search, sessionId, socket]);

  const options: EuiSelectOption[] = useMemo(
    () => llms.map((item) => ({ label: item, text: item, value: item })),
    [llms]
  );

  if (!isVisible) return null;

  return (
    <EuiFlyout
      maxWidth
      ownFocus
      hideCloseButton
      onClose={onClose}
      aria-labelledby={flyoutTitleId}
    >
      <EuiFlyoutHeader>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="m">
              <h2>AI Assistant</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSelect
              aria-placeholder={llms.length ? "Select LLM" : "No models available"}
              options={options}
              value={selectedLlm?.data ?? ''}
              onChange={(e) => setLlm(e.target.value)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiHorizontalRule margin="s" />
      </EuiFlyoutHeader>

      <EuiFlyoutBody className="!w-full !h-full">
        {sessionId ? (
          <AssistantMessagingComponent />
        ) : (
          <LoadingPrompt size="xl" />
        )}
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

export const AssistantFlyout = memo(AssistantFlyoutComponent);
