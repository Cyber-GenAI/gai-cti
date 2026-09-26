import {
  assistantState,
  assistantActionTypes,
  assistantActions,
  AssistantPayloadSetAssistantMessages,
  AssistantPayloadGetAssistantExplain,
  AssistantPayloadSetAssistantLlm,
  AssistantPayloadGetAvailableLlms,
  AssistantPayloadGetHelp,
  AssistantPayloadSetAssistantExplainLlm,
} from "../../types/assistant";
import { INITIAL_REDUCER_DATA } from "../../constants/global";
import { globalPayloadClearData, globalPayloadSetIsLoading } from "../../types/global";

export const AssistantInitialState: assistantState = {
  assistantExplain: INITIAL_REDUCER_DATA,
  messages: {
    ...INITIAL_REDUCER_DATA,
    isLoading: false
  },
  markdownHelp: INITIAL_REDUCER_DATA,
  availableLlms: INITIAL_REDUCER_DATA,
  llm: INITIAL_REDUCER_DATA,
  explainLlm: INITIAL_REDUCER_DATA,
  getAssistantExplain: async () => await false,
  getAvailableLlms: () => { },
  setMessages: () => { },
  setLlm: () => { },
  getExplainLlms: () => { },
  setExplainLlms: async () => await false,
  getHelp: async () => await false,
  isExplainVisible: false,
  openExplain: () => { },
  closeExplain: () => { },
};

export const AssistantReducer = (
  state: assistantState,
  action: assistantActions<assistantActionTypes>
): assistantState => {
  switch (action.type) {
    case "SET_ASSISTANT_MESSAGES":
      return {
        ...state,
        messages: {
          ...state.messages,
          data: (action.payload as AssistantPayloadSetAssistantMessages).messages,
        },
      };
    case "SET_ASSISTANT_EXPLAIN":
      return {
        ...state,
        assistantExplain: {
          ...state.assistantExplain,
          data: (action.payload as AssistantPayloadGetAssistantExplain).assistantExplain,
        },
      };
    case "SET_HELP":
      return {
        ...state,
        markdownHelp: {
          ...state.markdownHelp,
          data: (action.payload as AssistantPayloadGetHelp).markdownHelp,
        },
      };
    case "SET_ASSISTANT_LLM":
      return {
        ...state,
        llm: {
          ...state.llm,
          data: (action.payload as AssistantPayloadSetAssistantLlm).llm,
        },
      };
    case "SET_EXPLAIN_LLM":
      return {
        ...state,
        explainLlm: {
          ...state.explainLlm,
          data: (action.payload as AssistantPayloadSetAssistantExplainLlm).explainLlm,
        },
      };
    case "SET_AVAILABLE_LLMS":
      return {
        ...state,
        availableLlms: {
          ...state.availableLlms,
          data: (action.payload as AssistantPayloadGetAvailableLlms).availableLlms,
        },
      };
    case "CLEAR_KEY": {
      const key = (action.payload as globalPayloadClearData<keyof assistantState>).key;

      return {
        ...state,
        [key]: {
          ...state[key] as object,
          data: null
        }
      }
    }
    case "SET_ISLOADING": {
      const key = (action.payload as globalPayloadSetIsLoading<keyof assistantState>).key;
      const isLoading = (action.payload as globalPayloadSetIsLoading<keyof assistantState>).state;
      return {
        ...state,
        [key]: {
          ...state[key] as object,
          isLoading,
        },
      };
    }
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};
