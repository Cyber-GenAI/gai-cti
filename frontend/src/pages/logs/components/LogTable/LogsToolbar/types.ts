import { indexPattern } from "../../../../../types/utilities";

export interface LogsToolbarProps {
  indexPatterns: indexPattern[];
  selectedIndex: string;
  totalCount: number;
  setSelectedIndex: (index: string) => void;
  selectedTimeRange: string;
  setSelectedTimeRange: (range: string) => void;
}