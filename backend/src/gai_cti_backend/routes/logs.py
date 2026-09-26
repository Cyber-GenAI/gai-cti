import asyncio
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from elasticsearch8 import AsyncElasticsearch, NotFoundError
from fastapi import APIRouter

from ..elastic_client.index import get_all_indices, get_total_count_of_index
from ..elastic_client.utils import get_es
from ..llm_agent.analysis_log.graph import build_log_graph_and_run
from ..models.log import IndexPattern
from ..models.utils import AIAssistantBox, FieldWithType
from ..models.visual import (
    CalenderHeatmapValue,
    CalenderHeatmapVisual,
    RangeBarValue,
    RangeBarVisual,
    VisualResponse,
)
from ..utils.redis import redis_set

logs_router = APIRouter()

PROJECT_ROOT = Path(__file__).resolve().parents[3]
INFO_PATH = "artifacts/logs/info.json"
with open(PROJECT_ROOT / INFO_PATH, "r") as f:
    INFO = json.load(f)


name2index_pattern = {info["title"]: info["index_pattern"] for info in INFO}
name2index_pattern["TI"] = "opencti-indicators-*"


async def is_index_exists(candidates: List[IndexPattern]) -> List[bool]:
    es = get_es()
    coroutines = [
        es.indices.exists(index=candidate.pattern, expand_wildcards="all")
        for candidate in candidates
    ]
    return [response.body for response in await asyncio.gather(*coroutines)]


@logs_router.get("/index-patterns", response_model=List[IndexPattern])
async def get_index_pattern():
    candidates = [
        IndexPattern(
            name="TI",
            description="Threat Intelligence index pattern",
            pattern="opencti-indicators-*",
            total_count=await get_total_count_of_index("opencti-indicators-*"),
        )
    ]
    for info in INFO:
        index_pattern = IndexPattern(
            name=info["title"],
            description=info["description"],
            pattern=info["index_pattern"],
            total_count=await get_total_count_of_index(info["index_pattern"]),
        )
        candidates.append(index_pattern)

    exists = await is_index_exists(candidates)
    log_indexes = [
        candidate
        for candidate, exist in zip(candidates, exists)
        if exist and candidate.total_count > 0
    ]

    all_indices = await get_all_indices()
    manual_logs = [index for index in all_indices if index.startswith("log-manual-")]

    for manual_log in manual_logs:
        log_indexes.append(
            IndexPattern(
                name=f"{"Manual"} {manual_log.replace("log-manual-", "").replace("-", " ").title()} {"Log"}",
                description=f"Manual log index pattern for {manual_log}",
                pattern=manual_log,
                total_count=await get_total_count_of_index(manual_log),
            )
        )

    return log_indexes


async def get_formatted_logs(index_pattern: str) -> Dict[str, Any]:
    """
    Extract logs from Elasticsearch for a given index pattern
    and return them in the required log format.
    """
    es = get_es()
    try:
        response = await es.search(
            index=index_pattern, body={"query": {"match_all": {}}, "size": 1}
        )

        for hit in response["hits"]["hits"]:
            source = hit["_source"]

            log_entry = {
                "agent": source.get("agent", {}),
                "@timestamp": source.get(
                    "@timestamp", datetime.utcnow().isoformat() + "Z"
                ),
                "ecs": source.get("ecs", {}),
                "host": source.get("host", {}),
                "destination": source.get("destination", {}),
                "source": source.get("source", {}),
                "type": source.get("type", "flow"),
                "event": source.get("event", {}),
                "flow": source.get("flow", {}),
                "network": source.get("network", {}),
            }

    except Exception as e:
        print(f"Error extracting logs: {e}")

    await es.close()

    return log_entry


async def calculate_range_bar_value(
    index_pattern: str,
    name: str,
    es: AsyncElasticsearch,
) -> Optional[RangeBarValue]:
    try:
        if index_pattern.startswith("open"):
            field = "threatintel.opencti.created_at"
        else:
            field = "@timestamp"
        query = {
            "size": 0,
            "aggs": {
                "max_day": {"max": {"field": field}},
                "min_day": {"min": {"field": field}},
            },
        }
        response = await es.search(index=index_pattern, body=query)
        if response["hits"]["total"]["value"] == 0:
            return None

        return RangeBarValue(
            min=response["aggregations"]["min_day"]["value"],
            max=response["aggregations"]["max_day"]["value"],
            name=name,
        )
    except NotFoundError:
        return None


@logs_router.get("/top-dashboard", response_model=Dict[str, VisualResponse])
async def get_top_dashboard() -> Dict[str, VisualResponse]:

    es = get_es()
    coroutines = [
        calculate_range_bar_value(info["index_pattern"], info["title"], es)
        for info in INFO
    ]
    coroutines.insert(0, calculate_range_bar_value("opencti-indicators-*", "TI", es))

    visuals = {
        "index-time-distribution": RangeBarVisual(
            title="Distribution of Indexes Over Time",
            description="",
            value=[
                item for item in await asyncio.gather(*coroutines) if item is not None
            ],
        )
    }

    return {
        k: VisualResponse(
            type=v.__class__.__name__,  # pyright: ignore[reportArgumentType]
            data=v,
        )
        for k, v in visuals.items()
    }


@logs_router.get(
    "/index-dashboard/{index_pattern}", response_model=Dict[str, VisualResponse]
)
async def get_dashboard_of_index(index_pattern: str) -> Dict[str, VisualResponse]:
    es = get_es()
    if index_pattern.startswith("open"):
        field = "threatintel.opencti.created_at"
    else:
        field = "@timestamp"
    query = {
        "size": 0,
        "aggs": {
            "docs_per_day": {
                "date_histogram": {
                    "field": field,
                    "calendar_interval": "day",
                    "format": "yyyy-MM-dd",
                    "min_doc_count": 0,
                }
            }
        },
    }
    response = await es.search(index=index_pattern, body=query)

    await es.close()

    visuals = {
        "calender": CalenderHeatmapVisual(
            title="Log count per day",
            description="",
            value=[
                CalenderHeatmapValue(day=item["key_as_string"], value=item["doc_count"])
                for item in response["aggregations"]["docs_per_day"]["buckets"]
            ],
        )
    }

    return {
        k: VisualResponse(
            type=v.__class__.__name__,  # pyright: ignore[reportArgumentType]
            data=v,
        )
        for k, v in visuals.items()
    }


@logs_router.get("/explain/{index_pattern}/{id}", response_model=Tuple[AIAssistantBox])
async def explain_a_log(
    id: str,
    index_pattern: str,
) -> Tuple[AIAssistantBox]:

    llm_result = await build_log_graph_and_run(index_pattern=index_pattern, log_id=id)

    return (AIAssistantBox(title="Explanation", value=llm_result["explanation"]),)


@logs_router.get("/show/{index_pattern}/{id}", response_model=List[FieldWithType])
async def get_raw_log(
    id: str,
    index_pattern: str,
) -> List[FieldWithType]:
    # use es search api
    es = get_es()
    response = await es.search(
        index=index_pattern, body={"query": {"term": {"_id": id}}, "size": 1}
    )
    await es.close()

    return [
        FieldWithType(
            key=None,
            value=f"```json\n{json.dumps(hit, indent=2)}\n```",
            type="text",
        )
        for hit in response["hits"]["hits"]
    ]
