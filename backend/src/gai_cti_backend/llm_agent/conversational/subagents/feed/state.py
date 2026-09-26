from langgraph.graph import MessagesState


class FeedState(MessagesState):
    llm_name: str
