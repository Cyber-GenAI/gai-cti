from typing import Dict

from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from .....models.visual import BarValue, PieSlice
from .....routes.home import get_home
from ....utils import available_llms, load_llm
from .state import HomeState

llm_pool: Dict[str, ChatOpenAI] = {name: load_llm(name) for name in available_llms}


async def get_home_dashboard_info():
    home = await get_home()

    parts = [
        f"In GAI-CTI platform, there are some dashboards, it's summary information is:"
    ]
    for stat in home.top_dashboards:
        section_lines = [f"[{stat.title}]"]
        for field in stat.information:
            section_lines.append(f"- {field.key}: {field.value}")
        parts.append("\n".join(section_lines))

    for name, vr in home.visuals.items():
        visual = vr.data
        section = [f"[{visual.title}]"]
        section.append(f"Description: {visual.description}")

        if hasattr(visual, "value"):
            if isinstance(visual.value, list):
                for item in visual.value:
                    if isinstance(item, PieSlice):
                        section.append(f"- {item.name}: {item.percent}")

            elif isinstance(visual.value, BarValue):
                section.append(f"X: {visual.value.x_title}, Y: {visual.value.y_title}")
                for row in visual.value.data:
                    row_str = ", ".join(f"{k}: {v}" for k, v in row.items())
                    section.append(f"- {row_str}")

        parts.append("\n".join(section))

    return "\n\n".join(parts)


system_prompt = """
You are an AI assistant integrated into the **GAI-CTI Threat Intelligence Platform**, developed by **Amnafzar Gostar-e Sharif** in collaboration with **ITRC (Iran Telecommunication Research Center)**.  

You are a cybersecurity dashboard interpreter. 
Your task is to take structured data from the system (adversaries, alerts, threat intelligence, system statistics, and visual dashboards) 
and present it in a human-readable, markdown-like format that is optimized for LLMs to summarize or analyze further.

- Treat values under **[Most Active Malwares]** as *counts*, and **remove the word "detections"** when summarizing them.

This is the dashboard information:
{home_dashboard_info}

The goal is to return a structured but natural text summary that preserves all important information 
from the home dashboard while making it easy for LLMs or humans to interpret.
"""


prompt_template = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        ("placeholder", "{messages}"),
    ]
)

# warning: We don't want to get tools for LLM.
tools = []


async def home(state: HomeState):
    llm_name = state["llm_name"]
    chain = prompt_template | llm_pool[llm_name].with_config(tags=["stream"])

    home_dashboard_info = await get_home_dashboard_info()
    print(">>>>>>>>>>>>home_dashboard_info", home_dashboard_info)
    ai_msg = await chain.ainvoke(
        {
            "messages": state["messages"],
            "home_dashboard_info": home_dashboard_info,
        }
    )
    return {"messages": [ai_msg]}


tool_node = ToolNode(tools=tools)


def home_graph():
    graph_builder = StateGraph(HomeState)
    graph_builder.add_node("home", home)
    graph_builder.add_node("tools", tool_node)

    graph_builder.add_edge(START, "home")
    graph_builder.add_conditional_edges("home", tools_condition)
    graph_builder.add_edge("tools", "home")
    graph_builder.add_edge("home", END)

    return graph_builder.compile()


async def home_node(state):
    graph = home_graph()
    res = await graph.ainvoke(state)

    last_message = res["messages"][-1] if res.get("messages") else None
    return {"messages": last_message}
