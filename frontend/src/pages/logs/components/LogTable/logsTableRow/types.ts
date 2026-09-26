// types.ts (relevant excerpts)
export interface Hit {
  _id?: string;
  _source: {
    [key: string]: unknown;
    timestamp?: string;
    '@timestamp'?: string;
  };
}

// LogsTableRowProps.ts
export interface LogsTableRowProps {
  hit: Hit;
  onViewDetails: () => void;
  onExplainLog: () => void;
}