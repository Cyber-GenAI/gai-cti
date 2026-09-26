import { memo, useEffect } from "react";
import {
  EuiCodeBlock,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiHorizontalRule,
  EuiTitle,
  useGeneratedHtmlId,
} from "@elastic/eui";
import { useManagement } from "../../../../context/management/management-context";

interface IOCFlyoutProps {
  onClose: () => void,
  isVisible: boolean,
}

const IOCFlyoutComponent = ({
  onClose,
  isVisible,
}: IOCFlyoutProps) => {
  const { injected_iocs, getInjectedIocs } = useManagement(); 
  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: "injectedIOCFlyout",
  });

  useEffect(() => {
    if (isVisible) {
      getInjectedIocs()
    }
  }, [getInjectedIocs, isVisible])
  
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
          <EuiTitle size="m">
            <h2>Injected IOC</h2>
          </EuiTitle>
          <EuiHorizontalRule margin="s" />
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiCodeBlock language="json" fontSize="m">
            {JSON.stringify(injected_iocs.data,null,'\t')}
          </EuiCodeBlock>
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  return <>{flyout}</>;
};

export const IOCFlyout = memo(IOCFlyoutComponent);
