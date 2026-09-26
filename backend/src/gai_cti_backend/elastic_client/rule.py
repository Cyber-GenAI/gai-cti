import asyncio
import uuid
from datetime import datetime
from io import BytesIO
from logging import getLogger
from typing import Dict, List, Tuple

import httpx

from ..conf import kibana_conn_info
from ..models.rule import RawRules
from ..models.utils import FieldWithType
from ..utils.redis import redis_get, redis_remove, redis_set
from .utils import client, get_es, is_es_ready, is_kibana_ready

logger = getLogger(__name__)


async def get_rule_all_info(rule_id: str) -> Dict[str, str]:
    """
    Extract rule_data from kibana by rule ID, return details of rules as a Dict.
    """
    async with httpx.AsyncClient(
        base_url=kibana_conn_info["url"],
        auth=(kibana_conn_info["username"], kibana_conn_info["password"]),
        headers={
            "kbn-xsrf": "true",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        timeout=15.0,
        verify=False,
    ) as client:
        response = await client.get(
            "/api/detection_engine/rules", params={"id": rule_id}
        )

        if response.status_code == 404:
            response = await client.get(
                "/api/detection_engine/rules/_find", params={"rule_id": rule_id}
            )
            response.raise_for_status()
            data = response.json()
            if data.get("data"):
                rule_data = data["data"][0]
            else:
                raise ValueError(f"Rule not found with id or rule_id: {rule_id}")
        else:
            response.raise_for_status()
            rule_data = response.json()

    return rule_data


async def get_rule_info(rule_id: str) -> List[FieldWithType]:

    async with httpx.AsyncClient(
        base_url=kibana_conn_info["url"],
        auth=(kibana_conn_info["username"], kibana_conn_info["password"]),
        headers={
            "kbn-xsrf": "true",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        timeout=15.0,
        verify=False,
    ) as client:
        try:
            response = await client.get(f"/api/detection_engine/rules?id={rule_id}")
            response.raise_for_status()
            rule_data = response.json()

            if not rule_data:
                raise ValueError(f"No rule found with ID: {rule_id}")

            fields: List[FieldWithType] = []

            fields.extend(
                [
                    FieldWithType(key="id", value=rule_data.get("id", ""), type="text"),
                    FieldWithType(
                        key="name", value=rule_data.get("name", ""), type="text"
                    ),
                    FieldWithType(
                        key="description",
                        value=rule_data.get("description", ""),
                        type="text",
                    ),
                    FieldWithType(
                        key="risk_score",
                        value=float(rule_data.get("risk_score", 0)),
                        type="score",
                    ),
                    FieldWithType(
                        key="severity",
                        value=rule_data.get("severity", ""),
                        type="text",
                    ),
                    FieldWithType(
                        key="enabled",
                        value=rule_data.get("enabled", False),
                        type="bool",
                    ),
                    FieldWithType(
                        key="created_at",
                        value=datetime.fromisoformat(
                            rule_data.get(
                                "created_at", "1970-01-01T00:00:00.000Z"
                            ).replace("Z", "+00:00")
                        ),
                        type="date",
                    ),
                    FieldWithType(
                        key="updated_at",
                        value=datetime.fromisoformat(
                            rule_data.get(
                                "updated_at", "1970-01-01T00:00:00.000Z"
                            ).replace("Z", "+00:00")
                        ),
                        type="date",
                    ),
                    FieldWithType(
                        key="created_by",
                        value=rule_data.get("created_by", ""),
                        type="text",
                    ),
                    FieldWithType(
                        key="updated_by",
                        value=rule_data.get("updated_by", ""),
                        type="text",
                    ),
                    FieldWithType(
                        key="rule_id", value=rule_data.get("rule_id", ""), type="text"
                    ),
                    FieldWithType(
                        key="interval", value=rule_data.get("interval", ""), type="editable_text"
                    ),
                    FieldWithType(
                        key="from", value=rule_data.get("from", ""), type="text"
                    ),
                    FieldWithType(key="to", value=rule_data.get("to", ""), type="text"),
                    FieldWithType(
                        key="max_signals",
                        value=rule_data.get("max_signals", 0),
                        type="number",
                    ),
                    FieldWithType(
                        key="type", value=rule_data.get("type", ""), type="text"
                    ),
                    FieldWithType(
                        key="language", value=rule_data.get("language", ""), type="text"
                    ),
                    FieldWithType(
                        key="immutable",
                        value=rule_data.get("immutable", False),
                        type="bool",
                    ),
                    FieldWithType(
                        key="version", value=rule_data.get("version", 0), type="number"
                    ),
                    FieldWithType(
                        key="revision",
                        value=rule_data.get("revision", 0),
                        type="number",
                    ),
                    FieldWithType(
                        key="tags", value=rule_data.get("tags", []), type="labels"
                    ),
                    FieldWithType(
                        key="index", value=rule_data.get("index", []), type="labels"
                    ),
                    FieldWithType(
                        key="author", value=rule_data.get("author", []), type="labels"
                    ),
                    FieldWithType(
                        key="false_positives",
                        value=rule_data.get("false_positives", []),
                        type="labels",
                    ),
                    FieldWithType(
                        key="references",
                        value=", ".join(rule_data.get("references", [])),
                        type="text",
                    ),
                ]
            )

            # Query rule-specific fields
            if rule_data.get("type") == "query":
                fields.append(
                    FieldWithType(
                        key="query", value=rule_data.get("query", ""), type="text"
                    )
                )

            # Threat match rule-specific fields
            if rule_data.get("type") == "threat_match":
                fields.extend(
                    [
                        FieldWithType(
                            key="threat_query",
                            value=rule_data.get("threat_query", ""),
                            type="text",
                        ),
                        FieldWithType(
                            key="threat_index",
                            value=rule_data.get("threat_index", []),
                            type="labels",
                        ),
                        FieldWithType(
                            key="threat_language",
                            value=rule_data.get("threat_language", ""),
                            type="text",
                        ),
                        FieldWithType(
                            key="threat_indicator_path",
                            value=rule_data.get("threat_indicator_path", ""),
                            type="text",
                        ),
                        FieldWithType(
                            key="threat_mapping",
                            value=str(rule_data.get("threat_mapping", [])),
                            type="text",
                        ),  # Stringify complex object
                    ]
                )

            # Meta fields
            if "meta" in rule_data and rule_data["meta"].get("from"):
                fields.append(
                    FieldWithType(
                        key="meta.from",
                        value=rule_data["meta"].get("from", ""),
                        type="text",
                    )
                )

            if "execution_summary" in rule_data and rule_data["execution_summary"].get(
                "last_execution"
            ):
                last_execution = rule_data["execution_summary"]["last_execution"]
                fields.extend(
                    [
                        FieldWithType(
                            key="last_execution.date",
                            value=datetime.fromisoformat(
                                last_execution.get(
                                    "date", "1970-01-01T00:00:00.000Z"
                                ).replace("Z", "+00:00")
                            ),
                            type="date",
                        ),
                        FieldWithType(
                            key="last_execution.status",
                            value=last_execution.get("status", ""),
                            type="text",
                        ),
                        FieldWithType(
                            key="last_execution.status_order",
                            value=last_execution.get("status_order", 0),
                            type="number",
                        ),
                        FieldWithType(
                            key="last_execution.message",
                            value=last_execution.get("message", ""),
                            type="text",
                        ),
                        FieldWithType(
                            key="last_execution.metrics.total_search_duration_ms",
                            value=last_execution.get("metrics", {}).get(
                                "total_search_duration_ms", 0
                            ),
                            type="number",
                        ),
                    ]
                )

            return fields

        except httpx.HTTPStatusError as e:
            raise httpx.HTTPStatusError(
                f"Failed to fetch rule with ID {rule_id}: {e.response.status_code} {e.response.text}",
                request=e.request,
                response=e.response,
            )
        except Exception as e:
            raise Exception(f"Error fetching rule with ID {rule_id}: {str(e)}")


async def import_detection_rule(rule_ndjson_str: str) -> None:
    MAX_READY_RETRIES = 10
    MAX_IMPORT_RETRIES = 3
    RETRY_DELAY = 10  # seconds

    es = get_es()

    async with httpx.AsyncClient(
        base_url=kibana_conn_info["url"],
        auth=(kibana_conn_info["username"], kibana_conn_info["password"]),
        headers={"kbn-xsrf": "true"},
        timeout=15.0,
        verify=False,
    ) as client:

        ready_attempt = 0
        while ready_attempt < MAX_READY_RETRIES:
            ready_attempt += 1

            kibana_ready, kibana_reason = await is_kibana_ready()
            if not kibana_ready:
                print(
                    f"[Ready attempt {ready_attempt}/{MAX_READY_RETRIES}] Kibana not ready: {kibana_reason}"
                )
                await asyncio.sleep(RETRY_DELAY)
                continue

            es_ready, es_reason = await is_es_ready(es)
            if not es_ready:
                print(
                    f"[Ready attempt {ready_attempt}/{MAX_READY_RETRIES}] Elasticsearch not ready: {es_reason}"
                )
                await asyncio.sleep(RETRY_DELAY)
                continue

            print(f"Kibana and Elasticsearch ready after {ready_attempt} attempts")
            break
        else:
            raise RuntimeError(
                f"Kibana or Elasticsearch not ready after {MAX_READY_RETRIES} attempts"
            )

        import_attempt = 0
        while import_attempt < MAX_IMPORT_RETRIES:
            import_attempt += 1
            try:
                file_content = BytesIO(rule_ndjson_str.encode("utf-8"))
                filename = f"rules-batch-{uuid.uuid4()}.ndjson"
                files = {"file": (filename, file_content, "multipart/form-data")}

                response = await client.post(
                    "/api/detection_engine/rules/_import",
                    files=files,
                    params={"overwrite": False},
                )
                response.raise_for_status()
                print(f"Rule import succeeded on attempt {import_attempt}")
                return

            except httpx.HTTPStatusError as e:
                print(
                    f"[Import attempt {import_attempt}/{MAX_IMPORT_RETRIES}] Import failed: {e.response.status_code} {e.response.text}"
                )
                if import_attempt == MAX_IMPORT_RETRIES:
                    raise RuntimeError(
                        f"Rule import failed after {MAX_IMPORT_RETRIES} attempts"
                    )
                await asyncio.sleep(RETRY_DELAY)


async def delete_detection_rule_by_id(rule_id: str) -> httpx.Response:
    url = f"/api/alerting/rule/{rule_id}"
    response = await client.delete(url)
    response.raise_for_status()
    return response


async def delete_detection_rules_by_tag_bulk(rule_tag: str) -> httpx.Response:
    url = f"/api/detection_engine/rules/_bulk_action"
    data = {"action": "delete", "query": f'alert.attributes.tags:("{rule_tag}")'}
    params = {"dry_run": "false"}
    response = await client.post(url, json=data, params=params, timeout=600)
    response.raise_for_status()
    return response


async def delete_all_detection_rules_bulk() -> httpx.Response:
    url = f"/api/detection_engine/rules/_bulk_action"
    data = {"action": "delete", "query": ""}
    params = {"dry_run": "false"}
    response = await client.post(url, json=data, params=params, timeout=600)
    response.raise_for_status()
    return response


async def enable_detection_rule_by_rule_id(rule_id: str) -> httpx.Response:
    url = f"/api/alerting/rule/{rule_id}/_enable"
    response = await client.post(url)
    response.raise_for_status()
    return response


async def disable_detection_rule_by_rule_id(rule_id: str) -> httpx.Response:
    url = f"/api/alerting/rule/{rule_id}/_disable"
    response = await client.post(url, json={"untrack": True})
    response.raise_for_status()
    return response


async def change_rule_interval_by_id(id: str, interval: str) -> httpx.Response:
    url = f"/api/detection_engine/rules"
    response = await client.patch(url, json={"interval": interval, "id": id})
    response.raise_for_status()
    return response


async def get_rules_by_tag(tag: str) -> List[Tuple[str, str, str]]:
    params = {
        "page": 1,
        "per_page": 1000,
        "sort_field": "enabled",
        "sort_order": "desc",
        "filter": f'alert.attributes.tags:("{tag}")',
    }
    response = await client.get("/api/detection_engine/rules/_find", params=params)
    response.raise_for_status()
    all_rules = response.json().get("data", [])
    return [
        (rule["id"], rule["name"], rule["description"])
        for rule in all_rules
        if tag in rule.get("tags", [])
    ]


async def manually_run_rule(
    rule_id: str, start_datetime: str, end_datetime: str
) -> httpx.Response:
    url = "/internal/alerting/rules/backfill/_schedule"
    data = [{"rule_id": rule_id, "start": start_datetime, "end": end_datetime}]
    response = await client.post(url, json=data)
    response.raise_for_status()
    return response


async def get_all_manual_rules():
    pass


async def get_all_rules(renew_cache: bool = False) -> List[Dict]:
    """
    Fetches all detection rules from elastic through Kibana's API.
    """

    if (not renew_cache) and (
        cached_value := await redis_get(key="raw_rules", model=RawRules, prefix="rule")
    ):
        return cached_value.root

    try:
        json_responses: List[Dict] = []
        per_page = 500
        endpoint = (
            kibana_conn_info["url"]
            + f"/api/detection_engine/rules/_find?per_page={per_page}"
        )
        auth_header = httpx.BasicAuth(
            kibana_conn_info["username"], kibana_conn_info["password"]
        )

        client = httpx.AsyncClient()

        # Doing the first request
        initial_response = await client.get(endpoint, auth=auth_header)
        initial_response.raise_for_status()
        json_responses.append(initial_response.json())

        total_rules = json_responses[0]["total"]
        num_requests = total_rules // per_page

        # Sending the requests and collecting all the responses
        tasks = []
        for i in range(num_requests):
            endpoint = (
                kibana_conn_info["url"]
                + f"/api/detection_engine/rules/_find?per_page={per_page}&page={2 + i}"
            )

            request_task = asyncio.create_task(client.get(endpoint, auth=auth_header))
            tasks.append(request_task)

        task_results = await asyncio.gather(*tasks)
        for task_result in task_results:
            task_result.raise_for_status()
            json_responses.append(task_result.json())
        await client.aclose()

    except httpx.HTTPStatusError as e:
        logger.error(f"Failed to fetch rules. Error: {e}")
        raise e

    await redis_set(key="raw_rules", obj=RawRules(json_responses), prefix="rule")

    return json_responses


async def get_all_rule_tags():
    endpoint = kibana_conn_info["url"] + f"/api/detection_engine/tags"
    auth_header = httpx.BasicAuth(
        kibana_conn_info["username"], kibana_conn_info["password"]
    )

    client = httpx.AsyncClient()

    response = await client.get(endpoint, auth=auth_header)
    response.raise_for_status()
    return response.json()
