import json
from datetime import datetime
from typing import Dict, List, Tuple, get_args

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from ..background import get_map_data
from ..background.ti import update_ti_feeds
from ..llm_agent.analysis_ti.graph import build_TI_graph_and_run
from ..models.ti import (
    Column,
    DateFilter,
    EnumFilter,
    ImportantMalwareTable,
    IoCTypesCache,
    MapFeed2ID,
    NumberFilter,
    TagFilter,
    TextFilter,
    TIRow,
    TITable,
    TITableRequest,
    TopDashboardCache,
)
from ..models.utils import AIAssistantBox, FieldWithType, ReliabilityLevel
from ..models.visual import (
    AreaVisual,
    BarValue,
    HeatmapData,
    HeatmapVisual,
    MapVisual,
    MetricVisual,
    NetworkVisual,
    ParallelCoordinatesVisual,
    PieSlice,
    PieVisual,
    StackedBarVisual,
    TableVisual,
    VisualResponse,
)
from ..opencti import get_all_labels, get_indicator_by_id, get_indicators_with_filters
from ..opencti.feed import get_all_external_connectors
from ..opencti.indicator import change_indicator_confidence_level_by_id
from ..utils import redis_get, redis_set

ti_router = APIRouter()


def extract_operators(Filter):
    return list(get_args(Filter.model_fields["operator"].annotation))


@ti_router.post("/main-table", response_model=TITable)
async def get_ti_table(request: TITableRequest) -> TITable:
    update_ti_feeds.delay()

    if feeds_name2id := await redis_get(
        prefix="ti",
        key="feeds_name2id",
        model=MapFeed2ID,
    ):
        feeds_name2id = feeds_name2id.root
    else:
        raise RuntimeError("system it not ready")

    # Apply pagination
    page_size = request.page_size if request.page_size else 25
    cursor = request.cursor if request.cursor else ""

    all_labels_name2id = await get_all_labels()

    if all_indicator_types := await redis_get(
        prefix="ti",
        key="indicator_types",
        model=IoCTypesCache,
    ):
        all_indicator_types = all_indicator_types.root
    else:
        raise RuntimeError("system it not ready")

    if not request.filters:
        indicators, page_info = await get_indicators_with_filters(
            limit=page_size, cursor=cursor
        )
    else:

        filters = []
        for filter_obj in request.filters:
            mode = "and"
            match filter_obj.field:
                case "Reliability":
                    key = "computed_reliability"
                    values = filter_obj.values
                case "Confidence":
                    key = "confidence"
                    values = filter_obj.values
                case "Score":
                    key = "x_opencti_score"
                    values = filter_obj.values
                case "Name":
                    key = "name"
                    values = filter_obj.values
                case "Type":
                    key = "x_opencti_main_observable_type"
                    values = (
                        filter_obj.values[0]
                        if filter_obj.values
                        else all_indicator_types
                    )

                    mode = "or"
                case "Feed Source":
                    key = "createdBy"
                    try:
                        values = (
                            feeds_name2id[filter_obj.values[0]]
                            if filter_obj.values
                            else feeds_name2id.values()
                        )
                    except:
                        values = filter_obj.values[0]
                    mode = "or"
                case "Creation Time":
                    key = "created_at"
                    values = filter_obj.values
                case "Labels":
                    key = "objectLabel"
                    try:
                        values = (
                            all_labels_name2id[filter_obj.values[0]]
                            if filter_obj.values
                            else all_labels_name2id.values()
                        )
                    except:
                        values = filter_obj.values[0]
                    mode = "or"
                case _:
                    continue  # Handle unknown fields by skipping

            filters.append(
                {
                    "key": key,
                    "values": [values] if (type(values) != list) else values,
                    "operator": filter_obj.operator,
                    "mode": mode,
                }
            )

        indicators, page_info = await get_indicators_with_filters(
            filters=filters, limit=page_size, cursor=cursor
        )

    last_row_cursor = page_info["endCursor"] if page_info["hasNextPage"] else ""

    rows = []
    for indicator in indicators:
        indicator_type = indicator["node"].get("x_opencti_main_observable_type", "None")
        if type(indicator_type) is list:
            indicator_type = indicator_type[0]

        rows.append(
            TIRow(
                id=indicator["node"]["id"],
                name=indicator["node"]["name"],
                feed_source=(indicator["node"].get("createdBy") or {}).get(
                    "name", "N/A"
                ),
                type=str(indicator_type),
                creation_time=indicator["node"].get("created_at", datetime.now()),
                score=indicator["node"].get("x_opencti_score", 0),
                labels=[
                    object_label["value"]
                    for object_label in indicator["node"].get("objectLabel", [])
                ],
                # reliability=indicator["node"]["createdBy"].get(
                #     "x_opencti_reliability", None
                # ),
                confidence_score=indicator["node"]["confidence"],
                cursor=cursor,
            )
        )

    columns = {
        "id": Column(
            name="ID",
            type="hidden",
            filter=None,
            filter_operators=[],
            filter_options=[],
        ),
        "name": Column(
            name="Name",
            type="long_text",
            filter=TextFilter.__name__,
            filter_operators=extract_operators(TextFilter),
            filter_options=[],
        ),
        "feed_source": Column(
            name="Feed Source",
            type="text",
            filter=EnumFilter.__name__,
            filter_operators=extract_operators(EnumFilter),
            filter_options=list(feeds_name2id.keys()),
        ),
        "type": Column(
            name="Type",
            type="text",
            filter=EnumFilter.__name__,
            filter_operators=extract_operators(EnumFilter),
            filter_options=all_indicator_types,
        ),
        "creation_time": Column(
            name="Creation Time",
            type="date",
            filter=DateFilter.__name__,
            filter_operators=extract_operators(DateFilter),
            filter_options=[],
        ),
        "score": Column(
            name="Score",
            type="score",
            filter=NumberFilter.__name__,
            filter_operators=extract_operators(NumberFilter),
            filter_options=[],
        ),
        "confidence_score": Column(
            name="Confidence",
            type="score",
            filter=NumberFilter.__name__,
            filter_operators=extract_operators(NumberFilter),
            filter_options=[],
        ),
        # "reliability": Column(
        #     name="Reliability",
        #     type="text",
        #     filter=TextFilter.__name__,
        #     filter_operators=extract_operators(TextFilter),
        #     filter_options=list(get_args(ReliabilityLevel)),
        # ),
        "labels": Column(
            name="Labels",
            type="labels",
            filter=TagFilter.__name__,
            filter_operators=extract_operators(TagFilter),
            filter_options=all_labels_name2id.keys(),
        ),
        "cursor": Column(
            name="Cursor",
            type="hidden",
            filter=None,
            filter_operators=[],
            filter_options=[],
        ),
    }

    assert all(
        key in columns.keys() for key in TIRow.model_fields.keys()
    ), "All keys of TIRow must be present in columns"

    return TITable(
        rows=rows,
        columns=columns,
        total=page_info["globalCount"],
        last_row_cursor=last_row_cursor,
        filterable=True,
    )


@ti_router.get("/ti-dashboard", response_model=Dict[str, VisualResponse])
async def get_ti_dashboard() -> Dict[str, VisualResponse]:
    top_dashboard = await redis_get(
        prefix="ti", key="top_dashboard", model=TopDashboardCache
    )
    assert top_dashboard is not None

    installed_connectors = await get_all_external_connectors()
    actives_opencti = [feed["name"] for feed in installed_connectors if feed["active"]]

    accumulator = 0
    indicator_count_cumulative = []
    for timestamp, count in top_dashboard.indicator_count_timeseries.items():
        accumulator += count
        indicator_count_cumulative.append(
            {"timestamp": timestamp, "count": accumulator}
        )

    visuals = {
        "active-feeds": MetricVisual(
            title="Active Feeds",
            description="",
            value=str(len(actives_opencti)),
        ),
        "malware-count": MetricVisual(
            title="Malware",
            description="",
            value=top_dashboard.malware_count,
        ),
        "indicator-count": MetricVisual(
            title="Indicators",
            description="",
            value=top_dashboard.indicator_count,
        ),
        "indicator-count-48h": MetricVisual(
            title="Indicators Added in Last 48h",
            description="",
            value=top_dashboard.indicator_count_last_48h,
        ),
        "cumulative-ioc-count": AreaVisual(
            title="Indicator Count over Time",
            description="",
            value=BarValue(
                x_title="Time",
                y_title="IoC Count",
                x_accessor="timestamp",
                y_accessors=["count"],
                data=indicator_count_cumulative,
            ),
        ),
        "diverging-conf-risk": StackedBarVisual(
            title="Risk and Confidence",
            description="",
            value=top_dashboard.diverging_conf_risk_data,
        ),
        "ioc-type-pie": PieVisual(
            title="Indicator Types",
            description="",
            value=[
                PieSlice(name=key, percent=value)
                for key, value in top_dashboard.indicator_distribution.items()
            ],
        ),
        "tag-corr-heatmap": HeatmapVisual(
            title="Tag Co-occurrence",
            description="",
            value=HeatmapData(
                data=top_dashboard.tag_co_occurrence,
                domain=(
                    0,
                    max([y.y for x in top_dashboard.tag_co_occurrence for y in x.data]),
                ),
            ),
        ),
    }

    return {
        k: VisualResponse(
            type=v.__class__.__name__,  # pyright: ignore[reportArgumentType]
            data=v,
        )
        for k, v in visuals.items()
    }


@ti_router.get("/malware-dashboard", response_model=Dict[str, VisualResponse])
async def get_malware_dashboard() -> Dict[str, VisualResponse]:
    top_dashboard = await redis_get(
        prefix="ti", key="top_dashboard", model=TopDashboardCache
    )
    assert top_dashboard is not None

    visuals = {
        "important-table": TableVisual(
            title="Important Malware",
            description="",
            value=ImportantMalwareTable(
                rows=top_dashboard.important_malwares,
                columns={
                    "id": Column(name="ID", type="hidden"),
                    "name": Column(name="Name", type="text"),
                    "num_indicators": Column(name="Indicator count", type="number"),
                    "num_reports": Column(name="Report count", type="number"),
                    "last_ioc_date": Column(name="Last IoC date", type="date"),
                    "feed_source": Column(name="Feed Source", type="text"),
                },
                total=5,
            ),
        ),
        "malware-adversary-graph": NetworkVisual(
            title="Malware Adversary Graph for Top 50 Adversaries",
            description="",
            value=top_dashboard.malware_adv_graph_data,
        ),
        "malware-info-parallel-coord": ParallelCoordinatesVisual(
            title="Malware Information",
            description="",
            value=top_dashboard.malware_info_parallel_coords_data,
        ),
        "malware-feed-pie": PieVisual(
            title="Malware Feed Source",
            description="",
            value=top_dashboard.malware_sources_pie_data,
        ),
    }

    return {
        k: VisualResponse(
            type=v.__class__.__name__,  # pyright: ignore[reportArgumentType]
            data=v,
        )
        for k, v in visuals.items()
    }


@ti_router.get("/ip-dashboard", response_model=Dict[str, VisualResponse])
async def get_ip_dashboard() -> Dict[str, VisualResponse]:

    visuals = {
        "ip-geo-map": MapVisual(
            title="Geo IP of Indicators",
            description="",
            value=await get_map_data(),
        ),
    }

    return {
        k: VisualResponse(
            type=v.__class__.__name__,  # pyright: ignore[reportArgumentType]
            data=v,
        )
        for k, v in visuals.items()
    }


@ti_router.get("/indicator/{id}", response_model=List[FieldWithType])
async def get_indicator(id: str) -> List[FieldWithType]:
    indicator = await get_indicator_by_id(id)

    description = indicator["description"] if indicator["description"] else "-"
    kill_chain_phases = (
        str(indicator["kill_chain_phases"]) if indicator["kill_chain_phases"] else "-"
    )
    platforms = str(indicator["platforms"]) if indicator["platforms"] else "-"

    indicator_types = (
        [str(indicator.get("indicator_types", []))]
        if type(indicator.get("indicator_types", [])) is not list
        else indicator.get("indicator_types", [])
    )

    return [
        FieldWithType(key="ID", value=id, type="text"),
        FieldWithType(key="Name", value=indicator["name"], type="text"),
        FieldWithType(
            key="Indicator Pattern",
            value=indicator.get("indicator_pattern", ""),
            type="text",
        ),
        FieldWithType(key="Indicator Types", value=indicator_types, type="labels"),
        FieldWithType(key="Score", value=indicator["x_opencti_score"], type="score"),
        FieldWithType(
            key="Valid Until",
            value=datetime.fromisoformat(indicator["valid_until"]),
            type="date",
        ),
        FieldWithType(
            key="Created At",
            value=datetime.fromisoformat(indicator["created_at"]),
            type="date",
        ),
        FieldWithType(
            key="Confidence Level",
            value=str(indicator["confidence_level"]),
            type="editable_text",
        ),
        FieldWithType(key="Author", value=indicator["author"], type="text"),
        FieldWithType(key="Is Revoked", value=indicator["is_revoked"], type="bool"),
        FieldWithType(
            key="Reliability of Author",
            value=json.dumps(indicator["reliability_of_author"]),
            type="external_references",
        ),
        FieldWithType(
            key="Labels",
            value=indicator["objectLabel"],
            type="labels",
        ),
        FieldWithType(
            key="External References",
            value=str(indicator["external_references"]),
            type="external_references",
        ),
        FieldWithType(key="Description", value=description, type="text"),
        FieldWithType(key="Kill Chain Phases", value=kill_chain_phases, type="text"),
        FieldWithType(key="Platforms", value=platforms, type="text"),
    ]


@ti_router.get("/explain/{id}", response_model=Tuple[AIAssistantBox])
async def explain_a_TI(
    id: str,
) -> Tuple[AIAssistantBox]:
    llm_result = await build_TI_graph_and_run(ti_id=id)

    return (AIAssistantBox(title="Explanation", value=llm_result["explanation"]),)


@ti_router.patch("/indicator/{id}/confidence")
async def change_confidence_level(id: str, data: int = 80):
    try:
        await change_indicator_confidence_level_by_id(_id=id, conf_level=data)
        return JSONResponse(
            status_code=202,
            content={
                "message": f"Changing confidence level of Indicator '{id}' to {data} Successfully done"
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Changing confidence level of Indicator '{id}' Failed: {e}",
        )
