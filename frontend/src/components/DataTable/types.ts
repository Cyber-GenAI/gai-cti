import { tableColumnFilters, tableColumnTypes } from '../../types/table';
import { threatIntelligenceTableParams } from '../../types/threat-intelligence';

export interface tableFiltersProp extends genericTableColumn { 
  id?: string;
  name: string;
  values: string;
  operator: string;
  _type: tableColumnFilters;
}

export type requestFilterParam = {
  field: string;
  values: string[];
  operator: string;
  _type: tableColumnFilters
};

export interface tableFilterOperators {
  label: string;
  value: string;
}

export interface tableNumberFilter {
  field: string;
  value: number;
  operator: string;
  _type: "number"
}

export interface tableDateFilter {
  field: string;
  value: string;
  operator: string;
  _type: "date"
}
export interface genericTableRow<T> {
  [key: string]: string | T;
}

export interface genericTableColumn {
  name: string;
  type: tableColumnTypes;
  filter?: tableColumnFilters;
  filter_operators?: string[];
  filter_options?: string[];
}

export interface genericTable<T> {
  rows: genericTableRow<T>[];
  columns: {
    [key: keyof genericTableRow<T>]: genericTableColumn;
  }
  total: number;
  last_row_cursor: string;
  description?: string | null;
  filterable: boolean;
}

export interface genericTableRequest {
  cursor?: string;
  page_size: number;
  filters?: tableColumnFilters;
}
export interface ITableProps extends genericTable<unknown> {
  onClick?: (key: string, type?: string) => void;
  onSetFilter?: (tableParams: threatIntelligenceTableParams) => void;
  isLoading: boolean;
  hasPagination?: boolean;
  searchable?: boolean;
  expanded?: boolean;
  uniqueKey?: string;
}
