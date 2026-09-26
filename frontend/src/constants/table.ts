import { tableFilterOperators } from "../components/DataTable/types";
import { genericObject } from "../types/global";
import { threatIntelligenceTableParams } from "../types/threat-intelligence";

export const page_size = 20;

export type numberFilterOperators = "gt" | "lt" | "eq" | "gte" | "lte" | "not_eq"
export type dateFilterOperators = "gt" | "lt" | "eq" | "gte" | "lte" | "not_eq"

export const table_filter_operators: genericObject<tableFilterOperators> = {
  "gt": {
    label: 'Greater than',
    value: '>',
  },
  "lt": {
    label: 'Less than',
    value: '<',
  },
  "eq": {
    label: 'Equal to',
    value: '=',
  },
  "gte": {
    label: 'Greater than or equal to',
    value: '≥',
  },
  "lte": {
    label: 'Less than or equal to',
    value: '≤',
  },
  "not_eq": {
    label: 'Not equal to',
    value: '≠',
  },
  "contains": {
    label: "Contains the",
    value: 'contains'
  },
  "not_contains": {
    label: "Not Contains the",
    value: 'not contains'
  },
  "search": {
    label: "Search",
    value: 'search'
  },
  "nil": {
    label: "Empty",
    value: 'is empty'
  },
  "not_nil": {
    label: "Not empty",
    value: "is not empty"
  }
}

export const initial_table_params: threatIntelligenceTableParams = {
  cursor: null,
  page_size: page_size,
  filters: []
}