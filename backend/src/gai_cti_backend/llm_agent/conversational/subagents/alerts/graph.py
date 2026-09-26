from datetime import datetime
from typing import Dict

from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from .....elastic_client.alert import get_last_24h_alerts_count, get_total_alerts_count
from .....elastic_client.utils.others import get_es
from ....utils import available_llms, load_llm
from .state import AlertsState
from .tools import (
    get_alert_info,
    get_alerts_by_specific_dates,
    get_alerts_by_time_range,
    total_alerts_for_a_rule,
)

llm_pool: Dict[str, ChatOpenAI] = {name: load_llm(name) for name in available_llms}


async def get_all_alerts_tags(limit: int = 100) -> str:
    """
    Fetch and summarize the most common alert rule tags from Elasticsearch.
    Args: limit (int, optional): Maximum number of unique tags to retrieve. Defaults to 100.
    Returns: str: A formatted summary of alert tags and their corresponding document counts.
    """
    es = get_es()
    alert_index = ".internal.alerts-security.alerts-default*"

    query_body = {
        "size": 0,
        "aggs": {
            "count_tags": {"terms": {"field": "kibana.alert.rule.tags", "size": limit}}
        },
    }

    response = await es.search(index=alert_index, body=query_body)
    buckets = response["aggregations"]["count_tags"]["buckets"]
    await es.close()

    total_alerts = await get_total_alerts_count()
    last_24h_alerts = await get_last_24h_alerts_count()

    result = [f"In GAI-CTI there are alert Tags Summary: "]

    for bucket in buckets:
        tag = bucket["key"]
        doc_count = bucket["doc_count"]
        result.append(f"- Tag Name: {tag}, Total Alerts: {doc_count}")

    return f"""\
{"\n".join(result)}
- Total Alerts : {total_alerts}
- Alerts in Last 24 Hours: {last_24h_alerts}
"""


async def alerts_aggregated_by_rule() -> str:
    """
    Query Elasticsearch for security alerts and aggregate them by alert rule.
    This function connects to the Elasticsearch index
    `.internal.alerts-security.alerts-default*` and runs an aggregation query
    grouped by the field `kibana.alert.rule.name`.
    """

    es = get_es()

    alert_index = ".internal.alerts-security.alerts-default*"
    query_body = {
        "size": 0,
        "runtime_mappings": {
            "groupByField": {
                "type": "keyword",
                "script": {
                    "source": "if (doc[params['selectedGroup']].size()==0) { emit(params['uniqueValue']) } else { emit(doc[params['selectedGroup']].join(params['uniqueValue']))}",
                    "params": {
                        "selectedGroup": "kibana.alert.rule.name",
                        "uniqueValue": "__",
                    },
                },
            }
        },
        "aggs": {
            "groupByFields": {
                "terms": {"field": "groupByField", "size": 10000},
                "aggs": {
                    "bucket_truncate": {
                        "bucket_sort": {
                            "sort": [{"unitsCount": {"order": "desc"}}],
                            "from": 0,
                            "size": 25,
                        }
                    },
                    "unitsCount": {"cardinality": {"field": "kibana.alert.uuid"}},
                    "description": {
                        "terms": {"field": "kibana.alert.rule.description", "size": 1}
                    },
                    "rule_id": {
                        "terms": {"field": "kibana.alert.rule.rule_id", "size": 1}
                    },
                    "severitiesSubAggregation": {
                        "terms": {"field": "kibana.alert.severity"}
                    },
                    "usersCountAggregation": {"cardinality": {"field": "user.name"}},
                    "hostsCountAggregation": {"cardinality": {"field": "host.name"}},
                    "ruleTags": {"terms": {"field": "kibana.alert.rule.tags"}},
                },
            }
        },
    }
    response = await es.search(index=alert_index, body=query_body)
    await es.close()

    result = [f"In GAI-CTI there are alerts aggregated by rule Summary:"]

    for bucket in response["aggregations"]["groupByFields"]["buckets"]:
        rule_id = bucket["rule_id"]["buckets"][0]["key"]
        rule_name = bucket["key"]
        rule_tags = ", ".join([f"`{t["key"]}`" for t in bucket["ruleTags"]["buckets"]])
        rule_description = bucket["description"]["buckets"][0]["key"]
        severity = bucket.get("severitiesSubAggregation")["buckets"][0]["key"]
        users_count = bucket.get("usersCountAggregation").get("value")
        hosts_count = bucket.get("hostsCountAggregation").get("value")
        alert_count = bucket.get("doc_count")

        rule_data = f"""\
- Rule ID: {rule_id}
- Rule Name: {rule_name}
- Rule Tags: {rule_tags}
- Rule Description: {rule_description}
- Rule severity: {severity}
- Count of unique users involved: {users_count}
- Count of unique hosts involved: {hosts_count}
- Total number of alerts: {alert_count}
---"""
        result.append(rule_data)

    return "\n".join(result)


async def get_dashboard_info() -> str:
    es = get_es()
    alert_index = ".internal.alerts-security.alerts-default*"

    query_body = {
        "size": 0,
        "query": {
            "range": {
                "kibana.alert.rule.execution.timestamp": {"gte": "now-1y", "lte": "now"}
            }
        },
        "aggs": {
            "severity_levels": {
                "terms": {
                    "field": "kibana.alert.severity.keyword",
                    "size": 10,
                    "order": {"_count": "desc"},
                }
            },
            "alerts_by_name": {
                "terms": {
                    "field": "kibana.alert.rule.name.keyword",
                    "size": 10,
                    "order": {"_count": "desc"},
                }
            },
            "top_alerts": {
                "terms": {
                    "field": "kibana.alert.rule.rule_id.keyword",
                    "size": 10,
                    "order": {"_count": "desc"},
                },
                "aggs": {
                    "host_name": {"terms": {"field": "host.name.keyword", "size": 5}},
                    "user_name": {"terms": {"field": "user.name.keyword", "size": 5}},
                    "source_ip": {"terms": {"field": "source.ip", "size": 5}},
                    "destination_ip": {"terms": {"field": "destination.ip", "size": 5}},
                },
            },
        },
    }

    response = await es.search(index=alert_index, body=query_body)
    await es.close()

    severity_buckets = response["aggregations"]["severity_levels"]["buckets"]
    severity_level = ", ".join(
        f"{b['key']}: {b['doc_count']}" for b in severity_buckets
    )
    total_alerts = sum(b["doc_count"] for b in severity_buckets)

    rule_buckets = response["aggregations"]["alerts_by_name"]["buckets"]
    rule_name = ", ".join(b["key"] for b in rule_buckets)
    count = ", ".join(str(b["doc_count"]) for b in rule_buckets)

    top_alerts_buckets = response["aggregations"]["top_alerts"]["buckets"]
    top_alerts_with_filter = []
    for bucket in top_alerts_buckets:
        hosts = ", ".join(h["key"] for h in bucket["host_name"]["buckets"])
        users = ", ".join(u["key"] for u in bucket["user_name"]["buckets"])
        src_ips = ", ".join(s["key"] for s in bucket["source_ip"]["buckets"])
        dst_ips = ", ".join(d["key"] for d in bucket["destination_ip"]["buckets"])
        top_alerts_with_filter.append(
            f"RuleID: {bucket['key']}, Count: {bucket['doc_count']}, Hosts: {hosts}, Users: {users}, SrcIPs: {src_ips}, DstIPs: {dst_ips}"
        )
    top_alerts_with_filter = " | ".join(top_alerts_with_filter)

    return f"""\
In GAI-CTI alerts page we have dashboards showing:
- Severity Levels: {severity_level} (Total Alerts: {total_alerts})
- Alerts by rule: {rule_name} (Counts: {count})
- Top Alerts with context: {top_alerts_with_filter}
"""


system_prompt = """\
You are an AI assistant integrated into the **GAI-CTI Threat Intelligence Platform**, developed by **Amnafzar Gostar-e Sharif** in collaboration with **ITRC (Iran Telecommunication Research Center)**.  

Your role is to support SOC (Security Operations Center) analysts by investigating security alerts, analyzing patterns, and providing professional insights based on available data.  

---

## Current Date and Time

**Current Date/Time:** {current_datetime}

Use this information when interpreting relative time queries (e.g., "last week", "yesterday") or when working with specific date ranges.

---

## Available Context Variables

During each interaction, you may be provided with pre-fetched contextual information:

1. **Aggregated Alerts by Rule (`{aggregated_alerts_text}`)**  
   - Summarized alerts grouped by detection rule.  
   - Contains fields like rule ID, name, description, tags, severity distribution, user count, host count, and total alerts.

2. **Tags Information (`{tags_info}`)**  
   - Summarized distribution of alert tags across the dataset.  
   - Includes total alerts and alerts generated in the last 24 hours.

---

## Available Tools

You can query Elasticsearch data through the following tools:

1. **`total_alerts_for_a_rule(rule_id: str)`**  
  Returns the total number of alerts for a given detection rule. Useful when drilling down on a single rule.

2. **`get_alert_info(alert_id: str)`**  
  Fetches raw rule text and associated logs for a specific alert. Useful for deep-dive investigations and validation.

3. **`get_alerts_by_time_range(hours: int = 24)`**  
  Retrieves and summarizes alerts within a specific time range. Specify hours to look back (e.g., 24 for last day, 48 for 2 days, 168 for last week, 720 for last month). Returns aggregated statistics by rule including counts, severities, and MITRE ATT&CK tags.

4. **`get_alerts_by_specific_dates(start_date: str, end_date: str)`**  
  Retrieves and summarizes alerts between specific start and end dates. Use ISO format dates like "2025-02-02" or "2025-02-02T12:00:00". This is useful for analyzing alerts in a specific historical period or comparing different time periods.

---

## Analyst Response Guidelines

When responding to analysts:  

- **Style & Language**  
  - Use concise, professional SOC language.  
  - Prefer structured outputs with bullet points.  
  - Highlight anomalies, trends, and potential threats.  

- **Analysis Approach**  
  - Compare **last 24h vs historical baseline** whenever possible.  
  - Identify **dominant rules or tags** driving alerts.  
  - Correlate **rule-level alerts, tags, and dashboard data** for deeper insights.  
  - Flag **high-severity spikes** or concentration in certain attack techniques.  

- **Recommendations**  
  - Suggest concrete next steps (e.g., “Investigate source IPs linked to multiple high-severity alerts” or “Check whether affected hosts show signs of lateral movement”).  
  - Recommend triage priorities based on severity and scope (users/hosts involved).  

- **Avoid Raw Dumps**  
  - Do **not** just echo tool outputs.  
  - Always summarize, interpret, and contextualize the data for SOC use.  

---

## Your Tasks

- Use the above tools and context variables to answer analyst queries.  
- If a tool call is needed, **wait for its output** before forming conclusions.  
- Provide insights such as:  
  - Dominant rules or tags  
  - Severity-level trends  
  - Spikes or anomalies in alert activity  
  - Recommended next investigation steps  

---

### Example Analyst-Oriented Response

- Observed spike: **Critic**

"""


prompt_template = ChatPromptTemplate.from_messages(
    messages=[
        ("system", system_prompt),
        ("placeholder", "{messages}"),
    ]
)


tools = [
    total_alerts_for_a_rule,
    get_alert_info,
    get_alerts_by_time_range,
    get_alerts_by_specific_dates,
]


async def alerts(state: AlertsState):
    llm_name = state["llm_name"]
    chain = prompt_template | llm_pool[llm_name].bind_tools(tools).with_config(
        tags=["stream"]
    )

    aggregated_alerts_text = await alerts_aggregated_by_rule()

    alerts_dashboard_info = await get_dashboard_info()

    tags_info = await get_all_alerts_tags()

    # Get current datetime for the LLM
    current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S %Z")

    ai_msg = await chain.ainvoke(
        {
            "messages": state["messages"],
            "aggregated_alerts_text": aggregated_alerts_text,
            "alerts_dashboard_info": alerts_dashboard_info,
            "tags_info": tags_info,
            "current_datetime": current_datetime,
        }
    )
    return {"messages": [ai_msg]}


tool_node = ToolNode(tools=tools)


def alerts_graph():
    graph_builder = StateGraph(AlertsState)
    graph_builder.add_node("alerts", alerts)
    graph_builder.add_node("tools", tool_node)

    graph_builder.add_edge(START, "alerts")
    graph_builder.add_conditional_edges("alerts", tools_condition)
    graph_builder.add_edge("tools", "alerts")
    graph_builder.add_edge("alerts", END)

    return graph_builder.compile()


async def alerts_node(state):
    graph = alerts_graph()
    res = await graph.ainvoke(state)

    last_message = res["messages"][-1] if res.get("messages") else None
    return {"messages": last_message}


# TODO:
# 1. a tool to get dashboard info (input: time filter)
# 2. add dashboard info with one year time filter to sys prompt
# 3. include all sections of `Top Alerts` in dashboard info (include count if possible)
# 4. what about other groupbys? eg. tactic, source ip
