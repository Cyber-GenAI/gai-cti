from typing import Any, Dict, Literal

from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, MessagesState, StateGraph

from ...llm_agent.utils import available_llms, load_llm
from .subagents.adversaries.graph import adversaries_node
from .subagents.alert.graph import alert_node
from .subagents.alerts.graph import alerts_node
from .subagents.feed.graph import feed_node
from .subagents.home.graph import home_node
from .subagents.log.graph import log_node
from .subagents.rule.graph import rule_node
from .subagents.ti.graph import ti_node

type Node = Literal[
    "General",
    "Alert",
    "Alerts",
    "Rule",
    "Log",
    "TI",
    "Feed",
    "Adversaries",
    "Home",
]

llm_pool: Dict[str, ChatOpenAI] = {name: load_llm(name) for name in available_llms}


class State(MessagesState):
    chat_sid: str
    sid: str
    agent_name: Node
    alert_id: str
    index_pattern: str
    ti_id: str
    rule_id: str
    adv_id: str
    llm_name: str


general_system_prompt = """
You are the General Node of the GAI-CTI system — an advanced Cyber Threat Intelligence platform developed by Amnafzar Gostar-e Sharif in collaboration with, and commissioned by, the Iran Telecommunication Research Center (ITRC).

Your role:
- Respond to general, conceptual, or cross-domain cybersecurity questions.
- Provide professional, well-reasoned explanations on cybersecurity, threat intelligence, detection engineering, or SOC operations when the question is not tied to a specific dataset or system component.
- Support analysts by clarifying CTI or security concepts, explaining methodologies, and offering contextual insights.

Behavior:
- Always stay within the scope of cybersecurity, CTI, SOC analysis, and digital threat defense.
- Use clear, technical, and educational language appropriate for professional security analysts.
- When possible, relate your answers to the goals of the GAI-CTI platform (e.g., improving detection coverage, intelligence enrichment, or situational awareness).

Examples of questions you handle:
- “What is the difference between threat intelligence and threat hunting?”
- “Explain how MITRE ATT&CK relates to detection rules.”
- “What are Indicators of Compromise (IoCs) and how are they used?”
- “Describe common types of privilege escalation techniques.”
- “What does risk score mean in the context of detection rules?”

Focus purely on conceptual, explanatory, and general-purpose reasoning within cybersecurity and CTI contexts.
"""

prompt_template = ChatPromptTemplate.from_messages(
    messages=[
        ("system", general_system_prompt),
        ("placeholder", "{messages}"),
    ]
)


async def general_agent(state: State):
    llm_name = state["llm_name"]
    chain = prompt_template | llm_pool[llm_name].with_config(tags=["stream"])
    print(">>>>>>>>>>>>>>llm_name=", llm_name)

    ai_msg = await chain.with_config(tags=["stream"]).ainvoke(
        {
            "messages": state["messages"],
        }
    )

    return {"messages": ai_msg}


async def route_input(state: State) -> Node:
    return state["agent_name"]


def get_builder() -> StateGraph:
    graph_builder = StateGraph(State)

    name2agent: Dict[Node, Any] = {
        "General": general_agent,
        "Alert": alert_node,
        "Alerts": alerts_node,
        "Rule": rule_node,
        "Log": log_node,
        "TI": ti_node,
        "Feed": feed_node,
        "Adversaries": adversaries_node,
        "Home": home_node,
    }

    for name, agent in name2agent.items():
        graph_builder.add_node(name, agent)
        graph_builder.add_edge(name, END)

    graph_builder.add_conditional_edges(
        START,
        route_input,
        path_map={
            "General": "General",
            "Alert": "Alert",
            "Alerts": "Alerts",
            "Rule": "Rule",
            "Log": "Log",
            "TI": "TI",
            "Feed": "Feed",
            "Adversaries": "Adversaries",
            "Home": "Home",
        },
    )

    return graph_builder
