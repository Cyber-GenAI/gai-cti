export type messageType = "assistant" | "user"

export type message = {
  msg_id: string
  date: string
  chat_sid: string
  msg: string
  type: messageType
  isStreaming: boolean
  route?: string
}

export interface assistantState {
  assistantVisible: boolean
  messages: message[]
  setMessages: (messages: message[]) => void
  sendMessage: (message: { msg: string, chat_sid: string }) => void
  setAssistantVisibility: (isOpen: boolean) => void
}

export interface payloadSetAssistantMessages {
  messages: message[];
}

export interface payloadSetAssistantVisibility {
  visible: boolean;
}

export interface assistantAction {
  type: string;
  payload: payloadSetAssistantMessages | payloadSetAssistantVisibility
}