from typing import Dict

from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from .....elastic_client.utils.others import get_es
from .....routes.alert import get_alert_info
from ....data_processors import get_alert_info_for_llm_by_id
from ....utils import available_llms, load_llm
from .state import AlertState
from .tools import *

llm_pool: Dict[str, ChatOpenAI] = {name: load_llm(name) for name in available_llms}


async def get_alert_data(alert_id: str):
    alert_concise_data = await get_alert_info_for_llm_by_id(alert_id)
    rule_info = alert_concise_data["rule_text"]
    ti_info = alert_concise_data["ti_text"]
    log_info = alert_concise_data["logs_text"]

    return f"""
- **ID of the Alert is:** {alert_id}
- **Log event data:** [{log_info}]
- **Detected IoC details:** {ti_info} (may be empty, depending on the rule type)  
- **Rule specifications:** [{rule_info}]
"""


system_prompt = """
You are an AI assistant integrated into the **GAI-CTI system** — an advanced Cyber Threat Intelligence platform developed by **Amnafzar Gostar-e Sharif** and commissioned by the **Iran Telecommunication Research Center (ITRC)**.  

Your role is to act as a **cybersecurity analyst assistant**, helping SOC teams analyze and interpret alerts to support their investigations.  

You are provided with the following context for each alert:  
{alert_data}

### Your objectives:  
1. **Answer the user’s questions** regarding this alert.  
2. Provide **clear, concise explanations** in the style of a **SOC analyst** (professional, structured, and actionable).  
3. Focus on **helping the analyst interpret the alert meaningfully** and supporting their investigation process.
"""

prompt_template = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        ("placeholder", "{messages}"),
    ]
)

tools = []


async def alert(state: AlertState):
    llm_name = state["llm_name"]
    llm = llm_pool[llm_name]
    chain = prompt_template | llm.bind_tools(tools).with_config(tags=["stream"])

    alert_data = await get_alert_data(state["alert_id"])

    ai_msg = await chain.ainvoke(
        {
            "messages": state["messages"],
            "alert_data": alert_data,
        }
    )
    return {"messages": [ai_msg]}


tool_node = ToolNode(tools=tools)


def alert_graph():
    graph_builder = StateGraph(AlertState)
    graph_builder.add_node("alert", alert)
    graph_builder.add_node("tools", tool_node)

    graph_builder.add_edge(START, "alert")
    graph_builder.add_conditional_edges("alert", tools_condition)
    graph_builder.add_edge("tools", "alert")
    graph_builder.add_edge("alert", END)

    return graph_builder.compile()


async def alert_node(state):
    graph = alert_graph()
    res = await graph.ainvoke(state)

    last_message = res["messages"][-1] if res.get("messages") else None
    return {"messages": last_message}
