export interface IAlertsFlyoutProps {
  row: Record<string, unknown>;
  onClose: () => void;
  isVisible: boolean;
  isLoading: boolean;
}
