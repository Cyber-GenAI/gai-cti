import { memo, useCallback } from "react";
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiTextArea,
} from "@elastic/eui";

interface AssistantInputProps {
  onSendMessage: (message: string) => void;
  onClearChat: () => void
  disabled: boolean
}

const AssistantInputComponent = ({
  onSendMessage,
  onClearChat,
  disabled
}: AssistantInputProps) => {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const message = (formData.get("input") as string)?.trim();

    if (message) {
      onSendMessage(message);
      e.currentTarget.reset();
    }
  };

  const handleClearChat = useCallback(() => {
    onClearChat()
  }, [onClearChat])

  return (
    <EuiForm component="form" onSubmit={handleSubmit}>
      <EuiFlexGroup gutterSize="s" alignItems="center" className="relative">
        <EuiButtonIcon
          disabled={disabled}
          type="button"
          onClick={handleClearChat}
          aria-label="clear history"
          display="empty"
          color="danger"
          iconType="trash"
        />
        <EuiFlexItem>
          <EuiTextArea
            autoFocus
            placeholder="Ask me anything..."
            aria-label="Assistant chat input"
            fullWidth
            disabled={disabled}
            resize="none"
            className="!min-h-12 !line-clamp-1 !pr-16"
            style={{ height: "48px" }}
            name="input"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const form = e.currentTarget.form;
                if (form) {
                  form.requestSubmit();
                }
              }
            }}
          />
        </EuiFlexItem>

        <EuiFlexItem
          grow={false}
          className="absolute right-2 bottom-3.5"
        >
          <EuiButtonIcon
            disabled={disabled}
            type="submit"
            aria-label="Send"
            display="empty"
            iconType="play"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  );
};

export const AssistantInput = memo(AssistantInputComponent);
