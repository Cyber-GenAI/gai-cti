import { genericTable } from "../../components";
import { fieldWithType, genericContext, genericMap, globalPayloadClearData, globalPayloadSetIsLoading } from "../global"
import { keyedBucket, severities } from "../third-party";

export type alert = Record<string, unknown>[];
export type alertTable = { rows: unknown[], total: number };

export type alertGroupedBucket = {
  description: {
    buckets: keyedBucket[];
    [key: string]: number | keyedBucket[];
  };
  severitiesSubAggregation: {
    buckets: keyedBucket<severities>[];
    [key: string]: number | keyedBucket[];
  };
  ruleName: {
    buckets: keyedBucket[];
    [key: string]: number | keyedBucket[];
  };
}

export type alertGrouped = keyedBucket & {
  unitsCount: Record<string, number>
  countSeveritySubAggregation: Record<string, number>;
  usersCountAggregation: Record<string, number>;
  hostsCountAggregation: Record<string, number>;
} & alertGroupedBucket

export type alertAssistant = (Omit<fieldWithType, 'type'> & { title: string })[];

export type alertDetail = {
  rule: fieldWithType[];
  logs: genericTable<number | string[]>;
  ti: fieldWithType[];
  map: genericMap[];
  show_ti: boolean
}

export interface DateRange {
  from: string;
  to: string;
}


export type alertState = {
  alerts_grouped: genericContext<alertGrouped[]>;
  alerts_table: genericContext<alertTable>;
  severity_levels: genericContext<keyedBucket<severities>[]>;
  alerts_by_name: genericContext<keyedBucket[]>;
  top_alerts: genericContext<keyedBucket[]>;
  alert_detail: genericContext<alertDetail>;
  alert_assistant: genericContext<alertAssistant>;
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange) => void;
  getAlertDetail: (id: string, isTI?: boolean) => void;
  getAlertAssistant: (id: string, isTI?: boolean) => void;
  getDashboard: (isTI?: boolean) => void;
  getTopAlerts: (type: string, isTI?: boolean) => void;
  getAlertsGrouped: (field: string, isTI?: boolean) => void;
  getAlertsTable: (id?: string, currentPage?: number, grouped_field?: { field: string, value: string }, isTI?: boolean, searchName?: string) => void;
}

export type AlertPayloadGetAlertDetail = {
  alert_detail: alertDetail
}

export type AlertPayloadGetDashboardSeverityLevels = {
  severity_levels: keyedBucket<severities>[]
}

export type AlertPayloadGetDashboardAlertsByName = {
  alerts_by_name: keyedBucket[]
}

export type AlertPayloadGetDashboardTopAlerts = {
  top_alerts: keyedBucket[]
}

export type AlertPayloadGetAlertsTable = {
  alerts_table: alertTable
}

export type AlertPayloadGetAlertsGrouped = {
  alerts_grouped: alertGrouped[]
}

export type AlertPayloadGetAlertsAssistant = {
  alert_assistant: alertAssistant
}

export type kibanaDashboardBucketResponse<T> = {
  aggregations: {
    [key: string]: {
      buckets: T
    }
  }
}

export type alertActionTypes =
  "SET_ALERT_DETAIL"
  | "SET_ALERT_ASSISTANT"
  | "SET_SEVERITY_LEVELS"
  | "SET_ALERTS_BY_NAME"
  | "SET_TOP_ALERTS"
  | "SET_ALERTS_TABLE"
  | "SET_ALERTS_GROUPED"
  
export type alertActions<T> = {
  type: T | "SET_ISLOADING" | "CLEAR_KEY"
  payload:
  AlertPayloadGetAlertDetail
  | AlertPayloadGetDashboardSeverityLevels
  | AlertPayloadGetDashboardAlertsByName
  | AlertPayloadGetDashboardTopAlerts
  | AlertPayloadGetAlertsTable
  | AlertPayloadGetAlertsAssistant
  | AlertPayloadGetAlertsGrouped
  | globalPayloadSetIsLoading<keyof alertState>
  | globalPayloadClearData<keyof alertState>
}