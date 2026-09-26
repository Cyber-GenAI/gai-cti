import { createContext, useCallback, useContext, useMemo, useReducer } from "react";

import {
  esQuery,
  logDistributionDashboard,
  logIndexDashboard,
  logs,
  logsState,
} from "../../types/logs";
import {
  LogsReducer,
  LogsInitialState,
} from "../../reducer/logs/logs-reducer";
import {
  AR_GET_LOGS,
  AR_GET_LOGS_DISTRIBUTION_DASHBOARD,
  AR_GET_LOGS_INDEX_DASHBOARD,
} from "../../api/routes/log";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";
import { request } from "../../api/utils/request";
import { DEFAULT_LOGS_QUERY_SIZE } from "../../constants/logs";
import Cookies from 'universal-cookie';
import { indexPattern } from "../../types/utilities";
import { AR_GET_INDEX_PATTERNS } from "../../api/routes/utilities";

const LogsContext = createContext<logsState | undefined>(undefined);

interface LogsProviderProps {
  children: React.ReactNode;
}

export const LogsProvider: React.FC<LogsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(LogsReducer, LogsInitialState);

  const clearKey = useCallback(
    ({ key }: globalPayloadClearData<keyof logsState>) => {
      dispatch({
        type: "CLEAR_KEY",
        payload: { key },
      });
    },
    []
  );

  const setIsLoading = useCallback(
    ({ key, state: loading }: globalPayloadSetIsLoading<keyof logsState>) => {
      dispatch({
        type: "SET_ISLOADING",
        payload: { key, state: loading },
      });

      if (loading)
        clearKey({ key })
    },
    []
  );

  const getLogs = useCallback(async (pattern: string, query: esQuery) => {
    setIsLoading({ key: "logs", state: true });

    const data = await request<logs>({
      url: AR_GET_LOGS(pattern),
      method: "POST",
      config: {
        headers: {
          'Authorization': `ApiKey ${new Cookies().get('es_token')}`,
          'Content-Type': 'application/json'
        },
      },
      data: {
        query,
        size: DEFAULT_LOGS_QUERY_SIZE
      }
    });

    dispatch({
      type: "SET_LOGS",
      payload: { logs: data },
    });

    setIsLoading({ key: "logs", state: false });
  }, []);

  const getLogDistributionDashboard = useCallback(async () => {
    setIsLoading({ key: "logDistributionDashboard", state: true });

    const data = await request<{ "index-time-distribution": logDistributionDashboard }>({
      url: AR_GET_LOGS_DISTRIBUTION_DASHBOARD,
      config: {
        headers: {
          'Content-Type': 'application/json'
        },
      },
    });

    dispatch({
      type: "SET_DISTRIBUTION_DASHBOARD",
      payload: { "index-time-distribution": data["index-time-distribution"] },
    });

    setIsLoading({ key: "logDistributionDashboard", state: false });
  }, [setIsLoading]);

  const getLogIndexDashboard = useCallback(async (pattern: string) => {
    setIsLoading({ key: "logIndexDashboard", state: true });

    const data = await request<{ "calender": logIndexDashboard }>({
      url: AR_GET_LOGS_INDEX_DASHBOARD(pattern),
      config: {
        headers: {
          'Content-Type': 'application/json'
        },
      },
    });

    dispatch({
      type: "SET_INDEX_DASHBOARD",
      payload: { calender: data["calender"] },
    });

    setIsLoading({ key: "logIndexDashboard", state: false });
  }, [setIsLoading]);

  const getIndexPattern = useCallback(async () => {
    setIsLoading({ key: "index_pattern", state: true });
    try {
      const data = await request<indexPattern[]>({
        url: AR_GET_INDEX_PATTERNS,
        method: "GET",
      });
      dispatch({ type: "SET_INDEX_PATTERN", payload: { index_pattern: data } });
    } finally {
      setIsLoading({ key: "index_pattern", state: false });
    }
  }, [setIsLoading]);

  const value = useMemo<logsState>(
    () => ({
      ...state,
      getLogs,
      getLogDistributionDashboard,
      getLogIndexDashboard,
      getIndexPattern
    }),
    [state, getLogs, getLogDistributionDashboard, getLogIndexDashboard, getIndexPattern]
  );
  return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>;
};

export const useLogs = (): logsState => {
  const context = useContext(LogsContext);
  if (!context) {
    throw new Error("useLogs must be used within a LogsProvider");
  }
  return context;
};
