/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useCallback, useContext, useMemo, useReducer, useState } from "react";
import Cookies from 'universal-cookie';

import {
  alertState,
  alertDetail,
  alertGrouped,
  kibanaDashboardBucketResponse,
  alertAssistant,
  DateRange,
} from "../../types/alerts";
import { AlertReducer, AlertInitialState } from "../../reducer/alert/alert-reducer";
import {
  AR_GET_ALERT_ASSISTANT,
  AR_GET_ALERT_DETAIL,
  AR_KIBANA_ALERTS_DASHBOARD,
  AR_KIBANA_LIST_ALERTS,
  AR_KIBANA_LIST_ALERTS_GROUPS,
} from "../../api/routes/alert";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";
import { request } from "../../api/utils/request";
import {
  alertsGroupedPayload,
  alertTableBaseRequest,
  dashboardAlertsByNamePayload,
  dashboardSeverityLevelsPayload,
  dashboardTopAlertsPayload,
} from "./payloads";
import { decodeCompressedBase64 } from "../../utils";
import { Toastify } from "../../utils/toasts";
import { keyedBucket, severities } from "../../types/third-party";
import { source_options } from "../../pages/alerts/constants";
import { page_size } from "../../constants/table";
import { useDidMountEffect } from "../../hooks/useDidMountEffect";

const AlertContext = createContext<alertState | undefined>(undefined);

interface AlertProviderProps {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(AlertReducer, AlertInitialState);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: "now/y",
    to: "now",
  });

  const clearKey = useCallback(
    ({ key }: globalPayloadClearData<keyof alertState>) => {
      dispatch({ type: "CLEAR_KEY", payload: { key } });
    },
    []
  );

  const setIsLoading = useCallback(
    ({ key, state: loading }: globalPayloadSetIsLoading<keyof alertState>) => {
      dispatch({ type: "SET_ISLOADING", payload: { key, state: loading } });
      if (loading) clearKey({ key });
    },
    [clearKey]
  );

  const getTIFilter = useCallback((isTI?: boolean) => {
    return isTI ? [{ match_phrase: { "kibana.alert.rule.tags": "Type: GAI_CTI_TI" } }] : [];
  }, []);

  const getTimeRangeFilter = useCallback((range?: DateRange) => {
    return range
      ? { range: { "@timestamp": { gte: range.from, lte: range.to === "now" ? new Date().toISOString() : range.to } } }
      : null;
  }, []);

  const getRuleNameFilter = useCallback((searchName?: string) => {
    return searchName ?
      {
        "bool": {
          "should": [
            {
              "wildcard": {
                "kibana.alert.rule.name": {
                  "value": `*${searchName}*`,
                  "case_insensitive": true
                }
              }
            }
          ],
          "minimum_should_match": 1
        }
      } :
      null;
  }, [])

  const applyFilters = useCallback(
    (baseFilter: any[] = [], isTI?: boolean, searchName?: string) => {
      const filters: any[] = [...baseFilter];
      const timeFilter = getTimeRangeFilter(dateRange);
      const searchFilter = getRuleNameFilter(searchName);
      if (timeFilter) filters.push(timeFilter);
      if (searchFilter) filters.push(searchFilter);
      filters.push(...getTIFilter(isTI));
      return filters;
    },
    [getTimeRangeFilter, dateRange, getRuleNameFilter, getTIFilter]
  );

  const getAlertsTable = useCallback(
    async (
      id?: string,
      currentPage?: number,
      group_field?: { field: string; value: string },
      isTI?: boolean,
      searchName?: string,
    ) => {
      await setIsLoading({ key: "alerts_table", state: true });

      try {
        const mustNot =
          group_field?.value === alertsGroupedPayload('', false).runtime_mappings.groupByField.script.params.uniqueValue
            ? [{ exists: { field: group_field.field } }]
            : alertTableBaseRequest.request.query.bool.filter.bool.must_not;

        const baseFilter =
          group_field?.value && group_field.value !== alertsGroupedPayload('', false).runtime_mappings.groupByField.script.params.uniqueValue
            ? [
              {
                script: {
                  script: {
                    source: "doc[params['field']].size()==params['size']",
                    params: { field: group_field.field, size: 1 },
                  },
                },
              },
              { match_phrase: { [group_field.field]: group_field.value } },
            ]
            : [];

        const response = await fetch(AR_KIBANA_LIST_ALERTS, {
          method: "POST",
          headers: {
            Authorization: `ApiKey ${new Cookies().get('es_token')}`,
            "Content-Type": "application/json",
            "kbn-xsrf": "true",
          },
          body: JSON.stringify({
            batch: [
              {
                request: {
                  ...alertTableBaseRequest.request,
                  query: {
                    bool: {
                      filter: applyFilters(baseFilter, isTI, searchName),
                      must_not: mustNot,
                    },
                  },
                  pagination: {
                    pageIndex: currentPage ? currentPage - 1 : 0,
                    pageSize: page_size,
                  },
                  ...(id ? { id } : {}),
                },
                options: alertTableBaseRequest.options,
              },
            ],
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch");

        const base64 = await response.text();
        const result = decodeCompressedBase64(base64) as {
          result: {
            id: string;
            rawResponse: {
              hits: { hits: Array<{ fields: Record<string, unknown>; _id: string }>; total: number };
            };
            isPartial: boolean;
          };
        };

        if (result.result.isPartial) {
          setTimeout(() => getAlertsTable(result.result.id), 500);
        }

        dispatch({
          type: "SET_ALERTS_TABLE",
          payload: {
            alerts_table: {
              rows: result.result.rawResponse.hits.hits.map((item) => ({
                id: item._id,
                ...item.fields,
              })),
              total: result.result.rawResponse.hits.total,
            },
          },
        });
      } catch (error) {
        Toastify({ type: "error", message: (error as Error).message });
      } finally {
        await setIsLoading({ key: "alerts_table", state: false });
      }
    },
    [applyFilters]
  );

  const getDashboardSeverityLevels = useCallback(
    async (isTI?: boolean) => {
      await setIsLoading({ key: "severity_levels", state: true });

      try {
        const data = await request<kibanaDashboardBucketResponse<keyedBucket<severities>[]>>({
          url: AR_KIBANA_ALERTS_DASHBOARD,
          method: "POST",
          config: {
            headers: {
              Authorization: `ApiKey ${new Cookies().get('es_token')}`,
              "Content-Type": "application/json",
              "kbn-xsrf": "true",
            },
          },
          data: {
            ...dashboardSeverityLevelsPayload(!!isTI),
            query: {
              bool: { filter: applyFilters([], isTI) },
            },
          },
        });

        dispatch({
          type: "SET_SEVERITY_LEVELS",
          payload: { severity_levels: data.aggregations.statusBySeverity.buckets },
        });
      } finally {
        await setIsLoading({ key: "severity_levels", state: false });
      }
    },
    [applyFilters]
  );

  const getDashboardAlertsByName = useCallback(
    async (isTI?: boolean) => {
      await setIsLoading({ key: "alerts_by_name", state: true });

      try {
        const data = await request<kibanaDashboardBucketResponse<keyedBucket[]>>({
          url: AR_KIBANA_ALERTS_DASHBOARD,
          method: "POST",
          config: {
            headers: {
              Authorization: `ApiKey ${new Cookies().get('es_token')}`,
              "Content-Type": "application/json",
              "kbn-xsrf": "true",
            },
          },
          data: {
            ...dashboardAlertsByNamePayload(!!isTI),
            query: {
              bool: { filter: applyFilters([], isTI) },
            },
          },
        });

        dispatch({
          type: "SET_ALERTS_BY_NAME",
          payload: { alerts_by_name: data.aggregations.alertsByRule.buckets },
        });
      } finally {
        await setIsLoading({ key: "alerts_by_name", state: false });
      }
    },
    [applyFilters]
  );

  const getDashboardTopAlerts = useCallback(
    async (field?: string, isTI?: boolean) => {
      await setIsLoading({ key: "top_alerts", state: true });

      try {
        const filter_field = field ?? source_options[0].value;
        const data = await request<kibanaDashboardBucketResponse<keyedBucket[]>>({
          url: AR_KIBANA_ALERTS_DASHBOARD,
          method: "POST",
          config: {
            headers: {
              Authorization: `ApiKey ${new Cookies().get('es_token')}`,
              "Content-Type": "application/json",
              "kbn-xsrf": "true",
            },
          },
          data: {
            ...dashboardTopAlertsPayload(filter_field, !!isTI),
            query: {
              bool: { filter: applyFilters([], isTI) },
            },
          },
        });

        dispatch({
          type: "SET_TOP_ALERTS",
          payload: { top_alerts: data.aggregations.alertsByGrouping.buckets },
        });
      } finally {
        await setIsLoading({ key: "top_alerts", state: false });
      }
    },
    [applyFilters]
  );

  const getDashboard = useCallback(
    async (isTI?: boolean) => {
      await getDashboardSeverityLevels(isTI);
      await getDashboardAlertsByName(isTI);
      await getDashboardTopAlerts(undefined, isTI);
    },
    [getDashboardSeverityLevels, getDashboardAlertsByName, getDashboardTopAlerts]
  );

  const getAlertsGrouped = useCallback(
    async (field: string, isTI?: boolean) => {
      await setIsLoading({ key: "alerts_grouped", state: true });

      try {
        const data = await request<kibanaDashboardBucketResponse<alertGrouped[]>>({
          url: AR_KIBANA_LIST_ALERTS_GROUPS,
          method: "POST",
          config: {
            headers: {
              Authorization: `ApiKey ${new Cookies().get('es_token')}`,
              "Content-Type": "application/json",
              "kbn-xsrf": "true",
            },
          },
          data: {
            ...alertsGroupedPayload(field, !!isTI),
            query: { bool: { filter: applyFilters([], isTI) } },
          },
        });

        dispatch({
          type: "SET_ALERTS_GROUPED",
          payload: { alerts_grouped: data.aggregations.groupByFields.buckets },
        });
      } finally {
        await setIsLoading({ key: "alerts_grouped", state: false });
      }
    },
    [applyFilters]
  );

  const getAlertDetail = useCallback(
    async (id: string) => {
      await setIsLoading({ key: "alert_detail", state: true });
      try {
        const data = await request<alertDetail>({
          url: AR_GET_ALERT_DETAIL(id),
          method: "GET",
          config: { headers: { accept: "application/json" } },
        });

        dispatch({ type: "SET_ALERT_DETAIL", payload: { alert_detail: data } });
      } finally {
        await setIsLoading({ key: "alert_detail", state: false });
      }
    },
    []
  );

  const getAlertAssistant = useCallback(
    async (id: string) => {
      await setIsLoading({ key: "alert_assistant", state: true });
      try {
        const data = await request<alertAssistant>({
          url: AR_GET_ALERT_ASSISTANT(id),
          method: "GET",
          config: { headers: { accept: "application/json" } },
        });

        dispatch({ type: "SET_ALERT_ASSISTANT", payload: { alert_assistant: data } });
      } finally {
        await setIsLoading({ key: "alert_assistant", state: false });
      }
    },
    []
  );

  useDidMountEffect(() => {
    if (dateRange) {
      getDashboard(false);
      getAlertsTable();
    }
  }, [dateRange, getAlertsTable, getDashboard]);

  const value = useMemo<alertState>(
    () => ({
      ...state,
      dateRange,
      setDateRange,
      getAlertsTable,
      getDashboard,
      getTopAlerts: getDashboardTopAlerts,
      getAlertsGrouped,
      getAlertAssistant,
      getAlertDetail,
    }),
    [
      state,
      dateRange,
      getAlertsTable,
      getDashboard,
      getDashboardTopAlerts,
      getAlertsGrouped,
      getAlertAssistant,
      getAlertDetail,
    ]
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

export const useAlert = (): alertState => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within a AlertProvider");
  return context;
};
