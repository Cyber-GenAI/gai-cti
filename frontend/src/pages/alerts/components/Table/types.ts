export interface IAlertsTableProps {
  data?: unknown[];
  isLoading: boolean;
  selectRow: (id: string) => void;
}
