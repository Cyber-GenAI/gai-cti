import asyncio
import json
from datetime import datetime
from typing import Dict, List, Tuple

from dateutil import parser
from fastapi import APIRouter

from ..elastic_client.alert import extract_rule_and_log_ids
from ..elastic_client.rule import get_rule_info
from ..elastic_client.utils import get_es
from ..llm_agent.analysis_alert.graph import build_alert_graph_and_run
from ..models.alert import Alert
from ..models.log import LogRow, LogTable
from ..models.utils import AIAssistantBox, Column, FieldWithType
from ..models.visual import PointInMap
from ..utils import get_location_of_ip
from ..utils.alert import get_alert_ti_info
from ..utils.miscellaneous import is_ipv4

alert_router = APIRouter()


async def get_log_rows(log_indices: List[str], log_ids: List[str]) -> List[LogRow]:
    es = get_es()

    tasks = [es.get(index=idx, id=log_id) for idx, log_id in zip(log_indices, log_ids)]
    results = await asyncio.gather(*tasks)

    return [
        LogRow(
            id=str(idx),
            timestamp=datetime.strptime(
                hit["_source"]["@timestamp"], "%Y-%m-%dT%H:%M:%S%z"
            ),
            source=json.dumps(hit["_source"]),
        )
        for idx, hit in enumerate(results)
    ]


@alert_router.get("/{id}", response_model=Alert)
async def get_alert_info(id: str):
    rule_id, log_indices, log_ids = await extract_rule_and_log_ids(id)
    if ti_data := await get_alert_ti_info(id):

        indicator_types = ti_data.get("indicator_types", []) or []
        indicator_types = (
            indicator_types if isinstance(indicator_types, list) else [indicator_types]
        )

        if is_ipv4(ti_data.get("name", "")):
            try:
                loc_info = await get_location_of_ip(ti_data.get("name", ""))
                map = [
                    PointInMap(
                        latitude=loc_info.lat,
                        longitude=loc_info.long,
                        label=f"{loc_info.country} / {loc_info.city}",
                        description=ti_data.get("name", ""),
                    )
                ]
            except Exception as e:
                print(f"ERROR: failed to get location of a ip, reason: {str(e)}")
                map = [
                    PointInMap(
                        latitude=0,
                        longitude=0,
                        label="Failed to get location of a ip.",
                    )
                ]
        else:
            map = [
                PointInMap(
                    latitude=0,
                    longitude=0,
                    label="Location is not available for this type of IoC.",
                )
            ]
        ti = [
            FieldWithType(key="id", value=ti_data.get("id", ""), type="text"),
            FieldWithType(key="name", value=ti_data.get("name", ""), type="text"),
            FieldWithType(
                key="indicator_pattern",
                value=ti_data.get("indicator_pattern", ""),
                type="text",
            ),
            FieldWithType(
                key="confidence_level",
                value=int(ti_data.get("confidence_level", 0)),
                type="number",
            ),
            FieldWithType(
                key="is_revoked",
                value=bool(ti_data.get("is_revoked") or False),
                type="bool",
            ),
            FieldWithType(
                key="created_at",
                value=datetime.fromisoformat(
                    ti_data.get("created_at", "1970-01-01T00:00:00.000Z").replace(
                        "Z", "+00:00"
                    )
                ),
                type="date",
            ),
            FieldWithType(
                key="x_opencti_score",
                value=int(ti_data.get("x_opencti_score", 0)),
                type="score",
            ),
            FieldWithType(
                key="indicator_types",
                value=",".join(indicator_types),
                type="text",
            ),
            FieldWithType(
                key="valid_until",
                value=datetime.fromisoformat(
                    ti_data.get("valid_until", "1970-01-01T00:00:00.000Z").replace(
                        "Z", "+00:00"
                    )
                ),
                type="date",
            ),
            FieldWithType(
                key="objectLabel", value=ti_data.get("objectLabel") or [], type="labels"
            ),
            FieldWithType(
                key="platforms", value=ti_data.get("platforms", "") or "", type="text"
            ),
            FieldWithType(
                key="description",
                value=ti_data.get("description", "") or "",
                type="text",
            ),
            FieldWithType(
                key="kill_chain_phases",
                value=ti_data.get("kill_chain_phases") or [],
                type="labels",
            ),
            FieldWithType(
                key="reliability_of_author",
                value=ti_data.get("reliability_of_author", "") or "",
                type="text",
            ),
            FieldWithType(
                key="author", value=ti_data.get("author", "") or "", type="text"
            ),
            FieldWithType(
                key="external_references",
                value=(
                    [
                        external_reference["url"]
                        for external_reference in ti_data.get("external_references", [])
                    ]
                ),
                type="labels",
            ),
        ]
    else:
        ti = []
        map = []

    alert = Alert(
        ai_assistant=(
            AIAssistantBox(title="Summary", value="moved..."),
            AIAssistantBox(title="Recommendation", value="moved..."),
            AIAssistantBox(title="Confidence", value="moved..."),
        ),
        rule=await get_rule_info(rule_id),
        logs=LogTable(
            rows=await get_log_rows(log_indices, log_ids),
            columns={
                "id": Column(name="id", type="text"),
                "timestamp": Column(name="timestamp", type="date"),
                "source": Column(name="source", type="json"),
            },
            total=1,
        ),
        ti=ti,
        map=map,
        show_ti=len(ti) > 0,
    )

    # TODO: if alert is related to IoC, `map` part
    return alert


@alert_router.get(
    "/explain/{id}",
    response_model=Tuple[AIAssistantBox, AIAssistantBox, AIAssistantBox],
)
async def explain_an_alert(
    id: str,
) -> Tuple[AIAssistantBox, AIAssistantBox, AIAssistantBox]:
    llm_result = await build_alert_graph_and_run(alert_id=id)

    return (
        AIAssistantBox(title="Summary", value=llm_result["summary"]),
        AIAssistantBox(title="Recommendation", value=llm_result["recommendation"]),
        AIAssistantBox(title="Confidence", value=llm_result["confidence"]),
    )
