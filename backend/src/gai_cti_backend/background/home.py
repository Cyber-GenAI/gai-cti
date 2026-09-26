import asyncio
import heapq
from datetime import datetime
from typing import Any, Dict, List

import psutil

from ..elastic_client.alert import (
    get_alerts_count_by_tag,
    get_alerts_count_excluding_tag,
    get_last_24h_alerts_count,
    get_total_alerts_count,
)
from ..models.home import (
    AlertsStatsCache,
    IntrusionSets2IoCCache,
    IntrusionSetsIoCInfo,
    System,
    Top10AdversariesWithIoC,
)
from ..opencti.intrusion_sets import get_all_intrusion_sets_with_indicators
from ..utils import redis_get, redis_set
from .celery_worker import celery_task


async def add_to_list(value: float, lst: List[float]):
    if len(lst) < 60:
        return lst.append(value)
    lst.pop(0)
    lst.append(value)


async def system_stats_init_async():
    sys_stat = System(
        start_time=datetime.now(),
        memory=[(psutil.virtual_memory()).used],
        total_memory=(psutil.virtual_memory()).total,
        cpu=[psutil.cpu_percent(interval=None)],
    )
    await redis_set(key="system", obj=sys_stat, prefix="home")


async def system_stats_update_async():
    sys_raw_stat = await redis_get(key="system", prefix="home", model=System)
    await add_to_list((psutil.virtual_memory()).used, sys_raw_stat.memory)
    await add_to_list(psutil.cpu_percent(interval=None), sys_raw_stat.cpu)
    await redis_set(key="system", obj=sys_raw_stat, prefix="home")


async def get_alerts_stats_async():
    total = await get_total_alerts_count()
    last24 = await get_last_24h_alerts_count()
    ioc_alerts = await get_alerts_count_by_tag("Type: GAI_CTI_TI")
    sig_based = await get_alerts_count_excluding_tag("Type: GAI_CTI_TI")
    alerts_stats = AlertsStatsCache(
        total=total, last24=last24, ioc_based=ioc_alerts, sig_based=sig_based
    )
    await redis_set(key="alerts_stats", prefix="home", obj=alerts_stats)


async def update_ioc_count_by_intrusion_set_async():
    intrusion_sets_with_related_iocs = []
    has_next_page = True
    cursor = None
    while has_next_page:
        result = await get_all_intrusion_sets_with_indicators(cursor=cursor)
        if result["page_info"]["hasNextPage"]:
            has_next_page = True
            cursor = result["page_info"]["endCursor"]
        else:
            has_next_page = False
        intrusion_sets_with_related_iocs.extend(result["data"]["intrusions"])

    intrusion2ioc = []

    for intrusion_set in intrusion_sets_with_related_iocs:
        intrusion2ioc.append(
            IntrusionSetsIoCInfo(
                name=intrusion_set["name"],
                id=intrusion_set["id"],
                aliases=intrusion_set["aliases"] or [],
                relational_iocs=intrusion_set["relational_iocs"],
                x_opencti_score=intrusion_set.get("x_opencti_score", 0),
                indicator_type=intrusion_set.get("x_opencti_main_observable_type", ""),
                createdBy=intrusion_set.get("createdBy", {}).get(
                    "name", "Unknown Author"
                ),
            )
        )

    intrusion_set_cache = IntrusionSets2IoCCache(data=intrusion2ioc)

    await redis_set(
        key="intrusion2ioc",
        prefix="home:intrusion",
        obj=intrusion_set_cache,
    )


async def get_10_top_ioc_count_per_adversary_async():
    all_intrusions = await redis_get(
        key="intrusion2ioc",
        prefix="home:intrusion",
        model=IntrusionSets2IoCCache,
    )

    assert all_intrusions is not None

    intrusions_with_ioc = heapq.nlargest(
        n=10,
        iterable=all_intrusions.data,
        key=lambda x: len(x.relational_iocs),
    )

    await redis_set(
        key="top_10_adversaries_with_ioc",
        prefix="home",
        obj=Top10AdversariesWithIoC(intrusions_with_ioc),
    )


@celery_task(soft_time_limit=25_000, time_limit=25_005)
def update_ioc_count_by_intrusion():
    asyncio.run(update_ioc_count_by_intrusion_set_async())


@celery_task()
def get_alerts_stats():
    asyncio.run(get_alerts_stats_async())


@celery_task()
def system_stats_init():
    asyncio.run(system_stats_init_async())


@celery_task()
def system_stats_update():
    asyncio.run(system_stats_update_async())


@celery_task()
def get_10_top_ioc_count_per_adversary():
    asyncio.run(get_10_top_ioc_count_per_adversary_async())
