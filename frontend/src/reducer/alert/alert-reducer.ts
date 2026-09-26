import {
  alertState,
  alertActionTypes,
  alertActions,
  AlertPayloadGetAlertDetail,
  AlertPayloadGetDashboardSeverityLevels,
  AlertPayloadGetDashboardAlertsByName,
  AlertPayloadGetDashboardTopAlerts,
  AlertPayloadGetAlertsTable,
  AlertPayloadGetAlertsGrouped,
  AlertPayloadGetAlertsAssistant,
} from "../../types/alerts";
import { INITIAL_REDUCER_DATA } from "../../constants/global";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";

export const AlertInitialState: alertState = {
  alerts_grouped: INITIAL_REDUCER_DATA,
  alerts_table: INITIAL_REDUCER_DATA,
  severity_levels: INITIAL_REDUCER_DATA,
  alerts_by_name: INITIAL_REDUCER_DATA,
  top_alerts: INITIAL_REDUCER_DATA,
  alert_detail: INITIAL_REDUCER_DATA,
  alert_assistant: INITIAL_REDUCER_DATA,
  dateRange: undefined,
  getAlertDetail: () => { },
  getDashboard: () => { },
  getTopAlerts: () => { },
  getAlertsGrouped: () => { },
  getAlertsTable: () => { },
  getAlertAssistant: () => { },
  setDateRange: () => { }
};

export const AlertReducer = (
  state: alertState,
  action: alertActions<alertActionTypes>
): alertState => {
  switch (action.type) {
    case "SET_ALERT_DETAIL":
      return {
        ...state,
        alert_detail: {
          ...state.alert_detail,
          data: (action.payload as AlertPayloadGetAlertDetail).alert_detail,
        },
      };
          case "SET_ALERT_ASSISTANT":
      return {
        ...state,
        alert_assistant: {
          ...state.alert_assistant,
          data: (action.payload as AlertPayloadGetAlertsAssistant).alert_assistant,
        },
      };
    case "SET_SEVERITY_LEVELS":
      return {
        ...state,
        severity_levels: {
          ...state.severity_levels,
          data: (action.payload as AlertPayloadGetDashboardSeverityLevels).severity_levels,
        },
      };
    case "SET_ALERTS_BY_NAME":
      return {
        ...state,
        alerts_by_name: {
          ...state.alerts_by_name,
          data: (action.payload as AlertPayloadGetDashboardAlertsByName).alerts_by_name,
        },
      };
    case "SET_TOP_ALERTS":
      return {
        ...state,
        top_alerts: {
          ...state.top_alerts,
          data: (action.payload as AlertPayloadGetDashboardTopAlerts).top_alerts,
        },
      };
    case "SET_ALERTS_TABLE":
      return {
        ...state,
        alerts_table: {
          ...state.alerts_table,
          data: (action.payload as AlertPayloadGetAlertsTable).alerts_table,
        },
      };
    case "SET_ALERTS_GROUPED": {
      const raw = (action.payload as AlertPayloadGetAlertsGrouped).alerts_grouped;

      const data = raw
        .filter((item): item is { key: string } & typeof item =>
          typeof item.key === "string" && !item.key.includes(",")
        )
        .sort((a, b) => {
          if (a.key === "NONE") return 1;
          if (b.key === "NONE") return -1;

          return a.key.localeCompare(b.key);
        });

      return {
        ...state,
        alerts_grouped: {
          ...state.alerts_grouped,
          data,
        },
      };
    };
    case "CLEAR_KEY": {
      const key = (action.payload as globalPayloadClearData<keyof alertState>).key;

      return {
        ...state,
        [key]: {
          ...state[key],
          data: null
        }
      }
    }
    case "SET_ISLOADING": {
      const key = (action.payload as globalPayloadSetIsLoading<keyof alertState>).key;
      const isLoading = (action.payload as globalPayloadSetIsLoading<keyof alertState>).state;
      return {
        ...state,
        [key]: {
          ...state[key],
          isLoading,
        },
      };
    }
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};
