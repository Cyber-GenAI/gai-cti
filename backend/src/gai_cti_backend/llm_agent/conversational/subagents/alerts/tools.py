from langchain_core.tools import tool

from .....elastic_client.alert import (
    get_alerts_by_date_range,
    get_alerts_in_time_range,
    get_last_24h_alerts_count,
    get_total_alerts_count,
)
from .....elastic_client.utils.others import get_es
from ....data_processors import (
    get_alert_info_for_llm_by_id,
    get_alert_info_for_llm_by_raw_alert,
)


# alerts tools
@tool(
    "total_alerts_for_a_rule",
    description="Fetches alerts for a rule_id from Elasticsearch and flattens aggregations into a dictionary.",
)
async def total_alerts_for_a_rule(rule_id: str) -> int:
    es = get_es()

    alert_index = ".internal.alerts-security.alerts-default*"
    query_body = {"query": {"match": {"kibana.alert.rule.rule_id": rule_id}}}
    response = await es.search(index=alert_index, body=query_body)
    await es.close()

    # TODO: format using get_alert_info_for_llm_by_raw_alert

    total_alerts = response["hits"]["total"]["value"]
    return total_alerts


@tool(
    "rule_and_log_for_an_alert",
    description="Fetches rule_text , logs_text for a alert_id from Elasticsearch .",
)
async def get_alert_info(
    alert_id: str,
):
    rule_text, logs_text = await get_alert_info_for_llm_by_id(alert_id)
    return {"rule_text": rule_text, "logs_text": logs_text}


@tool(
    "get_alerts_in_time_range",
    description="Retrieves alerts within a specific time range. Specify hours to look back from now (e.g., 24 for last day, 168 for last week, 48 for last 2 days, 720 for last month).",
)
async def get_alerts_by_time_range(hours: int = 24) -> str:
    """
    Fetch alerts within a specified time range.
    
    Args:
        hours: Number of hours to look back from now (default: 24)
               Examples: 24 (1 day), 48 (2 days), 168 (1 week), 720 (30 days)
    
    Returns:
        Formatted string with alert summary including rule names, severities, and counts
    """
    alerts = await get_alerts_in_time_range(hours=hours, include_match_rules=False)
    
    if not alerts:
        return f"No alerts found in the last {hours} hours."
    
    # Aggregate by rule
    rule_stats = {}
    for alert in alerts:
        rule_id = alert.rule_id
        if rule_id not in rule_stats:
            rule_stats[rule_id] = {
                "rule_name": alert.rule_name,
                "count": 0,
                "severity": alert.severity,
                "type": alert.type,
                "mitre_tags": set(),
            }
        rule_stats[rule_id]["count"] += 1
        for tactic, technique, ttp in alert.mitre_tag:
            rule_stats[rule_id]["mitre_tags"].add(ttp)
    
    # Format output
    result = [f"Found {len(alerts)} alerts in the last {hours} hours:\n"]
    
    for rule_id, stats in sorted(
        rule_stats.items(), key=lambda x: x[1]["count"], reverse=True
    ):
        mitre_tags = ", ".join(sorted(stats["mitre_tags"])) if stats["mitre_tags"] else "None"
        result.append(
            f"- Rule: {stats['rule_name']}\n"
            f"  Rule ID: {rule_id}\n"
            f"  Type: {stats['type']}\n"
            f"  Severity: {stats['severity']}\n"
            f"  Alert Count: {stats['count']}\n"
            f"  MITRE ATT&CK: {mitre_tags}\n"
        )
    
    return "\n".join(result)


@tool(
    "get_alerts_by_specific_dates",
    description="Retrieves alerts between specific start and end dates. Use ISO format dates like '2025-02-02' or '2025-02-02T12:00:00'. This is useful for analyzing alerts in a specific historical period.",
)
async def get_alerts_by_specific_dates(start_date: str, end_date: str) -> str:
    """
    Fetch alerts between specific start and end dates.
    
    Args:
        start_date: Start date in ISO format (e.g., "2025-02-02" or "2025-02-02T12:00:00")
        end_date: End date in ISO format (e.g., "2025-02-05" or "2026-02-15T10:00:00")
    
    Returns:
        Formatted string with alert summary including rule names, severities, and counts
    """
    try:
        alerts = await get_alerts_by_date_range(
            start_date=start_date,
            end_date=end_date,
            include_match_rules=False
        )
    except ValueError as e:
        return f"Error: {str(e)}"
    
    if not alerts:
        return f"No alerts found between {start_date} and {end_date}."
    
    # Aggregate by rule
    rule_stats = {}
    for alert in alerts:
        rule_id = alert.rule_id
        if rule_id not in rule_stats:
            rule_stats[rule_id] = {
                "rule_name": alert.rule_name,
                "count": 0,
                "severity": alert.severity,
                "type": alert.type,
                "mitre_tags": set(),
            }
        rule_stats[rule_id]["count"] += 1
        for tactic, technique, ttp in alert.mitre_tag:
            rule_stats[rule_id]["mitre_tags"].add(ttp)
    
    # Format output
    result = [f"Found {len(alerts)} alerts between {start_date} and {end_date}:\n"]
    
    for rule_id, stats in sorted(
        rule_stats.items(), key=lambda x: x[1]["count"], reverse=True
    ):
        mitre_tags = ", ".join(sorted(stats["mitre_tags"])) if stats["mitre_tags"] else "None"
        result.append(
            f"- Rule: {stats['rule_name']}\n"
            f"  Rule ID: {rule_id}\n"
            f"  Type: {stats['type']}\n"
            f"  Severity: {stats['severity']}\n"
            f"  Alert Count: {stats['count']}\n"
            f"  MITRE ATT&CK: {mitre_tags}\n"
        )
    
    return "\n".join(result)
