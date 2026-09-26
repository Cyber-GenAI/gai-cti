from typing import Any, Dict, List

from ...models.management import InjectedIOCsCache
from ...utils import redis_set

collected_ioc_data: Dict[str, List[Any]] = {"domains": [], "ips": [], "urls": []}


def clear_collected_ioc_data():
    global collected_ioc_data
    collected_ioc_data = {"domains": [], "ips": [], "urls": []}


def add_to_collected_ioc_data(ioc_type, value_to_inject):
    global collected_ioc_data

    if ioc_type in collected_ioc_data:
        collected_ioc_data[ioc_type].append(value_to_inject)
    else:
        # Fallback to domains if category is not recognized
        collected_ioc_data["domains"].append(value_to_inject)


def get_collected_ioc_data() -> Dict[str, List[Any]]:
    global collected_ioc_data
    return {
        "domains": collected_ioc_data["domains"],
        "ips": collected_ioc_data["ips"],
        "urls": collected_ioc_data["urls"],
    }


def is_limit_exceeded(ioc_type):
    return len(collected_ioc_data[ioc_type]) > 10


async def sync_with_redis(index_pattern: str):
    global collected_ioc_data
    index_pattern = index_pattern.replace("*", "STAR")
    final_collected_data = get_collected_ioc_data()
    injected_iocs_obj = InjectedIOCsCache(
        ips=final_collected_data["ips"],
        domains=final_collected_data["domains"],
        urls=final_collected_data["urls"],
    )
    await redis_set(
        prefix="mng:injected-iocs", key=index_pattern, obj=injected_iocs_obj
    )
