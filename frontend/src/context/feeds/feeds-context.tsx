import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import {
  AR_CLEAN_UP_FEED_CONNECTORS,
  AR_EDIT_FEED_CONFIDENCE,
  AR_EDIT_FEED_RELIABILITY,
  AR_GET_FEEDS_CONFIGURATION_CONNECTORS,
  AR_GET_FEEDS_CONFIGURATION_FIELDS,
  AR_GET_FEEDS_CONFIGURATION_HELP,
  AR_GET_FEEDS_DASHBOARD,
  AR_GET_FEEDS_DASHBOARD_IOC_COUNTER_OVERTIME,
  AR_GET_FEEDS_MAIN_TABLE,
  AR_GET_FEEDS_ORGANIZATIONS_MAP,
  AR_GET_FEEDS_SECOND_TABLE,
  AR_GET_FEED_DETAIL,
  AR_SUBMIT_FEEDS_CONFIGURATION_FIELDS
} from "../../api/routes/feed";
import { buildQuery } from "../../api/utils/buildQuery";
import { request } from "../../api/utils/request";
import { GroupedFormData, InputField } from "../../components/Form/types";
import {
  FeedsInitialState,
  FeedsReducer,
} from "../../reducer/feeds/feeds-reducer";
import {
  feedConfigurationConnector,
  feedDashboardIocCounterOverTime,
  feedDashboardIocCounterOverTimeParams,
  feedDetail,
  feedDistribution,
  feedIocCount,
  feedMetric,
  feedState,
  feedTable,
  reliabilityLevel
} from "../../types/feeds";
import { fieldWithType, globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";

const FeedsContext = createContext<feedState | undefined>(undefined);

interface FeedsProviderProps {
  children: React.ReactNode;
}

export const FeedsProvider: React.FC<FeedsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(FeedsReducer, FeedsInitialState);

  const clearKey = useCallback(
    ({ key }: globalPayloadClearData<keyof feedState>) => {
      dispatch({
        type: "CLEAR_KEY",
        payload: { key },
      });
    },
    []
  );

  const setIsLoading = useCallback(
    ({ key, state: loading }: globalPayloadSetIsLoading<keyof feedState>) => {
      dispatch({
        type: "SET_ISLOADING",
        payload: { key, state: loading },
      });

      if (loading)
        clearKey({ key })
    },
    []
  );

  const getFeedTable = useCallback(async () => {
    setIsLoading({ key: "feedsTable", state: true });

    const data = await request<feedTable>({
      url: AR_GET_FEEDS_MAIN_TABLE,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_FEED_TABLE",
      payload: { feedsTable: data },
    });

    setIsLoading({ key: "feedsTable", state: false });
  }, [setIsLoading]);

    const getFeedSecondTable = useCallback(async () => {
    setIsLoading({ key: "feedsSecondTable", state: true });

    const data = await request<feedTable>({
      url: AR_GET_FEEDS_SECOND_TABLE,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_FEED_SECOND_TABLE",
      payload: { feedsSecondTable: data },
    });

    setIsLoading({ key: "feedsSecondTable", state: false });
  }, [setIsLoading]);

  const getFeedDashboard = useCallback(async () => {
    setIsLoading({ key: "feedDashboard", state: true });

    const data = await request<{
      total: feedMetric
      active: feedMetric
      "distribution-pie": feedDistribution
      "ioc-count": feedIocCount
    }>({
      url: AR_GET_FEEDS_DASHBOARD,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_FEED_DASHBOARD",
      payload: {
        feedDashboard: {
          active: data.active,
          total: data.total,
          distribution: data["distribution-pie"],
          iocCount: data["ioc-count"],
        }
      },
    });

    setIsLoading({ key: "feedDashboard", state: false });
  }, [setIsLoading]);

  const getFeedDashboardIocCounterOverTime = useCallback(async (params: feedDashboardIocCounterOverTimeParams) => {
    setIsLoading({ key: "feedDashboardIocCounterOverTime", state: true });

    const url = AR_GET_FEEDS_DASHBOARD_IOC_COUNTER_OVERTIME + buildQuery(params);

    const data = await request<feedDashboardIocCounterOverTime>({
      url,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_FEED_DASHBOARD_IOC_COUNTER_OVERTIME",
      payload: {
        feedDashboardIocCounterOverTime: data
      },
    });

    setIsLoading({ key: "feedDashboardIocCounterOverTime", state: false });
  }, [setIsLoading]);

  const getFeedDetail = useCallback(async (id: string) => {
    setIsLoading({ key: "feedDetail", state: true });

    const data = await request<feedDetail>({
      url: AR_GET_FEED_DETAIL(id),
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_FEED_DETAIL",
      payload: { feedDetail: data },
    });

    setIsLoading({ key: "feedDetail", state: false });
  }, [setIsLoading]);

  const getFeedConfigurationConnectors = useCallback(async () => {
    setIsLoading({ key: "feedConfigurationConnectors", state: true });

    const data = await request<feedConfigurationConnector[]>({
      url: AR_GET_FEEDS_CONFIGURATION_CONNECTORS,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_FEED_CONFIGURATION_CONNECTORS",
      payload: { feedConfigurationConnectors: data },
    });

    setIsLoading({ key: "feedConfigurationConnectors", state: false });
  }, [setIsLoading]);

  const getFeedConfigurationFields = useCallback(async (connectors: string[]) => {
    setIsLoading({ key: "feedConfigurationFields", state: true });

    const query = buildQuery({ conn_names: connectors })
    const url = `${AR_GET_FEEDS_CONFIGURATION_FIELDS}${query}`

    const data = await request<InputField[]>({
      url,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_FEED_CONFIGURATION_FIELDS",
      payload: { feedConfigurationFields: data },
    });

    setIsLoading({ key: "feedConfigurationFields", state: false });
  }, [setIsLoading]);

    const getFeedOrganizationsMap = useCallback(async () => {
    setIsLoading({ key: "feedOrganizationsMap", state: true });

    const data = await request<fieldWithType[]>({
      url: AR_GET_FEEDS_ORGANIZATIONS_MAP,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_FEED_ORGANIZATION_MAP",
      payload: { feedOrganizationsMap: data },
    });

    setIsLoading({ key: "feedOrganizationsMap", state: false });
  }, [setIsLoading]);

  const getFeedConfigurationHelp = useCallback(async (group: string) => {
    setIsLoading({ key: "feedMarkdown", state: true });

    const data = await request<string>({
      url: AR_GET_FEEDS_CONFIGURATION_HELP(group),
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_FEED_MARKDOWN",
      payload: { feedMarkdown: data },
    });

    setIsLoading({ key: "feedMarkdown", state: false });
  }, [setIsLoading]);

  const submitFeedConfigurationFields = useCallback(async (configuration: GroupedFormData) => {
    setIsLoading({ key: "feedMarkdown", state: true });
    try {
      const data = await request<string>({
        url: AR_SUBMIT_FEEDS_CONFIGURATION_FIELDS,
        method: "POST",
        config: {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
        },
        data: configuration
      });

      dispatch({
        type: 'SET_FEED_MARKDOWN',
        payload: { feedMarkdown: data }
      })

      return true
    } catch {
      return false
    } finally {
      setIsLoading({ key: "feedMarkdown", state: false });
    }
  }, [setIsLoading]);

  const editFeedConfidenceField = useCallback(async (id: string, confidence: number) => {
    try {
      const url = AR_EDIT_FEED_CONFIDENCE(id) + buildQuery({ data: confidence })
      await request<null>({
        url,
        method: "PATCH",
        config: {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
        },
        data: { data: confidence }
      });

      return true
    } catch {
      return false
    }
  }, []);

  const editFeedReliabilityField = useCallback(async (id: string, reliability: reliabilityLevel) => {
    try {
      const url = AR_EDIT_FEED_RELIABILITY(id) + buildQuery({ data: reliability })
      await request<null>({
        url,
        method: "PATCH",
        config: {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
        },
        data: { data: reliability }
      });

      return true
    } catch {
      return false
    }
  }, []);

  const cleanUpConnectors = useCallback(async () => {
    try {
      await request<null>({
        url: AR_CLEAN_UP_FEED_CONNECTORS,
        method: "POST",
        config: {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
        },
      });

      return true
    } catch {
      return false
    }
  }, []);

  const value = useMemo<feedState>(
    () => ({
      ...state,
      getFeedTable,
      getFeedSecondTable,
      getFeedDetail,
      getFeedDashboard,
      getFeedDashboardIocCounterOverTime,
      getFeedOrganizationsMap,
      getFeedConfigurationConnectors,
      getFeedConfigurationFields,
      getFeedConfigurationHelp,
      submitFeedConfigurationFields,
      editFeedConfidenceField,
      editFeedReliabilityField,
      cleanUpConnectors
    }),
    [state, getFeedTable, getFeedSecondTable, getFeedDetail, getFeedDashboard, getFeedDashboardIocCounterOverTime, getFeedOrganizationsMap, getFeedConfigurationConnectors, getFeedConfigurationFields, getFeedConfigurationHelp, submitFeedConfigurationFields, editFeedConfidenceField, editFeedReliabilityField, cleanUpConnectors]
  );

  return <FeedsContext.Provider value={value}>{children}</FeedsContext.Provider>;
};

export const useFeeds = (): feedState => {
  const context = useContext(FeedsContext);
  if (!context) {
    throw new Error("useFeeds must be used within a FeedsProvider");
  }
  return context;
};
