import asyncio

from fastapi import APIRouter

from .. import background as bg
from ..models.home import Home, Statistics
from ..models.visual import (
    BarValue,
    BarVisual,
    MapVisual,
    PieSlice,
    PieVisual,
    TreeMapSlice,
    TreeMapVisual,
    VisualResponse,
)
from ..opencti.labels import get_most_active_labels
from ..opencti.malware import get_most_active_malwares
from ..utils.home import (
    get_10_top_ioc_count_per_adversary,
    get_adversary_statistics,
    get_alert_statistics,
    get_system_statistics,
    get_ti_statistics,
)

home_router = APIRouter()


@home_router.get("/", response_model=Home)
async def get_home() -> Home:
    async with asyncio.TaskGroup() as tg:
        most_active_malwares = tg.create_task(get_most_active_malwares())
        the_10_top_ioc_count_per_adversary = tg.create_task(
            get_10_top_ioc_count_per_adversary()
        )
        map_data = tg.create_task(bg.get_map_data())
        most_active_labels = tg.create_task(get_most_active_labels())
        adversary_statistics = tg.create_task(get_adversary_statistics())
        alert_statistics = tg.create_task(get_alert_statistics())
        ti_statistics = tg.create_task(get_ti_statistics())
        system_statistics = tg.create_task(get_system_statistics())

    dashboard_visuals = {
        "active-malwares": PieVisual(
            title="Most Active Malwares",
            description="Top 10 most active malwares in the last 24 hours(based on count of entities using this malware)",
            value=[
                PieSlice(name=name, percent=value)
                for name, value in most_active_malwares.result()[:7]
            ],
        ),
        "ioc-per-adv": BarVisual(
            title="Indicator Count of Top Adversary",
            description="Displays the number of IoCs linked to the top adversaries.",
            value=BarValue(
                x_title="Adversaries",
                y_title="IoC Count",
                x_accessor="adv",
                y_accessors=["count"],
                data=[
                    {"adv": info.name, "count": len(info.relational_iocs)}
                    for info in the_10_top_ioc_count_per_adversary.result()
                ],
            ),
        ),
        "ip-map": MapVisual(
            title="Geo IP of Indicators",
            description="",
            value=map_data.result(),
        ),
        "common-ioc-tags": TreeMapVisual(
            title="Most Common Tags in IoCs",
            description="The most common tags across IoCs and their relative frequency.",
            value=[
                TreeMapSlice(name=k, percent=v) for k, v in most_active_labels.result()
            ],
        ),
    }
    return Home(
        top_dashboards=(
            Statistics(
                title="Adversaries",
                information=adversary_statistics.result(),
            ),
            Statistics(
                title="Alerts",
                information=alert_statistics.result(),
            ),
            Statistics(
                title="Threat Intelligence",
                information=ti_statistics.result(),
            ),
            Statistics(
                title="System",
                information=system_statistics.result(),
            ),
        ),
        visuals={
            name: VisualResponse(
                type=visual.__class__.__name__,
                data=visual,
            )
            for name, visual in dashboard_visuals.items()
        },
    )
