import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { utilitiesState } from "../../types/utilities";
import { UtilitiesReducer, UtilitiesInitialState } from "../../reducer/utilities/utilities-reducer";
import {
  AR_GET_ES_TOKEN,
  AR_GET_SYSTEM_AVAILABLE,
} from "../../api/routes/utilities";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";
import { request } from "../../api/utils/request";
import { getEsCookie, setEsTokenCookie } from "../../utils/auth";

const UtilitiesContext = createContext<utilitiesState | undefined>(undefined);

export const UtilitiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(UtilitiesReducer, UtilitiesInitialState);

  const clearKey = useCallback(
    ({ key }: globalPayloadClearData<keyof utilitiesState>) => {
      dispatch({ type: "CLEAR_KEY", payload: { key } });
    },
    []
  );

  const setIsLoading = useCallback(
    ({ key, state: loading }: globalPayloadSetIsLoading<keyof utilitiesState>) => {
      dispatch({ type: "SET_ISLOADING", payload: { key, state: loading } });
      if (loading) clearKey({ key });
    },
    [clearKey]
  );

  const getESToken = useCallback(async (): Promise<string> => {
    if (getEsCookie()?.length)
      return getEsCookie();
    setIsLoading({ key: "es_token", state: true });
    try {
      const data = await request<{ encoded: string }>({
        url: AR_GET_ES_TOKEN,
        method: "GET",
        silence: true,
      });
      
      setEsTokenCookie(data.encoded);
      dispatch({ type: "SET_ES_TOKEN", payload: { es_token: data.encoded } });
      return data.encoded;
    } finally {
      setIsLoading({ key: "es_token", state: false });
    }
  }, [setIsLoading]);

  const getSystemAvailable = useCallback(async (): Promise<boolean> => {
    try {
      return await request<boolean>({ url: AR_GET_SYSTEM_AVAILABLE, method: "GET" });
    } catch {
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      getESToken,
      getSystemAvailable,
    }),
    [state, getESToken, getSystemAvailable]
  );

  return <UtilitiesContext.Provider value={value}>{children}</UtilitiesContext.Provider>;
};

export const useUtilities = (): utilitiesState => {
  const context = useContext(UtilitiesContext);
  if (!context) throw new Error("useUtilities must be used within UtilitiesProvider");
  return context;
};