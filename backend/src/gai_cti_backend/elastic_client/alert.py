from concurrent.futures import ProcessPoolExecutor
from datetime import datetime, timedelta
from typing import Any, Dict, List, Tuple

import httpx
from elasticsearch8.helpers import async_scan

from ..conf import kibana_conn_info
from ..elastic_client.rule import get_rule_info
from ..models.alert import AlertConcise
from ..utils import gen_all_valid_ttps
from ..utils.alert import get_alert_ti_info
from .utils import get_es

KIBANA_URL = kibana_conn_info["url"]
ELASTIC_USER = kibana_conn_info["username"]
ELASTIC_PASSWORD = kibana_conn_info["password"]

client = httpx.AsyncClient(
    base_url=KIBANA_URL,
    auth=(ELASTIC_USER, ELASTIC_PASSWORD),
    headers={"kbn-xsrf": "true"},
)


async def extract_rule_and_log_ids(alert_id: str) -> Tuple[str, List[str], List[str]]:
    es = get_es()

    query_body = {"query": {"ids": {"values": [alert_id]}}}

    response = await es.search(
        index=".internal.alerts-security.alerts-default*", body=query_body
    )
    hits = response["hits"]["hits"]

    await es.close()

    if hits:
        alert = hits[0]["_source"]  # Return the first matching document
    else:
        raise KeyError("Document not found.")

    rule_id = alert["kibana.alert.rule.uuid"]
    log_ids = []
    log_indenes = []
    for obj in alert["kibana.alert.ancestors"]:
        log_ids.append(obj["id"])
        log_indenes.append(obj["index"])
    return (
        rule_id,
        log_indenes,
        log_ids,
    )


async def make_an_alert_concise(
    alert: Dict[str, Any],
    include_match_rules: bool = True,
) -> AlertConcise:
    log_ids = []
    log_indenes = []

    alert.setdefault("kibana.alert.ancestors", [])

    for obj in alert["kibana.alert.ancestors"]:
        log_ids.append(obj["id"])
        log_indenes.append(obj["index"])

    matched_ioc_data = {}

    alert.setdefault("kibana.alert.rule.category", [])

    if (
        include_match_rules
        and alert["kibana.alert.rule.category"] == "Indicator Match Rule"
    ):
        if alert_ti_info := await get_alert_ti_info(alert["_id"]):
            matched_ioc_data = {
                "id": alert_ti_info.get("id", ""),
                "name": alert_ti_info.get("name", ""),
                "author": alert_ti_info.get("author", ""),
                "indicator_pattern": alert_ti_info.get("indicator_pattern", ""),
            }

    # tactics = []
    # techniques = []
    # for obj in alert["kibana.alert.rule.threat"]:
    #     tactics.append(obj["tactic"]["id"])
    #     techniques.append(obj["technique"]["id"])
    # gen_all_valid_ttps(tactics, techniques)

    mitre_tag = []
    for obj in alert.get("kibana.alert.rule.threat", []):
        if obj["framework"] == "MITRE ATT&CK":
            tactic = obj["tactic"]["id"].upper()
            for tech_obj in obj["technique"]:
                technique = tech_obj["id"].upper()
                ttp = f"{tactic}/{technique}"
                mitre_tag.append((tactic, technique, ttp))

    return AlertConcise(
        id=alert["_id"],
        time=datetime.fromisoformat(alert["kibana.alert.original_time"]),
        log_ids=log_ids,
        log_indenes=log_indenes,
        rule_id=alert["kibana.alert.rule.uuid"],
        rule_name=alert["kibana.alert.rule.name"],
        type=alert["kibana.alert.rule.parameters"]["type"],
        matched_ioc=matched_ioc_data,
        mitre_tag=mitre_tag,
        severity=alert["kibana.alert.rule.parameters"]["type"],
        reason=alert["kibana.alert.reason"],
    )


async def get_all_alert_as_concise_obj(exclude_ti: bool = False) -> List[AlertConcise]:
    chunk_size = 1000
    es = get_es()
    concise_alerts: List[AlertConcise] = []
    async for hit in async_scan(
        client=es,
        index=".internal.alerts-security.alerts-default*",
        query={"query": {"match_all": {}}},
        scroll="2m",
        size=chunk_size,
    ):
        obj: Dict[str, Any] = hit.get("_source", {})
        obj["_id"] = hit.get("_id", "")
        concise_alerts.append(
            await make_an_alert_concise(
                alert=obj,
                include_match_rules=not exclude_ti,
            )
        )

    await es.close()

    return concise_alerts


async def get_total_alerts_count() -> httpx.Response:
    url = "/api/detection_engine/signals/search"
    now_datetime = (datetime.now()).isoformat(timespec="milliseconds") + "Z"
    data = {
        "size": 0,
        "aggs": {"alert_count": {"value_count": {"field": "@timestamp"}}},
        "query": {
            "bool": {
                "filter": [
                    {
                        "bool": {
                            "must": [],
                            "filter": [
                                {
                                    "match_phrase": {
                                        "kibana.alert.workflow_status": "open"
                                    }
                                }
                            ],
                            "should": [],
                            "must_not": [
                                {
                                    "exists": {
                                        "field": "kibana.alert.building_block_type"
                                    }
                                }
                            ],
                        }
                    },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": "2025-07-08T20:30:00.000Z",
                                "lte": now_datetime,
                            }
                        }
                    },
                ]
            }
        },
        "runtime_mappings": {},
    }

    response = await client.post(url, json=data)
    response.raise_for_status()
    return response.json()["aggregations"]["alert_count"]["value"]


async def get_last_24h_alerts_count() -> httpx.Response:
    url = "/api/detection_engine/signals/search"
    now_datetime = (datetime.now()).isoformat(timespec="milliseconds") + "Z"
    yesterday_datetime = (datetime.now() - timedelta(days=1)).isoformat(
        timespec="milliseconds"
    ) + "Z"
    data = {
        "size": 0,
        "aggs": {"alert_count": {"value_count": {"field": "@timestamp"}}},
        "aggs": {"alert_count": {"value_count": {"field": "@timestamp"}}},
        "query": {
            "bool": {
                "filter": [
                    {"match_phrase": {"kibana.alert.workflow_status": "open"}},
                    {
                        "range": {
                            "@timestamp": {
                                "gte": yesterday_datetime,
                                "lte": now_datetime,
                            }
                        }
                    },
                    {
                        "bool": {
                            "must_not": [
                                {
                                    "exists": {
                                        "field": "kibana.alert.building_block_type"
                                    }
                                }
                            ]
                        }
                    },
                ]
            }
        },
    }

    response = await client.post(url, json=data)
    response.raise_for_status()
    return response.json()["aggregations"]["alert_count"]["value"]


async def get_alerts_count_by_tag(rule_type: str) -> httpx.Response:
    url = "/api/detection_engine/signals/search"
    now_datetime = (datetime.now()).isoformat(timespec="milliseconds") + "Z"
    data = {
        "size": 0,
        "aggs": {"alert_count": {"value_count": {"field": "@timestamp"}}},
        "query": {
            "bool": {
                "filter": [
                    {
                        "bool": {
                            "must": [],
                            "filter": [
                                {"match_phrase": {"kibana.alert.rule.tags": rule_type}},
                                {
                                    "match_phrase": {
                                        "kibana.alert.workflow_status": "open"
                                    }
                                },
                            ],
                            "should": [],
                            "must_not": [
                                {
                                    "exists": {
                                        "field": "kibana.alert.building_block_type"
                                    }
                                }
                            ],
                        }
                    },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": "2025-07-08T20:30:00.000Z",
                                "lte": now_datetime,
                            }
                        }
                    },
                ]
            }
        },
        "runtime_mappings": {},
    }

    response = await client.post(url, json=data)
    response.raise_for_status()
    return response.json()["aggregations"]["alert_count"]["value"]


async def get_alerts_count_excluding_tag(rule_type: str) -> httpx.Response:
    url = "/api/detection_engine/signals/search"
    now_datetime = (datetime.now()).isoformat(timespec="milliseconds") + "Z"
    data = {
        "size": 0,
        "aggs": {"alert_count": {"value_count": {"field": "@timestamp"}}},
        "query": {
            "bool": {
                "filter": [
                    {
                        "bool": {
                            "must": [],
                            "filter": [
                                {
                                    "match_phrase": {
                                        "kibana.alert.workflow_status": "open"
                                    }
                                }
                            ],
                            "should": [],
                            "must_not": [
                                {"match_phrase": {"kibana.alert.rule.tags": rule_type}},
                                {
                                    "exists": {
                                        "field": "kibana.alert.building_block_type"
                                    }
                                },
                            ],
                        }
                    },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": "2025-07-08T20:30:00.000Z",
                                "lte": now_datetime,
                            }
                        }
                    },
                ]
            }
        },
        "runtime_mappings": {},
    }

    response = await client.post(url, json=data)
    response.raise_for_status()
    return response.json()["aggregations"]["alert_count"]["value"]


async def get_alerts_in_time_range(
    hours: int = 24,
    include_match_rules: bool = True,
) -> List[AlertConcise]:
    """
    Retrieve alerts within a specific time range.
    
    Args:
        hours: Number of hours to look back from now (default: 24)
        include_match_rules: Whether to include matched IOC data for Indicator Match Rules
    
    Returns:
        List of AlertConcise objects within the specified time range
    """
    es = get_es()
    
    now_datetime = datetime.now()
    start_datetime = now_datetime - timedelta(hours=hours)
    
    query_body = {
        "query": {
            "bool": {
                "filter": [
                    {
                        "range": {
                            "@timestamp": {
                                "gte": start_datetime.isoformat(timespec="milliseconds") + "Z",
                                "lte": now_datetime.isoformat(timespec="milliseconds") + "Z",
                            }
                        }
                    },
                    {
                        "bool": {
                            "must_not": [
                                {
                                    "exists": {
                                        "field": "kibana.alert.building_block_type"
                                    }
                                }
                            ]
                        }
                    },
                ]
            }
        },
        "sort": [{"@timestamp": {"order": "desc"}}],
    }
    
    concise_alerts: List[AlertConcise] = []
    chunk_size = 1000
    
    async for hit in async_scan(
        client=es,
        index=".internal.alerts-security.alerts-default*",
        query=query_body,
        scroll="2m",
        size=chunk_size,
    ):
        obj: Dict[str, Any] = hit.get("_source", {})
        obj["_id"] = hit.get("_id", "")
        concise_alerts.append(
            await make_an_alert_concise(
                alert=obj,
                include_match_rules=include_match_rules,
            )
        )
    
    await es.close()
    
    return concise_alerts


async def get_alerts_by_date_range(
    start_date: str,
    end_date: str,
    include_match_rules: bool = True,
) -> List[AlertConcise]:
    """
    Retrieve alerts between specific start and end dates.
    
    Args:
        start_date: Start date/datetime in ISO format (e.g., "2025-02-02", "2025-02-02T12:00:00")
        end_date: End date/datetime in ISO format (e.g., "2025-02-05", "2026-02-15T10:00:00")
        include_match_rules: Whether to include matched IOC data for Indicator Match Rules
    
    Returns:
        List of AlertConcise objects within the specified date range
    """
    es = get_es()
    
    # Parse dates - handle both date-only and datetime formats
    try:
        start_datetime = datetime.fromisoformat(start_date.replace("Z", ""))
    except ValueError:
        raise ValueError(f"Invalid start_date format: {start_date}. Use ISO format like '2025-02-02' or '2025-02-02T12:00:00'")
    
    try:
        end_datetime = datetime.fromisoformat(end_date.replace("Z", ""))
    except ValueError:
        raise ValueError(f"Invalid end_date format: {end_date}. Use ISO format like '2025-02-05' or '2025-02-05T23:59:59'")
    
    # Ensure start is before end
    if start_datetime >= end_datetime:
        raise ValueError(f"start_date ({start_date}) must be before end_date ({end_date})")
    
    query_body = {
        "query": {
            "bool": {
                "filter": [
                    {
                        "range": {
                            "@timestamp": {
                                "gte": start_datetime.isoformat(timespec="milliseconds") + "Z",
                                "lte": end_datetime.isoformat(timespec="milliseconds") + "Z",
                            }
                        }
                    },
                    {
                        "bool": {
                            "must_not": [
                                {
                                    "exists": {
                                        "field": "kibana.alert.building_block_type"
                                    }
                                }
                            ]
                        }
                    },
                ]
            }
        },
        "sort": [{"@timestamp": {"order": "desc"}}],
    }
    
    concise_alerts: List[AlertConcise] = []
    chunk_size = 1000
    
    async for hit in async_scan(
        client=es,
        index=".internal.alerts-security.alerts-default*",
        query=query_body,
        scroll="2m",
        size=chunk_size,
    ):
        obj: Dict[str, Any] = hit.get("_source", {})
        obj["_id"] = hit.get("_id", "")
        concise_alerts.append(
            await make_an_alert_concise(
                alert=obj,
                include_match_rules=include_match_rules,
            )
        )
    
    await es.close()
    
    return concise_alerts
