from typing import Dict
from datetime import datetime

from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from .....routes.logs import name2index_pattern
from ....data_processors import (
    get_calender_heatmap_log_text_for_llm,
    get_index_patterns_info_for_llm,
    get_index_time_distribution__text_for_llm,
)
from ....utils import available_llms, load_llm
from .state import LogsState
from .tools import (
    get_aggregated_index_info,
    get_index_info_table,
    get_logs_by_date_range,
    get_logs_by_time_range,
    get_single_log_info_by_id,
)

llm_pool: Dict[str, ChatOpenAI] = {name: load_llm(name) for name in available_llms}


async def get_logs_page_data(index_pattern: str):
    index_patterns_info_for_llm = await get_index_patterns_info_for_llm()

    calender_heatmap_text = await get_calender_heatmap_log_text_for_llm(index_pattern)

    index_patterns_time_distributions_text = (
        await get_index_time_distribution__text_for_llm()
    )

    return f"""
- Available Index Patterns: 
[
{index_patterns_info_for_llm}
]

You have access to a mapping between Index Names and their corresponding Index Patterns:

{str(name2index_pattern)}

When a user requests data about an index or when calling tools that require an index parameter, follow these rules:
1. If the user provides an index name (exact or approximate match), translate it to its corresponding index pattern using this mapping
2. Always pass the index pattern (not the index name) to subsequent tools or operations
3. If no exact match is found, use fuzzy matching to find the closest index name, then use its pattern

Example: If user asks for "customer data" and the mapping contains "customer-data" → "customer-*", use "customer-*" in your tool calls.


- Index Pattern Matching Instructions:
When the user asks a question requiring an index-pattern argument:

1. If the user references an index by NAME (e.g., "TI"):
   - Map it to the corresponding PATTERN value from the list above
   - Example: "TI" → "opencti-indicators-*"

2. If the user provides a partial or approximate match:
   - Intelligently match it to the closest available index pattern
   - Example: "threat intel" → "opencti-indicators-*"

3. If the user provides a pattern that doesn't match any available index:
   - Use the user's exact input as-is (they may be referencing a custom or unlisted index)
   - Do not modify or reject the value

4. Always prioritize exact matches first, then fuzzy/semantic matches, then fall back to using the literal user input.


- Context for the current session:
1. Index Pattern: The user is analyzing logs from the '{index_pattern}' index pattern.

2. Daily Log Volume: Calendar heatmap showing the number of logs ingested per day:
{calender_heatmap_text}


- Temporal Distribution: Log injection timeline distributed across index names:
{index_patterns_time_distributions_text}


**Important**: Before responding to queries about log counts, trends, or distributions, verify the information using available tools rather than relying solely on the context provided above.
"""


system_prompt = """\
You are an AI assistant integrated into the GAI-CTI system, GAI-CTI is an advanced Threat Intelligence platform developed by Amnafzar Gostar-e Sharif in collaboration with, and commissioned by, ITRC (Iran Telecommunication Research Center).

As a cybersecurity assistant, your primary role is to analyze and interpret logs to support security analysts in their investigations.

---

## Current Date and Time

**Current Date/Time:** {current_datetime}

Use this information when interpreting relative time queries (e.g., "last week", "yesterday") or when working with specific date ranges.

---

Below is the list of available tools to you:

1. **get_single_log_info_by_id(index_pattern, log_id)**  
   - Retrieve a single log document by its unique ID from a given index.  
   - Returns the document `_source` as text.  
   - Use this when the user requests detailed information about a specific log entry.  

2. **get_index_info_table(index_pattern)**  
   - Generate a daily log count table.  
   - Aggregates documents per day using either `@timestamp` or 
     `threatintel.opencti.created_at` (if the index pattern starts with `"open"`).  
   - Returns a list of dictionaries: each contains `timestamp` (YYYY-MM-DD) and `total_doc_count`.  
   - Use this when the user asks about log activity over time, trends, or daily counts.  

3. **get_aggregated_index_info(index_pattern)**  
   - Query aggregated information about logs.  
   - Returns the top 10 most frequent `labels.keyword` and the top 10 most frequent 
     `threatintel.indicator.provider.keyword` values, along with their document counts.  
   - Use this when the user asks about the most common log labels, categories, or threat intel providers.  

4. **get_logs_by_time_range(index_pattern, hours=24)**  
   - Retrieve logs within a specific time range from now.
   - Specify hours to look back (e.g., 24 for last day, 48 for 2 days, 168 for last week, 720 for last month).
   - Returns total count, sample logs (up to 100), top labels, and time range information.
   - Use this when the user asks about recent log activity or wants to analyze logs from the last X hours/days.

5. **get_logs_by_date_range(index_pattern, start_date, end_date)**  
   - Retrieve logs between specific start and end dates.
   - Use ISO format dates like "2025-02-02" or "2025-02-02T12:00:00".
   - Returns total count, sample logs (up to 100), top labels, and daily distribution.
   - Use this when the user asks about logs in a specific historical period or wants to compare different time periods.

---
When users inquire about index-related information, always call all of the index-related tools to retrieve accurate data. Tool responses are essential for providing correct answers. 

By considering these information:
{logs_page_data}

Your tasks are:  
- Answer the user’s cybersecurity and log analysis questions.  
- Decide when to call the right tool(s) to fetch or analyze data.  
- Provide clear, professional explanations of results, including insights that would help a SOC analyst or threat hunter.  
- If a user’s query is ambiguous, ask clarifying questions before using a tool.  
"""

prompt_template = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        ("placeholder", "{messages}"),
    ]
)


tools = [
    get_aggregated_index_info,
    get_index_info_table,
    get_single_log_info_by_id,
    get_logs_by_time_range,
    get_logs_by_date_range,
]


async def log(state: LogsState):
    llm_name = state["llm_name"]
    chain = prompt_template | llm_pool[llm_name].bind_tools(tools).with_config(
        tags=["stream"]
    )

    logs_page_data = await get_logs_page_data(
        index_pattern=name2index_pattern[state["index_pattern"]]
    )
    
    # Get current datetime for the LLM
    current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S %Z")

    ai_msg = await chain.ainvoke(
        {
            "messages": state["messages"],
            "logs_page_data": logs_page_data,
            "current_datetime": current_datetime,
        }
    )
    return {"messages": [ai_msg]}


tool_node = ToolNode(tools=tools)


def log_graph():
    graph_builder = StateGraph(LogsState)
    graph_builder.add_node("log", log)
    graph_builder.add_node("tools", tool_node)

    graph_builder.add_edge(START, "log")
    graph_builder.add_conditional_edges("log", tools_condition)
    graph_builder.add_edge("tools", "log")
    graph_builder.add_edge("log", END)

    return graph_builder.compile()


async def log_node(state):
    graph = log_graph()
    res = await graph.ainvoke(state)

    last_message = res["messages"][-1] if res.get("messages") else None
    return {"messages": last_message}
