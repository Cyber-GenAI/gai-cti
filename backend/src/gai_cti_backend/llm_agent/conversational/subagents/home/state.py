from langgraph.graph import MessagesState


class HomeState(MessagesState):
    llm_name: str
