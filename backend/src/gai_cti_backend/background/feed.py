import asyncio
import json
from difflib import SequenceMatcher
from typing import Dict, List

from ..background.celery_worker import celery_task
from ..models.feed import (
    AllConnectorObjects,
    Connector,
    ConnectorDirNameToConnectorName,
    OrganizationToConnectorMapCache,
    TopDashboardCache,
)
from ..models.visual import HeatmapDataPoint, HeatmapDataRow
from ..opencti.feed import (
    get_all_external_connectors_and_feeds,
    get_all_feeds_organization_id,
    get_indicators_timeseries_for_a_feed,
)
from ..utils.feed import connector_dir2connector_name, free_connectors_list
from ..utils.miscellaneous import get_valid_path
from ..utils.redis import redis_get, redis_set


async def update_feed_dashboard_async():
    ioc_timeseries_per_feed_pre_filter = {
        name: await get_indicators_timeseries_for_a_feed(id)
        for name, id in (await get_all_feeds_organization_id()).items()
    }

    ioc_timeseries_per_feed = {
        k: v
        for k, v in ioc_timeseries_per_feed_pre_filter.items()
        if sum(v.values()) > 0
    }

    ioc_count_per_feed_data: List[Dict[str, str | int | float]] = [
        {"feed": feed, "count": sum(data.values())}
        for feed, data in ioc_timeseries_per_feed.items()
    ]

    ioc_count_over_time_per_feed_data: list[HeatmapDataRow] = [
        HeatmapDataRow(
            id=feed,
            data=[HeatmapDataPoint(x=day, y=count) for day, count in data.items()],
        )
        for feed, data in ioc_timeseries_per_feed.items()
        if sum(data.values()) > 0
    ]

    top_dashboard = TopDashboardCache(
        ioc_count_over_time_per_feed_data=ioc_count_over_time_per_feed_data,
        ioc_count_per_feed_data=ioc_count_per_feed_data,
    )

    await redis_set(prefix="feed", key="top_dashboard", obj=top_dashboard)


async def update_map_organizations2connectors_async():
    connectors, organizations = await get_all_external_connectors_and_feeds()
    mapped = []
    connector_name2connector_dir_name = {
        value: key for key, value in connector_dir2connector_name.items()
    }

    connector_dict = {
        con["name"].lower(): {
            **con,
            "is_free": (
                True
                if connector_name2connector_dir_name[con["name"]]
                in free_connectors_list
                else False
            ),
        }
        for con in connectors
    }

    for organization in organizations:
        org_name_lower = organization["name"].lower()
        best_match = None
        best_ratio = 0.0

        for conn_name_lower, connector in connector_dict.items():
            # Simple substring check
            if (org_name_lower in conn_name_lower) or (
                conn_name_lower in org_name_lower
            ):
                mapped.append(
                    {
                        "organization": organization,
                        "connector": connector,
                        "is_booting": False,
                    }
                )
                connector_dict.pop(conn_name_lower)
                break  # Assume one-to-one; stop after first match

            else:
                ratio = SequenceMatcher(None, conn_name_lower, org_name_lower).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_match = connector

        if best_match and best_ratio > 0.35:
            connector_dict.pop(best_match["name"].lower())
            mapped.append(
                {
                    "organization": organization,
                    "connector": best_match,
                    "is_booting": False,
                }
            )

    if connector_dict:
        for connector_name in connector_dict:
            mock_organization_data = {
                **connector_dict[connector_name],
                "confidence": -1,
                "x_opencti_reliability": None,
            }
            mapped.append(
                {
                    "organization": mock_organization_data,
                    "connector": connector_dict[connector_name],
                    "is_booting": True,
                }
            )

    await redis_set(
        key="organizations2connectors",
        prefix="feed",
        obj=OrganizationToConnectorMapCache(maps=mapped),
    )

    return mapped


async def set_connectors_dir_name2connector_name_async():
    CON_DIR_TO_CON_NAME = connector_dir2connector_name

    await redis_set(
        key="connector_dir_name_to_connector_name",
        prefix="feed",
        obj=ConnectorDirNameToConnectorName(CON_DIR_TO_CON_NAME),
    )


async def set_connectors_with_cached_async() -> None:
    result: List[Connector] = []
    connector_dir2connector_name = (
        await redis_get(
            key="connector_dir_name_to_connector_name",
            prefix="feed",
            model=ConnectorDirNameToConnectorName,
        )
    ).root

    defaults = set(("alienvault", "threatfox", "abuseipdb-ipblacklist"))
    free_list = free_connectors_list

    for connector_dir_name, connector_name in connector_dir2connector_name.items():
        free = True if connector_dir_name in free_list else False
        default = True if connector_dir_name in defaults else False
        result.append(
            Connector(
                key=connector_dir_name,
                title=connector_name,
                default=default,
                is_free=free,
            )
        )

    await redis_set(
        prefix="feed",
        key="all_connector_objects",
        obj=AllConnectorObjects(result),
    )


@celery_task()
def update_feed_dashboard():
    asyncio.run(update_feed_dashboard_async())


@celery_task()
def update_map_organizations2connectors():
    asyncio.run(update_map_organizations2connectors_async())


@celery_task()
def set_connectors_dir_name2connector_name():
    asyncio.run(set_connectors_dir_name2connector_name_async())


@celery_task()
def set_connectors_with_cached():
    asyncio.run(set_connectors_with_cached_async())
