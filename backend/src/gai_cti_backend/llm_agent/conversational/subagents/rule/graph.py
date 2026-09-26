from typing import Dict, cast

from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from .....elastic_client.rule import get_all_rule_tags
from .....models.visual import BarVisual, PieVisual, TreeMapVisual
from .....routes.rules import get_top_dashboard
from ....data_processors import get_text_for_llm_from_area_or_bar_visual
from ....utils import available_llms, load_llm
from .state import RulesState
from .tools import get_rule_info_tool, get_rules_by_tag_tool

llm_pool: Dict[str, ChatOpenAI] = {name: load_llm(name) for name in available_llms}


async def get_all_rules_info(default_rule_tag: str) -> str:
    dashboard = await get_top_dashboard()

    all_tags = await get_all_rule_tags()

    all_tags_text = ", ".join(all_tags)

    risk_dist_data = cast(BarVisual, dashboard["risk-distribution"].data)
    risk_dist = get_text_for_llm_from_area_or_bar_visual(
        risk_dist_data.value.data, is_x_ts=False, x_accessor="risk"
    )

    tags_treemap = cast(TreeMapVisual, dashboard["tags-treemap"].data)
    tag_freq = ", ".join([f"{x.name}:{x.percent}" for x in tags_treemap.value])

    rule_severity = cast(PieVisual, dashboard["severity"].data)
    rule_severity_value = ", ".join(
        [f"{x.name}:{x.percent}" for x in rule_severity.value]
    )

    return f"""\
In GAI-CTI:
- number of all rules: {dashboard["total-count"].data.value}
- number of Sigma rules: {dashboard["sigma-count"].data.value}
- number of TI rules: {dashboard["ioc-count"].data.value}
- number of custom rules: {dashboard["custom-count"].data.value}
- histogram of risk score of rules: {risk_dist}
- frequency of each tag of rule: {tag_freq}
- rule count on each severity: {rule_severity_value}

You have access to a comprehensive list of valid rule tags. When a user references rules by their tags:

1. **Tag Mapping Process:**
   - Compare the user's input against the available tags list
   - If there's a close match, map to the most similar tag from the list
   - Inform the user which tag you're using (e.g., "I'm using the tag 'security-policy' based on your request")

2. **Handling Unmatched Tags:**
   - If the user's input is significantly different from all available tags and no reasonable match exists
   - Default to: {default_rule_tag}
   - Clearly communicate: "I couldn't find a matching tag in the system for '[user's input]'. I'm using the default tag '{default_rule_tag}' instead."

3. **Available Tags:**
{all_tags_text}

**Key Principle:** Prioritize accuracy over forced matching. Only map to a tag when there's genuine similarity. When in doubt, use the default tag and be transparent with the user.

"""


system_prompt = """\
You are an AI assistant embedded in the GAI-CTI system — an advanced Threat Intelligence platform developed by Amnafzar Gostar-e Sharif and commissioned by the Iran Telecommunication Research Center (ITRC).

Your role is to act as a cybersecurity assistant for analysts, helping them interpret, analyze, and operationalize detection rules.

You have access to these information from Rules page:
{all_rules_info}


Your tasks:
- Answer the user’s questions about rules, alerts, and detection logic.
- If the user asks about a specific rule with its rule_id, use get_rule_info_tool(rule_id) tool to retrieve proper information.
- If the user asks about group of rules, use get_rules_by_tag_tool(tag) by selecting proper tags.
- always explain the results of tools to user in a clear manner, do not forward them directly to user.
- Provide clear, SOC-analyst style explanations — not just raw output.
- Use the aggregated alert data to support your answers (e.g., show which rules are most active, trending, or noisy).
- If a query is unclear, ask clarifying questions before using a tool.
"""


prompt_template = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        ("placeholder", "{messages}"),
    ]
)


tools = [get_rule_info_tool, get_rules_by_tag_tool]


async def rule(state: RulesState):
    llm_name = state["llm_name"]
    chain = prompt_template | llm_pool[llm_name].bind_tools(tools).with_config(
        tags=["stream"]
    )

    all_rules_info = await get_all_rules_info(state["rule_id"])
    ai_msg = await chain.ainvoke(
        {
            "messages": state["messages"],
            "all_rules_info": all_rules_info,
        }
    )
    return {"messages": [ai_msg]}


tool_node = ToolNode(tools=tools)


def rule_graph():
    graph_builder = StateGraph(RulesState)
    graph_builder.add_node("rule", rule)
    graph_builder.add_node("tools", tool_node)

    graph_builder.add_edge(START, "rule")
    graph_builder.add_conditional_edges("rule", tools_condition)
    graph_builder.add_edge("tools", "rule")
    # graph_builder.add_edge("rule", END)

    return graph_builder.compile()


async def rule_node(state):
    graph = rule_graph()
    res = await graph.ainvoke(state)

    last_message = res["messages"][-1] if res.get("messages") else None
    return {"messages": last_message}
