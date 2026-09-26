import { selectedFilterProps } from "../FilterControls/types";

export interface IFilterProps {
  index: number
  filter: selectedFilterProps;
  deleteFilter: (filter: selectedFilterProps) => void;
  onSubmit: () => void;
  onFilterValueChange: (index: number, value: string) => void;
  onFilterOperatorChange: (index: number, value: string) => void;
}