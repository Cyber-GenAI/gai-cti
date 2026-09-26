import { EuiComboBoxOptionOption } from "@elastic/eui";

import { genericTableColumn } from "../../types";
import { threatIntelligenceTableParams } from "../../../../types/threat-intelligence";

export interface selectedFilterProps extends genericTableColumn {
  operator: string;
  value: string[];
}

export interface IFiltersProps {
  filters: genericTableColumn[];
  onChange?: (options: EuiComboBoxOptionOption<unknown>[]) => void;
  onSelectFilter: (filter: threatIntelligenceTableParams) => void;
}
