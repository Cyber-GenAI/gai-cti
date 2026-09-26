import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import {
  managementInjectedIocs,
  managementParam,
  managementRuleCreate,
  managementState,
  managementTable,
  managementTypes,
} from "../../types/management";
import {
  ManagementReducer,
  ManagementInitialState,
} from "../../reducer/management/management-reducer";
import {
  AR_GET_MANAGEMENT_TABLE,
  AR_MANAGEMENT_DELETE_TYPE,
  AR_MANAGEMENT_GET_INJECTED_IOCS,
  AR_MANAGEMENT_GET_RULE_PREVIEW,
  AR_MANAGEMENT_SUBMIT_RULE,
  AR_MANAGEMENT_TABLES_ACTION,
} from "../../api/routes/management";
import { fieldWithType, globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";
import { request } from "../../api/utils/request";

const ManagementContext = createContext<managementState | undefined>(undefined);

interface ManagementProviderProps {
  children: React.ReactNode;
}

export const ManagementProvider: React.FC<ManagementProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(ManagementReducer, ManagementInitialState);

  const clearKey = useCallback(
    ({ key }: globalPayloadClearData<keyof managementState>) => {
      dispatch({
        type: "CLEAR_KEY",
        payload: { key },
      });
    },
    []
  );

  const setIsLoading = useCallback(
    ({ key, state: loading }: globalPayloadSetIsLoading<keyof managementState>) => {
      dispatch({
        type: "SET_ISLOADING",
        payload: { key, state: loading },
      });

      if (loading)
        clearKey({ key })
    },
    []
  );

  const getManagementTable = useCallback(async (table?: managementTable) => {
    if (table) {
      dispatch({
        type: "SET_MANAGEMENT_TABLE",
        payload: { management_table: table },
      });
      return
    }
    setIsLoading({ key: "management_table", state: true });

    const data = await request<managementTable>({
      url: AR_GET_MANAGEMENT_TABLE,
      method: "GET",
      config: {
        headers: {
          accept: "application/json",
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_MANAGEMENT_TABLE",
      payload: { management_table: data },
    });

    setIsLoading({ key: "management_table", state: false });
  }, [setIsLoading]);

  const getInjectedIocs = useCallback(async () => {
    setIsLoading({ key: "injected_iocs", state: true });

    const data = await request<managementInjectedIocs>({
      url: AR_MANAGEMENT_GET_INJECTED_IOCS,
      method: "GET",
      config: {
        headers: {
          accept: "application/json",
          'Content-Type': 'application/json'
        },
      }
    });

    dispatch({
      type: "SET_INJECTED_IOCS",
      payload: { injected_iocs: data },
    });

    setIsLoading({ key: "injected_iocs", state: false });
  }, [setIsLoading]);

  const getManagementRulePreview = useCallback(async (rule: managementRuleCreate) => {
    try {
      setIsLoading({ key: "management_rule_preview", state: true });

      const data = await request<fieldWithType[]>({
        url: AR_MANAGEMENT_GET_RULE_PREVIEW,
        method: "POST",
        config: {
          headers: {
            accept: "application/json",
            'Content-Type': 'application/json'
          },
        },
        data: rule
      });

      dispatch({
        type: "SET_MANAGMENT_PREVIEW",
        payload: { management_rule_preview: data },
      });

      return true
    } catch {
      return false
    } finally {
      setIsLoading({ key: "management_rule_preview", state: false });
    }
  }, [setIsLoading]);

  const submitManagementRule = useCallback(async (rule: managementRuleCreate) => {
    try {
      await request<null>({
        url: AR_MANAGEMENT_SUBMIT_RULE,
        method: "POST",
        config: {
          headers: {
            accept: "application/json",
            'Content-Type': 'application/json'
          },
        },
        data: rule
      });
      return true
    } catch {
      return false
    }
  }, []);

  const generalActions = useCallback(async (params: managementParam) => {
    try {
      await request<null>({
        url: AR_MANAGEMENT_TABLES_ACTION(params.type, params.action),
        method: 'POST',
        config: {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
        },
        data: { id: params.id }
      });
      return true
    } catch {
      return false
    }
  }, []);

  const deleteType = useCallback(async (type: managementTypes) => {
    try {
      await request<null>({
        url: AR_MANAGEMENT_DELETE_TYPE(type),
        method: "DELETE",
        config: {
          headers: {
            accept: "application/json",
            'Content-Type': 'application/json'
          },
        }
      });
      return true
    } catch {
      return false
    }
  }, []);

  const value = useMemo<managementState>(
    () => ({
      ...state,
      getManagementTable,
      generalActions,
      deleteType,
      getInjectedIocs,
      getManagementRulePreview,
      submitManagementRule
    }),
    [state, getManagementTable, generalActions, deleteType, getInjectedIocs, getManagementRulePreview, submitManagementRule]
  );

  return <ManagementContext.Provider value={value}>{children}</ManagementContext.Provider>;
};

export const useManagement = (): managementState => {
  const context = useContext(ManagementContext);
  if (!context) {
    throw new Error("useManagement must be used within a ManagementProvider");
  }
  return context;
};
