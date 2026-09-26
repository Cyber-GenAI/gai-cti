import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import {
  assistantExplain,
  assistantState,
  setMessages,
} from "../../types/assistant";
import {
  AssistantReducer,
  AssistantInitialState,
} from "../../reducer/assistant/assistant-reducer";
import {
  AR_GET_ASSISTANT_EXPLAIN,
  AR_GET_HELP,
} from "../../api/routes/assistant";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";
import { request } from "../../api/utils/request";
import { useFlyout } from "../../hooks/useFlyout";
import { AR_GET_AVAILABLE_LLMS, AR_GET_EXPLAIN_LLM, AR_SET_EXPLAIN_LLM } from "../../api/routes/utilities";

const AssistantContext = createContext<assistantState | undefined>(undefined);

interface AssistantProviderProps {
  children: React.ReactNode;
}

export const AssistantProvider: React.FC<AssistantProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(AssistantReducer, AssistantInitialState);
  const { isFlyoutVisible, handleCloseFlyout, handleOpenFlyout } = useFlyout(false);

  const clearKey = useCallback(
    ({ key }: globalPayloadClearData<keyof assistantState>) => {
      dispatch({
        type: "CLEAR_KEY",
        payload: { key },
      });
    },
    []
  );

  const setIsLoading = useCallback(
    ({ key, state: loading }: globalPayloadSetIsLoading<keyof assistantState>) => {
      dispatch({
        type: "SET_ISLOADING",
        payload: { key, state: loading },
      });

      if (loading)
        clearKey({ key })
    },
    [clearKey]
  );

  const setMessages: setMessages = useCallback((updater) => {
    setIsLoading({ key: "messages", state: true });

    dispatch({
      type: "SET_ASSISTANT_MESSAGES",
      payload: {
        messages: typeof updater === "function"
          ? updater(state.messages.data ?? [])
          : updater,
      },
    });

    setIsLoading({ key: "messages", state: false });
  }, [setIsLoading, state.messages.data]);

  const setLlm = useCallback((llm: string) => {
    setIsLoading({ key: "llm", state: true });

    dispatch({
      type: "SET_ASSISTANT_LLM",
      payload: {
        llm: llm
      },
    });

    setIsLoading({ key: "llm", state: false });
  }, [setIsLoading]);

  const getExplainLlms = useCallback(async () => {
    setIsLoading({ key: "explainLlm", state: true });

    const data = await request<string>({
      url: AR_GET_EXPLAIN_LLM,
      method: "GET",
    });

    dispatch({
      type: "SET_EXPLAIN_LLM",
      payload: { explainLlm: data },
    });

    setIsLoading({ key: "explainLlm", state: false });
 }, [setIsLoading]);

  const setExplainLlms = useCallback(async (llm: string) => {
    try {
      setIsLoading({ key: "explainLlm", state: true });
  
      const data = await request<string>({
        url: AR_SET_EXPLAIN_LLM,
        method: "PATCH",
        data: { llm }
      });

      setIsLoading({ key: "explainLlm", state: false });
  
      if (data) {
        dispatch({
          type: "SET_EXPLAIN_LLM",
          payload: { explainLlm: data },
        });

        return true;   
      }
      
      return false;
    } catch {
      return false;
    }
  }, [setIsLoading]);

  const getAssistantExplain = useCallback(async (route: string, id?: string, pattern?: string) => {
    try {
      setIsLoading({ key: "assistantExplain", state: true });
      handleOpenFlyout()
      const data = await request<assistantExplain[]>({
        url: AR_GET_ASSISTANT_EXPLAIN(route, id, pattern),
        method: "GET",
      });

      dispatch({
        type: "SET_ASSISTANT_EXPLAIN",
        payload: { assistantExplain: data },
      });

      setIsLoading({ key: "assistantExplain", state: false });

      return true;
    } catch {
      return false;
    }
  }, [handleOpenFlyout, setIsLoading]);

    const getHelp = useCallback(async (route: string) => {
    try {
      setIsLoading({ key: "assistantExplain", state: true });
      handleOpenFlyout()
      const data = await request<string>({
        url: AR_GET_HELP(route),
        method: "GET",
      });

      dispatch({
        type: "SET_ASSISTANT_EXPLAIN",
        payload: { assistantExplain: [{
          title: '',
          value: data,
        }]},
      });

      setIsLoading({ key: "assistantExplain", state: false });

      return true;
    } catch {
      return false;
    }
  }, [handleOpenFlyout, setIsLoading]);

  const getAvailableLlms = useCallback(async () => {
    setIsLoading({ key: "availableLlms", state: true });
    try {
      const data = await request<string[]>({
        url: AR_GET_AVAILABLE_LLMS,
        method: "GET",
      });
      dispatch({ type: "SET_AVAILABLE_LLMS", payload: { availableLlms: data } });
    } finally {
      setIsLoading({ key: "availableLlms", state: false });
    }
  }, [setIsLoading]);

  const value = useMemo<assistantState>(
    () => ({
      ...state,
      getAssistantExplain,
      setMessages,
      setLlm,
      setExplainLlms,
      getExplainLlms,
      getHelp,
      getAvailableLlms,
      isExplainVisible: isFlyoutVisible,
      closeExplain: handleCloseFlyout,
      openExplain: handleOpenFlyout
    }),
    [state, getAssistantExplain, setMessages, setLlm, setExplainLlms, getExplainLlms, getHelp, getAvailableLlms, isFlyoutVisible, handleCloseFlyout, handleOpenFlyout]
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
};

export const useAssistant = (): assistantState => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistant must be used within a AssistantProvider");
  }
  return context;
};
