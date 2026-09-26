import {
  logsState,
  LogsPayloadGetLogs,
  logsActionTypes,
  logsActions,
  LogsPayloadGetLogDistributionDashboard,
  LogsPayloadGetLogIndexDashboard,
  LogsPayloadGetIndexPattern,
} from "../../types/logs";
import { INITIAL_REDUCER_DATA } from "../../constants/global";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";

export const LogsInitialState: logsState = {
  logs: INITIAL_REDUCER_DATA,
  logDistributionDashboard: INITIAL_REDUCER_DATA,
  logIndexDashboard: INITIAL_REDUCER_DATA,
  index_pattern: INITIAL_REDUCER_DATA,
  getIndexPattern: () => { },
  getLogs: () => { },
  getLogDistributionDashboard: () => { },
  getLogIndexDashboard: () => { },
};

export const LogsReducer = (
  state: logsState,
  action: logsActions<logsActionTypes>
): logsState => {
  switch (action.type) {
    case "SET_LOGS":
      return {
        ...state,
        logs: {
          ...state.logs,
          data: (action.payload as LogsPayloadGetLogs).logs,
        },
      };
    case "SET_INDEX_PATTERN":
      return {
        ...state,
        index_pattern: {
          ...state.index_pattern,
          data: (action.payload as LogsPayloadGetIndexPattern).index_pattern,
        },
      };
    case "SET_DISTRIBUTION_DASHBOARD":
      return {
        ...state,
        logDistributionDashboard: {
          ...state.logDistributionDashboard,
          data: (action.payload as LogsPayloadGetLogDistributionDashboard)["index-time-distribution"],
        },
      }
          case "SET_INDEX_DASHBOARD":
      return {
        ...state,
        logIndexDashboard: {
          ...state.logIndexDashboard,
          data: (action.payload as LogsPayloadGetLogIndexDashboard).calender,
        },
      }
    case "CLEAR_KEY": {
      const key = (action.payload as globalPayloadClearData<keyof logsState>).key;

      return {
        ...state,
        [key]: {
          ...state[key],
          data: null
        }
      }
    }
    case "SET_ISLOADING": {
      const key = (action.payload as globalPayloadSetIsLoading<keyof logsState>).key;
      const isLoading = (action.payload as globalPayloadSetIsLoading<keyof logsState>).state;
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
