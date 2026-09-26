from langgraph.graph import MessagesState


class AlertsState(MessagesState):
    llm_name: str
