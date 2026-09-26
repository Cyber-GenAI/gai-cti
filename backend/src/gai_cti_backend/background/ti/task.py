import asyncio
from datetime import datetime
from typing import Any, Awaitable, Callable, TypeVar

from ...models.ti import (
    ImportantMalwareRow,
    IoCTypesCache,
    MapFeed2ID,
    TopDashboardCache,
)
from ...opencti.feed import get_all_external_connectors
from ...opencti.indicator import (
    get_all_indicator_types,
    get_timeseries_for_indicator_count,
)
from ...opencti.malware import get_top_malware_info, malware_last_ioc_date
from ...opencti.statistics import (
    get_indicator_count_by_type,
    number_of_indicators,
    number_of_last_48h_indicators,
    number_of_malware,
)
from ...utils import custom_int_format, redis_set
from ...utils.ti import NUMBER_TO_MONTH
from ..celery_worker import celery_task
from .malware_adv_graph import get_malware_adv_graph_data
from .malware_infos import get_processed_malware_infos
from .risk_and_conf import get_diverging_conf_risk_data
from .tag_co_occurrence import get_tag_co_occurrence_heatmap_data

T = TypeVar("T")
semaphore = asyncio.Semaphore(2)


async def limited(coro: Callable[..., Awaitable[T]], *args: Any, **kwargs: Any) -> T:
    async with semaphore:
        return await coro(*args, **kwargs)


async def update_ti_types_async():
    await redis_set(
        key="indicator_types",
        prefix="ti",
        obj=IoCTypesCache(await get_all_indicator_types()),
    )


async def update_ti_feeds_async():
    await redis_set(
        prefix="ti",
        key="feeds_name2id",
        obj=MapFeed2ID(
            {
                connector["name"]: connector["id"]
                for connector in (await get_all_external_connectors())
            }
        ),
    )


async def update_ti_top_dashboard_async() -> TopDashboardCache:
    indicator_types = await get_all_indicator_types()

    async with asyncio.TaskGroup() as task_group:
        indicators_task = task_group.create_task(limited(number_of_indicators))
        malware_task = task_group.create_task(limited(number_of_malware))
        all_feeds_task = task_group.create_task(limited(get_all_external_connectors))

        indicator_count_tasks = {
            key: task_group.create_task(limited(get_indicator_count_by_type, key))
            for key in indicator_types
        }

        indicator_count_last_48h = task_group.create_task(
            limited(number_of_last_48h_indicators)
        )

    active_feeds = [feed["name"] for feed in all_feeds_task.result() if feed["active"]]

    indicator_count = custom_int_format(indicators_task.result())
    indicator_count_last_48h = custom_int_format(indicator_count_last_48h.result())
    malware_count = custom_int_format(malware_task.result())
    active_feeds_count = custom_int_format(len(active_feeds))
    indicator_distribution = {
        key: task.result() for key, task in indicator_count_tasks.items()
    }

    important_malwares = [
        ImportantMalwareRow(
            **malware_info,
            last_ioc_date=await malware_last_ioc_date(malware_info["id"]),
        )
        for malware_info in await get_top_malware_info()
    ]
    malware_sources_pie_data, malware_info_parallel_coords_data = (
        await get_processed_malware_infos()
    )

    tag_co_occurrence = await get_tag_co_occurrence_heatmap_data()

    indicator_count_timeseries = await get_timeseries_for_indicator_count()

    diverging_conf_risk_data = await get_diverging_conf_risk_data()

    malware_adv_graph_data = await get_malware_adv_graph_data()

    top_dashboard = TopDashboardCache(
        last_updated=datetime.now(),
        important_malwares=important_malwares,
        indicator_count=indicator_count,
        malware_count=malware_count,
        active_feeds_count=active_feeds_count,
        indicator_count_last_48h=indicator_count_last_48h,
        indicator_distribution=indicator_distribution,
        tag_co_occurrence=tag_co_occurrence,
        indicator_count_timeseries=indicator_count_timeseries,
        diverging_conf_risk_data=diverging_conf_risk_data,
        malware_adv_graph_data=malware_adv_graph_data,
        malware_sources_pie_data=malware_sources_pie_data,
        malware_info_parallel_coords_data=malware_info_parallel_coords_data,
    )

    await redis_set(prefix="ti", key="top_dashboard", obj=top_dashboard)

    return top_dashboard


@celery_task()
def update_ti_types():
    asyncio.run(update_ti_types_async())


@celery_task()
def update_ti_feeds():
    asyncio.run(update_ti_feeds_async())


@celery_task(soft_time_limit=10_000, time_limit=10_005)
def update_ti_top_dashboard():
    asyncio.run(update_ti_top_dashboard_async())
