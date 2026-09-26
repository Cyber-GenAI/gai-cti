from datetime import datetime
from statistics import mean
from typing import List

from ..models.adversary import AdversaryDetectionResults
from ..models.home import (
    AlertsStatsCache,
    IntrusionSets2IoCCache,
    IntrusionSetsIoCInfo,
    LoginInfoCache,
    System,
    Top10AdversariesWithIoC,
)
from ..models.ti import TopDashboardCache
from ..models.utils import FieldWithType
from ..utils import redis_get
from ..utils.ti import get_adversary_specificity


async def get_system_statistics() -> List[FieldWithType]:
    if login_info := await redis_get(key="info", prefix="login", model=LoginInfoCache):
        last_login = login_info.last_login
    else:
        last_login = datetime.fromtimestamp(0)

    sys_raw_stat = await redis_get(key="system", prefix="home", model=System)
    uptime = datetime.now() - sys_raw_stat.start_time
    uptime_str = f"{uptime.days}d {uptime.seconds // 3600}h {(uptime.seconds // 60) % 60}m {uptime.seconds % 60}s"
    mem_5m = mean(sys_raw_stat.memory[-5:]) / 1024**3
    mem_60m = mean(sys_raw_stat.memory) / 1024**3
    mem_total = sys_raw_stat.total_memory / 1024**3
    cpu_5m = mean(sys_raw_stat.cpu[-5:])
    cpu_60m = mean(sys_raw_stat.cpu)
    return [
        FieldWithType(
            key="Uptime",
            value=uptime_str,
            type="text",
        ),
        FieldWithType(
            key="CPU Usage Last 5m",
            value=f"{cpu_5m:.1f}%",
            type="text",
        ),
        FieldWithType(
            key="Memory Usage Last 5m",
            value=f"{mem_5m:.1f} GB / {mem_total:.1f} GB",
            type="text",
        ),
        FieldWithType(
            key="CPU Usage Last Hour",
            value=f"{cpu_60m:.1f}%",
            type="text",
        ),
        FieldWithType(
            key="Memory Usage Last Hour",
            value=f"{mem_60m:.1f} GB / {mem_total:.1f} GB",
            type="text",
        ),
        FieldWithType(
            key="Last Login",
            value=last_login,
            type="date",
        ),
    ]


async def get_ti_statistics() -> List[FieldWithType]:
    top_dashboard = await redis_get(
        prefix="ti", key="top_dashboard", model=TopDashboardCache
    )
    assert top_dashboard is not None

    return [
        FieldWithType(
            key="Active Feed Sources",
            value=top_dashboard.active_feeds_count,
            type="text",
        ),
        FieldWithType(
            key="Number of Indicators",
            value=top_dashboard.indicator_count,
            type="text",
        ),
        FieldWithType(
            key="Number of Indicators Last 48h",
            value=top_dashboard.indicator_count_last_48h,
            type="text",
        ),
        FieldWithType(
            key="Number of Malware",
            value=top_dashboard.malware_count,
            type="text",
        ),
    ]


async def get_alert_statistics() -> List[FieldWithType]:
    alerts_stats = await redis_get(
        key="alerts_stats", prefix="home", model=AlertsStatsCache
    )
    assert alerts_stats is not None

    return [
        FieldWithType(
            key="New Alerts (24 h)",
            value=alerts_stats.last24,
            type="number",
        ),
        FieldWithType(
            key="Total Alerts",
            value=alerts_stats.total,
            type="number",
        ),
        FieldWithType(
            key="IoC based Alerts",
            value=alerts_stats.ioc_based,
            type="number",
        ),
        FieldWithType(
            key="Signature based Alerts",
            value=alerts_stats.sig_based,
            type="number",
        ),
    ]


async def get_adversary_statistics() -> List[FieldWithType]:
    adv_with_sig = len(await get_adversary_specificity())
    all_intrusions = await redis_get(
        key="intrusion2ioc",
        prefix="home:intrusion",
        model=IntrusionSets2IoCCache,
    )
    assert all_intrusions is not None
    adv_with_ioc = sum(
        [1 for obj in all_intrusions.data if len(obj.relational_iocs) > 0]
    )

    if ad_res := await redis_get(
        prefix="adv",
        key="adversary_detection_results",
        model=AdversaryDetectionResults,
    ):
        last_run = ad_res.creation_time
        detected_adversaries_count = ad_res.detected_adversaries_count

    else:
        last_run = datetime.fromtimestamp(0.0)

    return [
        FieldWithType(
            key="Total Tracked Adversaries",
            value=adv_with_ioc + adv_with_sig,
            type="number",
        ),
        FieldWithType(
            key="Tracked Adversaries with Indicators",
            value=adv_with_ioc,
            type="number",
        ),
        FieldWithType(
            key="Tracked Adversaries with Signatures",
            value=adv_with_sig,
            type="number",
        ),
        FieldWithType(
            key="Number of Detected Adversaries",
            value=detected_adversaries_count,
            type="number",
        ),
        FieldWithType(
            key="Last Signature based Analysis",
            value=last_run,
            type="date",
        ),
    ]


async def get_10_top_ioc_count_per_adversary() -> List[IntrusionSetsIoCInfo]:
    return (
        await redis_get(
            key="top_10_adversaries_with_ioc",
            prefix="home",
            model=Top10AdversariesWithIoC,
        )
    ).root
