from langgraph.graph import MessagesState


class AlertState(MessagesState):
    alert_id: str
    llm_name: str
