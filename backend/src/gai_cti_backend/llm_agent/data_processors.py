import asyncio
from datetime import datetime
from typing import Any, Dict, List, cast

from ..elastic_client.alert import make_an_alert_concise
from ..elastic_client.rule import get_rule_info
from ..elastic_client.utils import get_es
from ..models.adversary import IoCRow
from ..models.rule import Rule
from ..routes import adversary as adv
from ..routes.logs import get_dashboard_of_index, get_index_pattern, get_top_dashboard


def get_text_for_llm_from_area_or_bar_visual(
    data: List[Dict[str, str | int | float]],
    x_accessor: str = "timestamp",
    y_accessor: str = "count",
    is_x_ts: bool = True,
    filter_y_when_is_not: str | int | float | None = 0,
) -> str:

    result = []
    for item in data:
        x = item[x_accessor]
        y = item[y_accessor]

        if (filter_y_when_is_not is not None) and (filter_y_when_is_not == y):
            continue
        if is_x_ts:
            x_ts = cast(float, x)
            date = datetime.fromtimestamp(x_ts / 1000)
            x = date.strftime("%d-%b-%Y")

        res = f"{x}:{y}"
        result.append(res)

    return ", ".join(result)


async def get_rule_text_for_llm_by_id(rule_id: str) -> Dict[str, str]:
    rule = await get_rule_info(rule_id)

    rule_text = ""
    for item in rule:
        k = item.key
        v = str(item.value)
        rule_text += f"{k}: {v}\n"

    return {"rule_text": rule_text}


def get_rule_text_for_llm_from_obj(rule_obj: Rule) -> Dict[str, str]:
    rule_text = ""
    rule_dict = {
        "id": rule_obj.id,
        "name": rule_obj.name,
        "type": rule_obj.type,
        "tags": rule_obj.tags,
    }

    for k, v in rule_dict.items():
        rule_text += f"{k}: {v}\n"

    return {"rule_text": rule_text}


def get_ioc_info_for_llm_by_ioc_row_obj(ioc: IoCRow):
    ioc_text = ""
    ioc_dict = {
        "value": ioc.value,
        "is_detected": ioc.is_detected,
    }

    for k, v in ioc_dict.items():
        ioc_text += f"{k}: {v}\n"

    return {"ioc_text": ioc_text}


# TODO: use cache to make it faster
async def get_alert_info_for_llm_by_raw_alert(
    raw_alert: Dict[str, Any],
    id: str,
) -> Dict[str, str]:
    es = get_es()

    raw_alert["_id"] = id
    concise = await make_an_alert_concise(raw_alert)

    # TODO: use cache to make it faster
    rule = await get_rule_info(concise.rule_id)
    ti = concise.matched_ioc

    ti_text = ""
    for key, value in ti.items():
        k = key
        v = str(value)
        ti_text += f"{k}: {v}\n"

    rule_text = ""
    for item in rule:
        k = item.key
        v = str(item.value)
        rule_text += f"{k}: {v}\n"

    tasks = [
        es.get(index=idx, id=log_id)  # TODO: use cache to make it faster
        for idx, log_id in zip(concise.log_indenes, concise.log_ids)
    ]
    logs_text = str([l["_source"] for l in (await asyncio.gather(*tasks))])

    await es.close()

    return {"rule_text": rule_text, "logs_text": logs_text, "ti_text": ti_text}


async def get_alert_info_for_llm_by_id(alert_id: str) -> Dict[str, str]:
    es = get_es()

    query_body = {"query": {"ids": {"values": [alert_id]}}}

    response = await es.search(
        index=".internal.alerts-security.alerts-default*", body=query_body
    )
    hits = response["hits"]["hits"]

    if not hits:
        raise KeyError(f"Alert with ID '{alert_id}' not found.")

    alert = hits[0]["_source"]
    alert["_id"] = hits[0]["_id"]

    return await get_alert_info_for_llm_by_raw_alert(raw_alert=alert, id=alert["_id"])


async def get_index_patterns_info_for_llm():
    index_patterns = await get_index_pattern()

    index_patterns_texts = []
    counter = 1
    for index_pattern in index_patterns:
        index_pattern_text = f"{counter}. "
        for item in index_pattern:
            k = item[0]
            v = str(item[1])
            index_pattern_text += f"{k}: {v}\n"
        counter += 1

        index_patterns_texts.append(index_pattern_text)

    index_patterns_data = "\n".join(index_patterns_texts)

    return index_patterns_data


async def get_calender_heatmap_log_text_for_llm(index_pattern: str):
    calender_heatmap = (await get_dashboard_of_index(index_pattern))[
        "calender"
    ].data.value

    calender_heatmap_data = []

    for item in calender_heatmap:
        day = item.day
        value = item.value
        calender_heatmap_data.append(f"{day}: {value}")

    calender_heatmap_text = ", ".join(calender_heatmap_data)

    return calender_heatmap_text


async def get_index_time_distribution__text_for_llm():
    top_dashboard_time_dist = (await get_top_dashboard())[
        "index-time-distribution"
    ].data.value

    time_dis_data = []

    for item in top_dashboard_time_dist:
        min_time = datetime.fromtimestamp(item.min / 1000).strftime("%d-%b-%Y")
        max_time = datetime.fromtimestamp(item.max / 1000).strftime("%d-%b-%Y")
        name = item.name

        time_dis_data.append(f"{name}: From {min_time} to {max_time}")

    time_dis_text = ", ".join(time_dis_data)

    return time_dis_text


async def get_all_apt():
    try:
        adv_data = await adv.get_adversaries()
        all_APT_data = []

        for apt in adv_data:
            apt = apt.model_dump()

            APT = {
                "APT_id": apt["id"],
                "APT_name": apt["name"],
                "APT_sources": apt["sources"],
                "APT_is_important": apt["is_important"],
                "APT_confidence": apt["confidence"],
            }

            all_APT_data.append(str(APT))

        return ", ".join(all_APT_data)

    except Exception as e:
        raise RuntimeError(f"Retrieving all Adversaries Failed. Error: {e}")


def process_ti_response(ti_table) -> Dict[str, Any]:
    """
    Process TITable response into a summarized dictionary format.

    Args:
        ti_table: TITable object with rows and columns

    Returns:
        Dictionary with summarized threat intelligence data
    """
    processed_data = {
        "summary": {
            "total_indicators": ti_table.total,
            "returned_count": len(ti_table.rows),
            "filterable": ti_table.filterable,
        },
        "indicators": [],
    }

    for row in ti_table.rows:
        indicator = {
            "id": row.id,
            "name": row.name,
            "feed_source": row.feed_source,
            "type": row.type,
            "creation_time": (
                row.creation_time.isoformat() if row.creation_time else None
            ),
            "score": row.score,
            "confidence_score": row.confidence_score,
            "reliability": row.reliability,
            "labels": row.labels if row.labels else [],
        }
        processed_data["indicators"].append(indicator)

    return processed_data
