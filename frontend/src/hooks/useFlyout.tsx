import { useCallback, useState } from "react";

export const useFlyout = (initial: boolean) => {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState<boolean>(initial);

  const handleOpenFlyout = useCallback(() => {
    setIsFlyoutVisible(true);
  }, []);

  const handleCloseFlyout = useCallback(() => {
    setIsFlyoutVisible(false);
  }, []);

  const handleToggleFlyout = useCallback(() => {
    setIsFlyoutVisible(prev => !prev)
  }, [])

  return {
    isFlyoutVisible,
    handleOpenFlyout,
    handleCloseFlyout,
    handleToggleFlyout
  };
}