from collections import defaultdict
from datetime import datetime
from statistics import mean
from typing import Any, Dict, List

from ...models.utils import Timestamp
from ...models.visual import StackedBarValue
from ...opencti.indicator import get_indicators_with_risk_and_conf_bulk


def date_to_day(date_txt: str) -> Timestamp:
    date = datetime.fromisoformat(date_txt)
    return date.replace(hour=0, minute=0, second=0, microsecond=0).timestamp() * 1000


async def fetch_all_indicators_with_risk_and_conf() -> List[Dict[str, Any]]:
    indicator_to_risk_and_conf = []
    has_next_page = True
    cursor = None

    while has_next_page:
        result, page_info = await get_indicators_with_risk_and_conf_bulk(cursor=cursor)

        for item in result:
            node = item["node"]
            indicator_to_risk_and_conf.append(
                {
                    "day": date_to_day(node["created_at"]),
                    "risk": node["x_opencti_score"],
                    "confidence": node["confidence"],
                }
            )
        has_next_page = page_info["hasNextPage"]
        cursor = page_info["endCursor"] if has_next_page else None

    return indicator_to_risk_and_conf


def aggregate_indicators_by_day(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Aggregates indicators by 'day', computing the mean of 'risk' and 'confidence'.
    """
    grouped: Dict[float, Dict[str, List[float]]] = defaultdict(
        lambda: {"risk": [], "confidence": []}
    )

    # Group by day
    for item in data:
        day = item["day"]
        grouped[day]["risk"].append(item["risk"])
        grouped[day]["confidence"].append(item["confidence"])

    # Compute mean for each day
    aggregated = [
        {
            "day": day,
            "risk": mean(values["risk"]),
            "confidence": mean(values["confidence"]),
        }
        for day, values in grouped.items()
    ]

    # Sort by day (optional, ascending order)
    aggregated.sort(key=lambda x: x["day"])
    return aggregated


async def get_diverging_conf_risk_data() -> List[StackedBarValue]:
    data = await fetch_all_indicators_with_risk_and_conf()
    agg_data = aggregate_indicators_by_day(data)

    results = []
    for item in agg_data:
        results.append(
            StackedBarValue(
                x=item["day"],
                y=item["risk"],
                group="risk",
            )
        )
        results.append(
            StackedBarValue(
                x=item["day"],
                y=-item["confidence"],
                group="confidence",
            )
        )

    return results
