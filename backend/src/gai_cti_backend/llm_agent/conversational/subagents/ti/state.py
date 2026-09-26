from langgraph.graph import MessagesState


class TIState(MessagesState):
    ti_id: str
    llm_name: str
