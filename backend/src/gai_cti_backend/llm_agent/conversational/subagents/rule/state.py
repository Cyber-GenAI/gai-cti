from langgraph.graph import MessagesState


class RulesState(MessagesState):
    rule_id: str
    llm_name: str
