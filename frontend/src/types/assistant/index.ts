import { genericContext, globalPayloadClearData, globalPayloadSetIsLoading } from "../global"

export type messageType = "assistant" | "user"

export type message = {
  msg_id: string
  date: string
  chat_sid: string
  msg: string
  type: messageType
  isStreaming: boolean
  title?: string
}

export type sendMessage = {
  msg: string
  chat_sid: string
  route: string
} 

export type assistantExplain = {
  title: string
  value: string
}

export type setMessages = React.Dispatch<React.SetStateAction<message[]>>;

export type assistantState = {
  messages: genericContext<message[]>
  assistantExplain: genericContext<assistantExplain[]>
  markdownHelp: genericContext<string>
  llm: genericContext<string>
  explainLlm: genericContext<string>
  availableLlms: genericContext<string[]>;
  isExplainVisible: boolean
  getAssistantExplain: (route: string, id?: string, pattern?: string) => Promise<boolean>
  getHelp: (route: string) => Promise<boolean>
  setMessages: setMessages
  getAvailableLlms: () => void
  getExplainLlms: () => void
  setExplainLlms: (llm: string) => Promise<boolean>
  setLlm: (llm: string) => void
  openExplain: () => void
  closeExplain: () => void
}

export type AssistantPayloadGetHelp = {
  markdownHelp: string
}

export type AssistantPayloadGetAssistantExplain = {
  assistantExplain: assistantExplain[]
}

export type AssistantPayloadSetAssistantMessages = {
  messages: message[]
}

export type AssistantPayloadGetAvailableLlms = {
  availableLlms: string[]
}

export type AssistantPayloadSetAssistantLlm = {
  llm: string
}

export type AssistantPayloadSetAssistantExplainLlm = {
  explainLlm: string
}

export type assistantActionTypes = "SET_ASSISTANT_MESSAGES" | "SET_ASSISTANT_EXPLAIN" | "SET_ASSISTANT_LLM" | "SET_AVAILABLE_LLMS" | "SET_EXPLAIN_LLM" | "SET_HELP"

export type assistantActions<T> = {
  type: T | "SET_ISLOADING" | "CLEAR_KEY"
  payload: 
  | AssistantPayloadGetAssistantExplain
  | AssistantPayloadSetAssistantMessages
  | AssistantPayloadSetAssistantLlm
  | AssistantPayloadSetAssistantExplainLlm
  | AssistantPayloadGetAvailableLlms
  | AssistantPayloadGetHelp
  | globalPayloadSetIsLoading<keyof assistantState>
  | globalPayloadClearData<keyof assistantState>
}