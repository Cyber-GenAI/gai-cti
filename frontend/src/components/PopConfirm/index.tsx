import React, { cloneElement, isValidElement, memo, ReactNode, useCallback } from 'react';
import {
  EuiButton,
  EuiConfirmModal,
  EuiFlexGroup,
  EuiFlexItem,
  useGeneratedHtmlId,
} from '@elastic/eui';
import { useFlyout } from '../../hooks/useFlyout';

interface IPopConfirmProps {
  title: string
  description?: string
  trigger: ReactNode
  type?: "danger" | "text" | "accent" | "primary" | "success" | "warning"
  onConfirm: () => void
}

const PopConfirmComponent = ({
  title,
  type = "text",
  description,
  trigger,
  onConfirm,
}: IPopConfirmProps) => {
  const { isFlyoutVisible, handleCloseFlyout, handleOpenFlyout } = useFlyout(false)
  const destroyModalTitleId = useGeneratedHtmlId();

  const handleConfirm = useCallback(() => {
    onConfirm()
    handleCloseFlyout()
  }, [handleCloseFlyout, onConfirm])

  const handleTriggerClick = () => {
    handleOpenFlyout(); // Open the flyout
  };


  return (
    <>
      <EuiFlexGroup responsive={false} wrap gutterSize="xs">
        <EuiFlexItem grow={false}>
          {isValidElement(trigger) ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cloneElement(trigger as React.ReactElement<any>, { onClick: handleTriggerClick })
          ) : (
            <EuiButton color='text' slot='all' onClick={handleTriggerClick}>
              {trigger}
            </EuiButton>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>

      {isFlyoutVisible && (
        <EuiConfirmModal
          aria-labelledby={destroyModalTitleId}
          title={title}
          titleProps={{ id: destroyModalTitleId }}
          onCancel={handleCloseFlyout}
          onConfirm={handleConfirm}
          cancelButtonText="Cancel"
          confirmButtonText="Confirm"
          buttonColor={type}
          defaultFocusedButton="confirm"
        >
          {description && <p>{description}</p>}
        </EuiConfirmModal>
      )}
    </>
  );
};

export const PopConfirm = memo(PopConfirmComponent)