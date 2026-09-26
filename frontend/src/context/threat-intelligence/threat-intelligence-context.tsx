import { createContext, useCallback, useContext, useMemo, useReducer, useState } from "react";
import {
  threatIntelligenceState,
  threatIntelligenceTable,
  threatIntelligenceTableParams,
  threatIPDashboard,
  threatMalwareDashboard,
  threatTIDashboard,
} from "../../types/threat-intelligence";
import {
  ThreatIntelligenceReducer,
  ThreatIntelligenceInitialState,
} from "../../reducer/threat-intelligence/threat-intelligence-reducer";
import {
  AR_GET_THREAT_TABLE,
  AR_GET_THREAT_METADATA,
  AR_GET_THREAT_TI_DASHBOARD,
  AR_GET_THREAT_MALWARE_DASHBOARD,
  AR_GET_THREAT_IP_DASHBOARD,
  AR_EDIT_THREAT_CONFIDENCE
} from "../../api/routes/threat-intelligence";
import { fieldWithType, globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";
import { request } from "../../api/utils/request";
import { initial_table_params } from "../../constants/table";
import { formatOperatorToLabel } from "../../utils";
import { useDidMountEffect } from "../../hooks/useDidMountEffect";
import { buildQuery } from "../../api/utils/buildQuery";

const ThreatIntelligenceContext = createContext<threatIntelligenceState | undefined>(undefined);

interface ThreatIntelligenceProviderProps {
  children: React.ReactNode;
}

export const ThreatIntelligenceProvider: React.FC<ThreatIntelligenceProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(ThreatIntelligenceReducer, ThreatIntelligenceInitialState);
  const [tableParam, setTableParams] = useState(initial_table_params)

  const clearKey = useCallback(
    ({ key }: globalPayloadClearData<keyof threatIntelligenceState>) => {
      dispatch({
        type: "CLEAR_KEY",
        payload: { key },
      });
    },
    []
  );

  const setIsLoading = useCallback(
    ({ key, state: loading }: globalPayloadSetIsLoading<keyof threatIntelligenceState>) => {
      dispatch({
        type: "SET_ISLOADING",
        payload: { key, state: loading },
      });

      if (loading)
        clearKey({ key })
    },
    []
  );

  const setThreatTableParams = useCallback((tableParams: threatIntelligenceTableParams) => {
    const formattedFilters = tableParams.filters?.map((filter) => {
      return {
        ...filter,
        operator: formatOperatorToLabel(filter.operator),
        values: filter.values ? filter.values : []
      }
    }) ?? [];
    setTableParams((prev) => ({
      ...prev,
      cursor: tableParams.cursor ?? prev.cursor,
      filters: tableParams.filters ? formattedFilters : prev.filters,
    }))
  }, [])

  const getThreatTable = useCallback(async (tableParams?: threatIntelligenceTableParams) => {
    setIsLoading({ key: "threatTable", state: true });

    const data = await request<threatIntelligenceTable>({
      url: AR_GET_THREAT_TABLE,
      method: "POST",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      },
      data: tableParams ?? tableParam,
    });

    dispatch({
      type: "SET_THREAT_TABLE",
      payload: { threatTable: data },
    });

    setIsLoading({ key: "threatTable", state: false });
  }, [setIsLoading, tableParam]);

  const getThreatMetadata = useCallback(async (id: string) => {
    setIsLoading({ key: "threatMetadata", state: true });

    const data = await request<fieldWithType[]>({
      url: AR_GET_THREAT_METADATA(id),
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_THREAT_METADATA",
      payload: { threatMetadata: data },
    });

    setIsLoading({ key: "threatMetadata", state: false });
  }, [setIsLoading]);

  const getThreatTIDashboard = useCallback(async () => {
    setIsLoading({ key: "threatTIDashboard", state: true });

    const data = await request<threatTIDashboard>({
      url: AR_GET_THREAT_TI_DASHBOARD,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_THREAT_TI_DASHBOARD",
      payload: { tiDashboard: data },
    });

    setIsLoading({ key: "threatTIDashboard", state: false });
  }, [setIsLoading]);

  const getThreatMalwareDashboard = useCallback(async () => {
    setIsLoading({ key: "threatMalwareDashboard", state: true });

    const data = await request<threatMalwareDashboard>({
      url: AR_GET_THREAT_MALWARE_DASHBOARD,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_THREAT_MALWARE_DASHBOARD",
      payload: { malwareDashboard: data },
    });

    setIsLoading({ key: "threatMalwareDashboard", state: false });
  }, [setIsLoading]);

  const getThreatIPDashboard = useCallback(async () => {
    setIsLoading({ key: "threatIPDashboard", state: true });

    const data = await request<threatIPDashboard>({
      url: AR_GET_THREAT_IP_DASHBOARD,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_THREAT_IP_DASHBOARD",
      payload: { ipDashboard: data },
    });

    setIsLoading({ key: "threatIPDashboard", state: false });
  }, [setIsLoading]);

  const editThreatConfidenceField = useCallback(async (id: string, confidence: number) => {
    try {
      const url = AR_EDIT_THREAT_CONFIDENCE(id) + buildQuery({data: confidence})
      await request<null>({
        url,
        method: "PATCH",
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


  useDidMountEffect(() => {
    getThreatTable(tableParam)
  }, [getThreatTable, tableParam])

  const value = useMemo<threatIntelligenceState>(
    () => ({
      ...state,
      getThreatTable,
      getThreatMetadata,
      getThreatTIDashboard,
      getThreatMalwareDashboard,
      getThreatIPDashboard,
      setThreatTableParams,
      editThreatConfidenceField
    }),
    [state, getThreatTable, getThreatMetadata, getThreatTIDashboard, getThreatMalwareDashboard, getThreatIPDashboard, setThreatTableParams, editThreatConfidenceField]
  );

  return <ThreatIntelligenceContext.Provider value={value}>{children}</ThreatIntelligenceContext.Provider>;
};

export const useThreatIntelligence = (): threatIntelligenceState => {
  const context = useContext(ThreatIntelligenceContext);
  if (!context) {
    throw new Error("useThreatIntelligence must be used within a ThreatIntelligenceProvider");
  }
  return context;
};
