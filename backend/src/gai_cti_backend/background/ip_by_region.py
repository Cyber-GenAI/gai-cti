import asyncio
from itertools import groupby
from logging import getLogger
from typing import Dict, List, Set, Union

from httpx import AsyncClient

from ..elastic_client.utils import get_es
from ..models.home import MapData
from ..models.visual import PointInMap
from ..utils import get_location_of_ips, redis_get, redis_set
from .celery_worker import celery_task

logger = getLogger(__name__)


def format_description(description: List, n: int) -> str:
    formatted_description = ", ".join(description[:n])
    if len(description) > n:
        formatted_description += ", ..."
    return formatted_description


async def get_all_malicious_ips() -> Set:
    """
    Fetch all malicious IPs from Elasticsearch.
    """

    es_client = get_es()
    size = 10000
    try:
        responses = []
        request_body = {
            "size": size,
            "_source": ["threatintel.indicator.ip"],
            "query": {"exists": {"field": "threatintel.indicator.ip"}},
        }
        response = await es_client.search(
            index="opencti-indicators*", scroll="1m", body=request_body
        )
        responses.append(response.body)
        remaining_requests = response["hits"]["total"]["value"] // size

        scroll_id = response["_scroll_id"]
        # making the remaining requests
        for _ in range(remaining_requests):
            request_body = {"scroll": "1m", "scroll_id": scroll_id}
            response = await es_client.scroll(body=request_body)
            scroll_id = response["_scroll_id"]
            responses.append(response.body)

        ips = set()
        for response in responses:
            for data in response["hits"]["hits"]:
                ips.add(data["_source"]["threatintel"]["indicator"]["ip"][0])
        return ips

    except Exception as e:
        logger.error(f"Failed to fetch malicious IPs. Error: {e}")
        raise e


async def group_ips_by_region(
    ips: Set[str],
) -> List[Dict[str, Union[List[str], str, float, int]]]:
    try:
        ips_by_region: List[Dict[str, Union[List[str], str, float, int]]] = []
        ips_list = list(ips)
        data = await get_location_of_ips(ips_list)
        for key, group in groupby(data, key=lambda x: next(iter(x.values())).state):
            ips_list = []
            lats = []
            longs = []
            country = ""
            for entry in group:
                ip = next(iter((entry.keys())))
                ips_list.append(ip)
                lats.append(entry[ip].lat)
                longs.append(entry[ip].long)

                if country == "":
                    country = entry[ip].country

            count = len(ips_list)
            ips_by_region.append(
                {
                    "region": key,
                    "country": country,
                    "ips": ips_list,
                    "average_lat": sum(lats) / len(lats),
                    "average_long": sum(longs) / len(longs),
                    "count": count,
                }
            )

        return ips_by_region

    except Exception as e:
        logger.warning(f"Failed to group ips by region: {e}")
        return []


async def update_map_data_async() -> MapData:
    ips = await get_all_malicious_ips()
    ips_by_region = await group_ips_by_region(ips)
    map_data_instance = MapData(
        data=[
            PointInMap(
                latitude=value["average_lat"],
                longitude=value["average_long"],
                label=f"{value['country']} ({len(value['ips'])})",
                size=value["count"],
                description=format_description(value["ips"], 10),
            )
            for value in ips_by_region
        ]
    )
    await redis_set(prefix="home", key="map_data", obj=map_data_instance)

    return map_data_instance


async def get_map_data() -> List[PointInMap]:
    if instance := await redis_get(prefix="home", key="map_data", model=MapData):
        return instance.data

    raise ValueError("No available data for map")


@celery_task(soft_time_limit=10_000, time_limit=10_005)
def update_map_data():
    asyncio.run(update_map_data_async())
