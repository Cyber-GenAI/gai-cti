from typing import Any, Dict, cast

from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from .....models.visual import BarVisual, HeatmapVisual, MetricVisual, PieVisual
from .....routes.feeds import (
    get_connector_to_organizations_map,
    get_feeds_main_table,
    get_feeds_second_table,
    get_top_dashboard,
)
from .....utils.feed import free_connector_names
from ....data_processors import get_text_for_llm_from_area_or_bar_visual
from ....utils import available_llms, load_llm
from .state import FeedState
from .tools import get_help_for_connector_tool, get_organization_info_tool

llm_pool: Dict[str, ChatOpenAI] = {name: load_llm(name) for name in available_llms}


async def get_feed_page_info() -> str:
    """
    Fetch and return typed visuals from the Feed Top Dashboard.
    """
    dashboard = await get_top_dashboard()

    Total_Supported_Feed_Sources = cast(MetricVisual, dashboard["total"].data).value
    Num_Active_Feed_Sources = (cast(MetricVisual, dashboard["active"].data)).value
    Installed_Feeds_Data = "\n".join(
        [
            str(
                {
                    "Feed_or_Connector_name": feed_row.name,
                    "id": feed_row.id,
                    "path": feed_row.path,
                    "active": feed_row.active,
                    "last_run": feed_row.last_run,
                    "next_run": feed_row.next_run,
                    "n_msg_in_queue": feed_row.n_msg_in_queue,
                    "size_msg_in_queue": feed_row.size_msg_in_queue,
                }
            )
            for feed_row in (await get_feeds_main_table()).rows
        ]
    )

    Feed_Source_Distribution_data = cast(PieVisual, dashboard["distribution-pie"].data)
    Feed_Source_Distribution = ", ".join(
        [f"{x.name}:{x.percent}" for x in Feed_Source_Distribution_data.value]
    )

    Free_Connector_names = ", ".join(free_connector_names)

    Collected_Indicators_per_Source_data = cast(BarVisual, dashboard["ioc-count"].data)
    Collected_Indicators_per_Source = get_text_for_llm_from_area_or_bar_visual(
        x_accessor="feed",
        is_x_ts=False,
        data=Collected_Indicators_per_Source_data.value.data,
    )

    ioc_count_over_time_data = cast(
        HeatmapVisual, dashboard["ioc-count-over-time"].data
    )
    ioc_count_over_time = "\n".join(
        f"{row.id}: " + ", ".join(f"{point.x}={point.y}" for point in row.data)
        for row in ioc_count_over_time_data.value.data
    )

    organization_objects = (await get_feeds_second_table()).rows

    organizations_texts = ", \n".join(
        [org.model_dump_json() for org in organization_objects]
    )

    org2connector_map_objects = (await get_connector_to_organizations_map())[1:]
    org2connector_map_text = ", ".join(
        [
            str({"connector_name": obj.key, "related_organizations": obj.value})
            for obj in org2connector_map_objects
        ]
    )

    return f"""\
In GAI-CTI:
- number of Total Supported Feed Sources (Connectors): {Total_Supported_Feed_Sources}
- number of Installed Feed Sources (Connectors): {Num_Active_Feed_Sources}
- number of Feed Sources (Connectors) Based On Commercial/Free and Active/Inactive: {Feed_Source_Distribution}
- number of Collected Indicators per Feed Source (Connector): {Collected_Indicators_per_Source}
- number of ioc count over time:{ioc_count_over_time}
- List of Free Feed Sources (Connectors): [{Free_Connector_names}]
- List of Organization Objects: [{organizations_texts}]
- Map between Organization Objects and Feed Source Connectors: [{org2connector_map_text}]
- If You Needed To Know What Is The ID Of Each Installed Feed Source (Connector) By Its Name or see the list of installed connectors, Look At This Mapper: {Installed_Feeds_Data}

**Organization Info:**
- Use fuzzy/approximate matching to find the organization name in the List of Organization Objects
- If matched: Get the organization ID and call `get_organization_info_tool`, then find its related connector using the organization2connector mapper
- Respond with all retrieved data. Only decline if no reasonable match exists in the list.

**Feed Source (Connector) Details/Help:**
- Use fuzzy/approximate matching to find the connector in the installed list (input may differ from exact name)
- If reasonable match found: 
    + Get the value of `path["Show Help"]` which looks like a URL and call `get_help_for_connector_tool` with that parameter. 
    + Then Get the other info from the matched connector in the list provided. 
    + Find the organizations related to that connector by using the provided mapper before and use this data too and mention that in your response.
    + Then respond with the data provided by these tools and the related info in the table that is provided.
- Only decline if no reasonable match exists in the list. Otherwise, always respond and use the provided and available data.


**Handling ambiguous context:**
- Check if user mentioned "connector" or "organization" (or variations/typos)
- If YES: Use the specified context, no clarification needed
- If NO: Default to connector and note: "Assuming you're asking about the connector. Specify 'organization' if needed."

"""


system_prompt = """\
You are an AI assistant integrated into the GAI-CTI system, GAI-CTI is an advanced Threat Intelligence platform developed by Amnafzar Gostar-e Sharif in collaboration with, and commissioned by, ITRC (Iran Telecommunication Research Center).

As a cybersecurity assistant, your primary role is to analyze and interpret feed to support security analysts in their investigations.


Here is the feed dashboard information you should consider:
{feed_page_info}
"""

prompt_template = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        ("placeholder", "{messages}"),
    ]
)


tools = [get_help_for_connector_tool, get_organization_info_tool]


async def feed(state: FeedState):
    llm_name = state["llm_name"]
    chain = prompt_template | llm_pool[llm_name].bind_tools(tools).with_config(
        tags=["stream"]
    )

    feed_page_info = await get_feed_page_info()
    ai_msg = await chain.ainvoke(
        {
            "messages": state["messages"],
            "feed_page_info": feed_page_info,
        }
    )
    return {"messages": [ai_msg]}


tool_node = ToolNode(tools=tools)


def feed_graph():
    graph_builder = StateGraph(FeedState)
    graph_builder.add_node("feed", feed)
    graph_builder.add_node("tools", tool_node)

    graph_builder.add_edge(START, "feed")
    graph_builder.add_conditional_edges("feed", tools_condition)
    graph_builder.add_edge("tools", "feed")
    graph_builder.add_edge("feed", END)

    return graph_builder.compile()


async def feed_node(state):
    graph = feed_graph()
    res = await graph.ainvoke(state)

    last_message = res["messages"][-1] if res.get("messages") else None
    return {"messages": last_message}
