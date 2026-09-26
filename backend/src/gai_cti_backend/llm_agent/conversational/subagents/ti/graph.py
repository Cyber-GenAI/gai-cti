from typing import Dict, List, cast

from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from .....models.visual import AreaVisual, MetricVisual, PieVisual, TableVisual
from .....opencti.labels import get_most_active_labels
from .....routes.ti import get_malware_dashboard, get_ti_dashboard
from ....data_processors import get_text_for_llm_from_area_or_bar_visual
from ....utils import available_llms, load_llm
from .state import TIState
from .tools import (
    get_ioc_info_tool,
    get_malware_info_tool,
    get_ti_table_with_filter_tool,
)

llm_pool: Dict[str, ChatOpenAI] = {name: load_llm(name) for name in available_llms}


async def get_ti_information():
    """
    Extract the Threat Intelligence information from TI page.
    """

    # TIDashboard Data START:
    ti_dashboard = await get_ti_dashboard()

    # diverging_conf_risk_data = cast(
    #     StackedBarVisual, dashboard["diverging-conf-risk"].data
    # )
    cumulative_ioc_count_data = cast(
        AreaVisual, ti_dashboard["cumulative-ioc-count"].data
    )
    # tag_corr_heatmap_data = cast(HeatmapVisual, dashboard["tag-corr-heatmap"].data)
    ioc_type_pie_data = cast(PieVisual, ti_dashboard["ioc-type-pie"].data)
    ioc_type_pie = ", ".join([f"{x.name}:{x.percent}" for x in ioc_type_pie_data.value])

    active_feeds = cast(MetricVisual, ti_dashboard["active-feeds"].data).value
    malware_count = cast(MetricVisual, ti_dashboard["malware-count"].data).value
    indicator_count = cast(MetricVisual, ti_dashboard["indicator-count"].data).value
    indicator_count_48h = cast(
        MetricVisual, ti_dashboard["indicator-count-48h"].data
    ).value

    # diverging_conf_risk = get_text_for_llm_from_area_or_bar_visual(
    #     diverging_conf_risk_data
    # )

    cumulative_ioc_count = get_text_for_llm_from_area_or_bar_visual(
        cumulative_ioc_count_data.value.data
    )

    frequent_labels = ", ".join(
        f'"{tag}":{count}' for tag, count in await get_most_active_labels()
    )
    # TIDashboard Data END

    # MalwareDashboard Data START:
    malware_dashboard = await get_malware_dashboard()

    malware_by_feed_source_data = cast(
        PieVisual, malware_dashboard["malware-feed-pie"].data
    )

    malware_by_feed_source_pie_text = ", ".join(
        [f"{x.name}: {x.percent}" for x in malware_by_feed_source_data.value]
    )

    important_malware_table = cast(
        TableVisual, malware_dashboard["important-table"].data
    )

    important_malware_table_data = []

    for row in important_malware_table.value.rows:
        data = {
            "name": row.name,
            "id": row.id,
            "num_related_iocs": row.num_indicators,
            "num_reports": row.num_reports,
            "feed_source": row.feed_source,
        }
        important_malware_table_data.append(str(data))

    important_malware_table_text = ", ".join(important_malware_table_data)

    # MalwareDashboard Data END

    return f"""\
In GAI-CTI:

1. TI dashboard data:
- number of Active Feeds: {active_feeds}
- number of Malware: {malware_count}
- number of Indicators: {indicator_count}
- number of Indicators (last 48h): {indicator_count_48h}
- cumulative IoC count (area chart): {cumulative_ioc_count}
- IoC type distribution (pie): {ioc_type_pie}
- frequent labels: {frequent_labels}

2. Malware dashboard data:
- distribution of malware based on feed sources (pie): [ {malware_by_feed_source_pie_text} ]
- Important Malware Table: {important_malware_table_text}
 

When a user asks about a specific malware or Indicator of Compromise (IoC) item:

**Standard Process:**
- Users must provide both the item's ID and type to retrieve information
- Required information:
  * Item ID
  * Item type (malware or IoC)

**Tool Usage:**
- For malware queries: Call the `get_malware_info` tool with the provided ID
- For IoC queries: Call the `get_ioc_info` tool with the provided ID

**Exception - Important Malware:**
If the user asks about malware AND the malware name exists in the "Important Malware" list, you may proceed without requiring an ID.

**Response Template:**
When the user provides insufficient information, reply with:
"To retrieve information about this item, please provide its ID and specify the type (malware or IoC)."

**Workflow:**
1. Check if user provided both ID and type
2. If missing, apply the Important Malware exception check
3. If exception doesn't apply, request missing information using the template above
4. Once you have the required details, call the appropriate tool

"""


system_prompt = """\
You are an AI assistant integrated into the GAI-CTI system, GAI-CTI is an advanced Threat Intelligence platform developed by Amnafzar Gostar-e Sharif in collaboration with, and commissioned by, ITRC (Iran Telecommunication Research Center).

As a cybersecurity assistant, your primary role is to analyze and interpret threat intelligence to support security analysts in their investigations.

Here is the Threat Intelligence information you should consider:
{ti_info} 


Your tasks include:
1. Understanding and interpreting threat intelligence data.
2. Assisting in the identification and analysis of cyber threats.
3. Providing insights and recommendations based on threat intelligence.
4. Utilizing the provided tools to fetch detailed information about specific indicators or malware when required.
5. Engaging in interactive dialogues to clarify and expand on threat intelligence topics.
6. Answering queries related to threat intelligence with accuracy and context-awareness.
7. Always think step by step and ensure your responses are well-structured and informative.
"""

prompt_template = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        ("placeholder", "{messages}"),
    ]
)


tools = [get_ioc_info_tool, get_malware_info_tool, get_ti_table_with_filter_tool]


async def ti(state: TIState):
    llm_name = state["llm_name"]
    chain = prompt_template | llm_pool[llm_name].bind_tools(tools).with_config(
        tags=["stream"]
    )

    ti_info = await get_ti_information()

    ai_msg = await chain.ainvoke(
        {
            "messages": state["messages"],
            "ti_info": ti_info,
        }
    )
    return {"messages": [ai_msg]}


tool_node = ToolNode(tools=tools)


def ti_graph():
    graph_builder = StateGraph(TIState)
    graph_builder.add_node("ti", ti)
    graph_builder.add_node("tools", tool_node)

    graph_builder.add_edge(START, "ti")
    graph_builder.add_conditional_edges("ti", tools_condition)
    graph_builder.add_edge("tools", "ti")
    graph_builder.add_edge("ti", END)

    return graph_builder.compile()


async def ti_node(state):
    graph = ti_graph()
    res = await graph.ainvoke(state)

    last_message = res["messages"][-1] if res.get("messages") else None
    return {"messages": last_message}
