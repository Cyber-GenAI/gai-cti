from langgraph.graph import MessagesState


class LogsState(MessagesState):
    index_pattern: str
    llm_name: str
