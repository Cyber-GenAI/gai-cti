from langgraph.graph import MessagesState


class AdversariesState(MessagesState):
    adv_id: str
    llm_name: str
