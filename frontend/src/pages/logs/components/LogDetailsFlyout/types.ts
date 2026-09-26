export interface LogDetailsFlyoutProps {
  id: string
  selectedHit: string;
  onClose: () => void;
  onExplain?: (id: string) => void;
}