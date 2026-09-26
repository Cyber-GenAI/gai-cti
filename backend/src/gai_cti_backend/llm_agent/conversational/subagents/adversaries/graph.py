import ast
from typing import Dict, cast

from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from .....models.visual import BarVisual, MetricVisual
from .....routes.adversary import get_top_dashboard
from ....data_processors import get_all_apt, get_text_for_llm_from_area_or_bar_visual
from ....utils import available_llms, load_llm
from .state import AdversariesState
from .tools import get_adversary_info_tool, get_specificity_data

llm_pool: Dict[str, ChatOpenAI] = {name: load_llm(name) for name in available_llms}


async def get_adversaries_dashboard(adv_id: str) -> str:
    all_apt_text = await get_all_apt()
    all_apt_list = ast.literal_eval(f"[{all_apt_text}]")

    all_adversaries_names = ", ".join(apt["APT_name"] for apt in all_apt_list)

    current_apt_name = next(
        (apt["APT_name"] for apt in all_apt_list if apt["APT_id"] == adv_id)
    )

    dashboard = await get_top_dashboard()

    tracked_sig = cast(MetricVisual, dashboard["tracked-sig"].data).value
    tracked_ioc = cast(MetricVisual, dashboard["tracked-ioc"].data).value

    ioc_per_adv_data = cast(BarVisual, dashboard["ioc-per-adv"].data)
    ioc_per_adv = get_text_for_llm_from_area_or_bar_visual(
        data=ioc_per_adv_data.value.data,
        x_accessor="adv_name",
        y_accessor="ioc_count",
        is_x_ts=False,
    )

    rule_per_adv_data = cast(BarVisual, dashboard["rule-per-adv"].data)
    rule_per_adv = get_text_for_llm_from_area_or_bar_visual(
        x_accessor="adv_name",
        is_x_ts=False,
        y_accessor="rules_count",
        data=rule_per_adv_data.value.data,
    )

    return f"""\
In GAI-CTI:


- number of tracked adversaries with indicators :{tracked_sig} 
- number of tracked adversaries with signatures :{tracked_ioc} 
- number of indicators per adversary :{ioc_per_adv} 
- number of rules per adversary :{rule_per_adv} 


# Context Awareness
The user is currently reviewing Adversary: {current_apt_name} (APT Name), ID: {adv_id}

# All Adversaries name:
{all_adversaries_names}


## Default Behavior
- When the user refers to "the adversary" or similar, assume they mean **{current_apt_name}**

- No need to ask for clarification when context clearly indicates the current adversary

## When User Mentions a Different Adversary Name
If the user explicitly mentions an adversary by name (e.g., "Tell me about APT29"):


## Handling Multiple Adversaries
- Ask user for all APT names first
- Retrieve and compare in one shot where possible

# Errors
- If name not found → inform the user and request the valid APT name or ID
- Never guess adversary info

# Goal
Maintain clarity when switching adversary context and always prioritize accuracy.
"""


system_prompt = """
You are GPT-5, an AI assistant integrated into the GAI-CTI system.
GAI-CTI is an advanced Cyber Threat Intelligence platform developed by Amnafzar Gostar-e Sharif in collaboration with, and commissioned by, ITRC (Iran Telecommunication Research Center).

Your primary function is to assist cybersecurity analysts by interpreting, correlating, and explaining adversary-related intelligence.

You will receive structured adversary information in the placeholder below:

    what is  tracked adversaries with indicators?
    what is  tracked adversaries with signatures?


{adversaries_info}

### Your Responsibilities
- Help analysts understand APT groups, their tactics, techniques, and behavior
- Provide structured cybersecurity intelligence responses
- Maintain accuracy; do not fabricate threat data
- Request more context if data is missing or unclear

### Tool Usage Rules
You have access to specialized tools to pull intelligence from the GAI-CTI backend:

#### 1. `get_adversary_info_tool(adversary_id: str)`
Use this tool when the user asks for:
- Adversary details or profile
- Confidence levels
- Sections, rules, logs, IoCs, or structured threat data
- Queries like:
    *"Tell me about APT28"*
    *"Show adversary profile for ID X"*

If the user provides an adversary name but not an ID, ask for the ID.

#### 2. `get_specificity_data()`
Use this tool when the user requests:
- Specificity between adversaries and TTPs
- Intelligence correlations like:
    *"Show TTP specificity matrix"*
    *"Which techniques are strongly associated with APT groups?"*

Do **not** invent specificity values — always call the tool.

### Interaction Protocol
- If user intent is ambiguous → ask clarifying questions
- When tool is required → call the tool with correct parameters
- After receiving tool output → analyze & explain in analyst-friendly form
- Always think & respond like a CTI analyst (MITRE-ATT&CK contextualization, reporting quality)

"""


prompt_template = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        ("placeholder", "{messages}"),
    ]
)


tools = [get_adversary_info_tool, get_specificity_data]


async def adv(state: AdversariesState):
    llm_name = state["llm_name"]
    chain = prompt_template | llm_pool[llm_name].bind_tools(tools).with_config(
        tags=["stream"]
    )

    adversaries_info = await get_adversaries_dashboard(state["adv_id"])

    ai_msg = await chain.ainvoke(
        {"messages": state["messages"], "adversaries_info": adversaries_info}
    )
    return {"messages": [ai_msg]}


tool_node = ToolNode(tools=tools)


def adv_graph():
    graph_builder = StateGraph(AdversariesState)
    graph_builder.add_node("adv", adv)
    graph_builder.add_node("tools", tool_node)

    graph_builder.add_edge(START, "adv")
    graph_builder.add_conditional_edges("adv", tools_condition)
    graph_builder.add_edge("tools", "adv")
    graph_builder.add_edge("adv", END)
    return graph_builder.compile()


async def adversaries_node(state):
    graph = adv_graph()
    res = await graph.ainvoke(state)

    last_message = res["messages"][-1] if res.get("messages") else None
    return {"messages": last_message}
