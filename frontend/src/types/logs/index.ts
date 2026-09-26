import { genericContext, globalPayloadClearData, globalPayloadSetIsLoading } from "../global"
import { indexPattern } from "../utilities";
import { VisualResponseWithType } from "../visuals";

export type esQuery = {
  bool?: {
    must?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ElasticsearchResponse<T = unknown> {
  hits: {
    total: number;
    hits: T[];
  };
}

export type logs = ElasticsearchResponse

export type logDistributionDashboard = VisualResponseWithType<'RangeBarVisual'>
export type logIndexDashboard = VisualResponseWithType<'CalenderHeatmapVisual'>

export type logsState = {
  logs: genericContext<logs>
  index_pattern: genericContext<indexPattern[]>;
  getIndexPattern: () => void;
  logDistributionDashboard: genericContext<logDistributionDashboard>
  logIndexDashboard: genericContext<logIndexDashboard>
  getLogs: (pattern: string, query: esQuery) => void
  getLogDistributionDashboard: () => void
  getLogIndexDashboard: (pattern: string) => void
}

export type LogsPayloadGetLogs = {
  logs: logs
}

export type LogsPayloadGetLogDistributionDashboard = {
  "index-time-distribution": logDistributionDashboard
}

export type LogsPayloadGetLogIndexDashboard = {
  calender: logIndexDashboard
}

export type LogsPayloadGetIndexPattern = {
  index_pattern: indexPattern[]
}

export type logsActionTypes = "SET_LOGS" | "SET_DISTRIBUTION_DASHBOARD" | "SET_INDEX_DASHBOARD" | "SET_INDEX_PATTERN"

export type logsActions<T> = {
  type: T | "SET_ISLOADING" | "CLEAR_KEY"
  payload: LogsPayloadGetLogs
  | LogsPayloadGetLogDistributionDashboard
  | LogsPayloadGetLogIndexDashboard
  | LogsPayloadGetIndexPattern
  | globalPayloadSetIsLoading<keyof logsState>
  | globalPayloadClearData<keyof logsState>
}