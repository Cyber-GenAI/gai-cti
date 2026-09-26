import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import {
  homeState,
  homeDashboard,
} from "../../types/home";
import {
  HomeReducer,
  HomeInitialState,
} from "../../reducer/home/home-reducer";
import {
  AR_GET_DASHBOARD,
} from "../../api/routes/home";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";
import { request } from "../../api/utils/request";

const HomeContext = createContext<homeState | undefined>(undefined);

interface HomeProviderProps {
  children: React.ReactNode;
}

export const HomeProvider: React.FC<HomeProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(HomeReducer, HomeInitialState);

  const clearKey = useCallback(
    ({ key }: globalPayloadClearData<keyof homeState>) => {
      dispatch({
        type: "CLEAR_KEY",
        payload: { key },
      });
    },
    []
  );

  const setIsLoading = useCallback(
    ({ key, state: loading }: globalPayloadSetIsLoading<keyof homeState>) => {
      dispatch({
        type: "SET_ISLOADING",
        payload: { key, state: loading },
      });

      if (loading)
        clearKey({ key })
    },
    []
  );

  const getDashboard = useCallback(async () => {
    setIsLoading({ key: "dashboard", state: true });

    const data = await request<homeDashboard>({
      url: AR_GET_DASHBOARD,
      method: "GET",
    });

    dispatch({
      type: "SET_DASHBOARD",
      payload: { dashboard: data },
    });

    setIsLoading({ key: "dashboard", state: false });
  }, [setIsLoading]);

  const value = useMemo<homeState>(
    () => ({
      ...state,
      getDashboard,
    }),
    [state, getDashboard]
  );

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};

export const useHome = (): homeState => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
};
