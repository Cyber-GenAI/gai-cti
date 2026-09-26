import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import {
  adversariesDashboard,
  adversariesState,
  adversary,
  adversaryData,
  adversaryMitre,
  adversarySchedule,
} from "../../types/adversaries";
import {
  AdversariesReducer,
  AdversariesInitialState,
} from "../../reducer/adversaries/adversaries-reducer";
import {
  AR_GET_ADVERSARIES,
  AR_GET_ADVERSARIES_DASHBOARD,
  AR_GET_ADVERSARIES_DETAIL,
  AR_GET_ADVERSARIES_MITRE,
  AR_GET_ADVERSARIES_MITRE_ORG,
  AR_GET_ADVERSARY_DATA,
  AR_GET_ADVERSARY_SCHEDULE,
  AR_RUN_ADVERSARY_SCHEDULE
} from "../../api/routes/adversaries";
import { fieldWithType, globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";
import { request } from "../../api/utils/request";

const AdversariesContext = createContext<adversariesState | undefined>(undefined);

interface AdversariesProviderProps {
  children: React.ReactNode;
}

export const AdversariesProvider: React.FC<AdversariesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(AdversariesReducer, AdversariesInitialState);

  const clearKey = useCallback(
    ({ key }: globalPayloadClearData<keyof adversariesState>) => {
      dispatch({
        type: "CLEAR_KEY",
        payload: { key },
      });
    },
    []
  );

  const setIsLoading = useCallback(
    ({ key, state: loading }: globalPayloadSetIsLoading<keyof adversariesState>) => {
      dispatch({
        type: "SET_ISLOADING",
        payload: { key, state: loading },
      });

      if (loading)
        clearKey({ key })
    },
    [clearKey]
  );

  const getAdversaries = useCallback(async () => {
    setIsLoading({ key: "adversaries", state: true });

    const data = await request<adversary[]>({
      url: AR_GET_ADVERSARIES,
      method: "GET",
    });

    dispatch({
      type: "SET_ADVERSARIES",
      payload: { adversaries: data },
    });

    setIsLoading({ key: "adversaries", state: false });
  }, [setIsLoading]);

  const getAdversariesDetail = useCallback(async (path: string) => {
    setIsLoading({ key: "adversariesDetail", state: true });

    const data = await request<fieldWithType[]>({
      url: AR_GET_ADVERSARIES_DETAIL + path,
      method: "GET",
    });

    dispatch({
      type: "SET_ADVERSARIES_DETAIL",
      payload: { adversariesDetail: data },
    });

    setIsLoading({ key: "adversariesDetail", state: false });
  }, [setIsLoading]);

  const getAdversaryData = useCallback(async (id: string) => {
    setIsLoading({ key: "adversary", state: true });

    const data = await request<adversaryData>({
      url: AR_GET_ADVERSARY_DATA(id),
      method: "GET",
    });

    dispatch({
      type: "SET_ADVERSARY_DATA",
      payload: { adversary: data },
    });

    setIsLoading({ key: "adversary", state: false });
  }, [setIsLoading]);

  const getAdversarySchedule = useCallback(async () => {
    setIsLoading({ key: "adversarySchedule", state: true });

    const data = await request<adversarySchedule>({
      url: AR_GET_ADVERSARY_SCHEDULE,
      method: "GET",
    });

    dispatch({
      type: "SET_ADVERSARY_SCHEDULE",
      payload: { adversarySchedule: data },
    });

    setIsLoading({ key: "adversarySchedule", state: false });
  }, [setIsLoading]);

  const runAdversarySchedule = useCallback(async () => {
    try {
      await request({
        url: AR_RUN_ADVERSARY_SCHEDULE,
        method: "POST",
        config: {
          headers: {
            'accept': 'application/json'
          }
        }
      });

      return true
    } catch {
      return false
    }
  }, []);

  const getAdversariesDashboard = useCallback(async () => {
    setIsLoading({ key: "adversariesDashboard", state: true });

    const data = await request<adversariesDashboard>({
      url: AR_GET_ADVERSARIES_DASHBOARD,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json'
        }
      }
    });

    dispatch({
      type: "SET_ADVERSARIES_DASHBOARD",
      payload: { adversariesDashboard: data },
    });

    setIsLoading({ key: "adversariesDashboard", state: false });
  }, [setIsLoading]);


  const getAdversariesMitre = useCallback(async (isOrganization: boolean) => {
    setIsLoading({ key: "mitres", state: true });

    const data = await request<adversaryMitre>({
      url: isOrganization ? AR_GET_ADVERSARIES_MITRE_ORG : AR_GET_ADVERSARIES_MITRE,
      method: "GET",
      config: {
        headers: {
          'accept': 'application/json'
        }
      }
    });

    dispatch({
      type: "SET_ADVERSARIES_MITRE",
      payload: { mitres: data },
    });

    setIsLoading({ key: "mitres", state: false });
  }, [setIsLoading]);

  const value = useMemo<adversariesState>(
    () => ({
      ...state,
      getAdversaries,
      getAdversaryData,
      getAdversariesMitre,
      getAdversarySchedule,
      getAdversariesDetail,
      getAdversariesDashboard,
      runAdversarySchedule,
    }),
    [state, getAdversaries, getAdversaryData, getAdversariesMitre, getAdversarySchedule, getAdversariesDetail, getAdversariesDashboard, runAdversarySchedule]
  );

  return <AdversariesContext.Provider value={value}>{children}</AdversariesContext.Provider>;
};

export const useAdversaries = (): adversariesState => {
  const context = useContext(AdversariesContext);
  if (!context) {
    throw new Error("useAdversaries must be used within a AdversariesProvider");
  }
  return context;
};
