import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

from fastapi import APIRouter, HTTPException, status

from ..apt_detection.utils import get_adversary_profile
from ..background.apt_detection import run_apt_detection
from ..background.celery_worker import get_active_tasks
from ..elastic_client.alert import get_all_alert_as_concise_obj
from ..elastic_client.index import get_index_data_by_index_pattern
from ..elastic_client.utils.others import get_es
from ..llm_agent.analysis_adv.graph import build_adv_graph_and_run
from ..models.adversary import (
    AdversaryDetectionResults,
    AdversaryDetectionSigBaseResult,
    AdversaryInfo,
    AdversaryName,
    AdversarySideBarCache,
    AdversarySideBarItem,
    IoCAlertRow,
    IoCAlertTable,
    IoCRow,
    IoCTable,
    RulePerAdversary,
    RuleRow,
    RuleTable,
    Section,
    SigAlertRow,
    SigAlertTable,
    SpecificityScore,
)
from ..models.feed import TopDashboardCache
from ..models.utils import AIAssistantBox, Column, FieldWithType
from ..models.visual import (
    BarValue,
    BarVisual,
    HeatmapData,
    HeatmapDataPoint,
    HeatmapDataRow,
    HeatmapVisual,
    MetricVisual,
    VisualResponse,
)
from ..utils.adversary import (
    get_10_top_ioc_count_per_adversary,
    get_adversary_statistics,
    get_rules_per_adversary,
    get_used_ttps_names,
)
from ..utils.miscellaneous import clean_markdown_text
from ..utils.redis import redis_get, redis_set
from ..utils.ti import TTP, Count, get_adversary_specificity, get_all_ttps

adversary_router = APIRouter()


@adversary_router.get("/top-dashboard", response_model=Dict[str, VisualResponse])
async def get_top_dashboard() -> Dict[str, VisualResponse]:
    top_dashboard_data = await redis_get(
        key="top_dashboard", prefix="feed", model=TopDashboardCache
    )
    assert top_dashboard_data is not None

    adversaries_with_related_iocs = [
        {"adv_name": info.name, "ioc_count": len(info.relational_iocs)}
        for info in (await get_10_top_ioc_count_per_adversary())
    ]

    rules_per_adversaries = await get_rules_per_adversary()

    rule_counts_per_adversary = [
        {"adv_name": adv_name, "rules_count": len(rules)}
        for adv_name, rules in rules_per_adversaries.items()
        if adv_name.startswith("APT")
    ]

    adversary_statistics = await get_adversary_statistics()
    all_adversaries_count = sum(adversary_statistics.values())

    heatmap_rows = []

    for adv_name, specs in (await get_adversary_specificity()).items():
        if adv_name.startswith("APT"):
            heatmap_points = []
            for ttp_name, spec in specs.items():
                if ttp_name in (await get_used_ttps_names()).keys():
                    heatmap_points.append(HeatmapDataPoint(x=ttp_name, y=spec))
            heatmap_rows.append(HeatmapDataRow(id=adv_name, data=heatmap_points))

    visuals = {
        "tracked-sig": MetricVisual(
            title="Tracked Adversaries with Indicators",
            description="",
            value=f"{adversary_statistics["adv_with_indicator"]}/{all_adversaries_count}",
        ),
        "tracked-ioc": MetricVisual(
            title="Tracked Adversaries with Signatures",
            description="",
            value=f"{adversary_statistics["adv_with_sig"]}/{all_adversaries_count}",
        ),
        "ioc-per-adv": BarVisual(
            title="Indicators per Adversary",
            description="Top 10 Adversaries with most IoCs",
            value=BarValue(
                x_title="Feed Source",
                y_title=" IoC Count",
                x_accessor="adv_name",
                y_accessors=["ioc_count"],
                data=adversaries_with_related_iocs,
            ),
        ),
        "rule-per-adv": BarVisual(
            title="Rule Count for Important Adversaries",
            description="",
            value=BarValue(
                x_title="Adversary Name",
                y_title="Rule Count",
                x_accessor="adv_name",
                y_accessors=["rules_count"],
                data=rule_counts_per_adversary,
            ),
        ),
        "specificity": HeatmapVisual(
            title="Specificity of each TTP",
            description="Only included selected TTPs and Adversaries",
            value=HeatmapData(
                data=heatmap_rows,
                domain=(
                    0,
                    1,
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


@adversary_router.get("/", response_model=List[AdversarySideBarItem])
async def get_adversaries():
    adv_cache = await redis_get(
        prefix="adv",
        key="side_bar_cache",
        model=AdversarySideBarCache,
    )
    assert adv_cache is not None
    return adv_cache.data


@adversary_router.get(
    "/specificity", response_model=Dict[AdversaryName, Dict[TTP, SpecificityScore]]
)
async def get_specificity_for_each_adversary() -> (
    Dict[AdversaryName, Dict[TTP, SpecificityScore]]
):
    return await get_adversary_specificity()


@adversary_router.get(
    "/mitre-map/{adv_name}", response_model=Dict[str, Dict[TTP, Count]]
)
async def get_adversary_mitre_map(
    adv_name: AdversaryName,
) -> Dict[str, Dict[TTP, Count]]:
    alerts = await get_all_alert_as_concise_obj(exclude_ti=True)
    ttps_of_alerts = set([tag[2] for alert in alerts for tag in alert.mitre_tag])
    return {
        "adversary": {
            ttp: 1 if score > 0 else 0
            for ttp, score in (await get_adversary_specificity())[adv_name].items()
        },
        "organization": {ttp: ttp in ttps_of_alerts for ttp in await get_all_ttps()},
    }


@adversary_router.post("/schedule/run-now", response_model=bool)
async def apt_detection_run_now():
    run_apt_detection.delay()
    return True


@adversary_router.get("/schedule", response_model=List[FieldWithType])
async def get_schedule_info():
    state = "Running" if "run_apt_detection" in set(get_active_tasks()) else "Idle"
    if ad_res := await redis_get(
        prefix="adv",
        key="adversary_detection_results",
        model=AdversaryDetectionResults,
    ):
        last_run = ad_res.creation_time
    else:
        last_run = datetime.fromtimestamp(0.0)

    return [
        FieldWithType(key="Current State", value=state, type="text"),
        FieldWithType(key="Last Run", value=last_run, type="date"),
        FieldWithType(
            key="Next Run", value=datetime.now() + timedelta(minutes=30), type="date"
        ),
        FieldWithType(key="Now", value=datetime.now(), type="date"),
    ]


async def get_side_bar_item(id: str) -> AdversarySideBarItem:
    adv_cache = await redis_get(
        prefix="adv",
        key="side_bar_cache",
        model=AdversarySideBarCache,
    )
    assert adv_cache is not None

    for adv in adv_cache.data:
        if adv.id == id:
            return adv

    raise KeyError("side bar item not found")


@adversary_router.get("/{id}", response_model=AdversaryInfo)
async def get_adversary_data(id: str):
    # Default values
    detected_ioc_rows = []
    non_detected_ioc_rows = []
    ioc_rows = []
    ioc_alert_rows = []

    profile = await get_adversary_profile(id)
    profile_name = profile["name"]

    specificity_per_ttp = (await get_adversary_specificity()).get(profile_name, {})

    detection_results = await redis_get(
        prefix="adv",
        key="adversary_detection_results",
        model=AdversaryDetectionResults,
    )
    rule_per_adversary = await redis_get(
        prefix="adv",
        key="rule_per_adversary",
        model=RulePerAdversary,
    )

    assert detection_results is not None
    assert rule_per_adversary is not None

    if sig_result := detection_results.sig_based_results.get(profile_name):
        confidence = sig_result.confidence
        fired_rule_ids = set(sig_result.fired_rule_ids)
        sig_alerts = [
            SigAlertRow(
                path={
                    "Show Rule": f"rules/{rule_id}",
                    "Show Log": f"logs/show/{log_indices[0] if log_indices else ''}/{log_ids[0] if log_ids else ''}",
                },
                timestamp=timestamp,
                rule_name=rule_name,
                rule_id=rule_id,
                log_id=log_ids[0] if log_ids else "",
                log_index=log_indices[0] if log_indices else "",
                actions=["Show Log", "Show Rule"],
            )
            for timestamp, rule_name, rule_id, log_ids, log_indices in zip(
                sig_result.alert_timestamps,
                sig_result.alert_rule_name,
                sig_result.alert_rule_id,
                sig_result.alert_log_ids,
                sig_result.alert_log_indenes,
            )
        ]
    else:
        confidence = -0.01
        fired_rule_ids = set()
        sig_alerts = []

    rule_rows = [
        RuleRow(
            path={"flyout": f"rules/{rule.id}"},
            name=rule.name,
            ttp=[t for t in (rule.tags or []) if t.startswith("att")],
            is_fired=rule.id in fired_rule_ids,
            specificity=round(
                max(specificity_per_ttp.get(ttp, 0) for ttp in (rule.ttps or [""])),
                2,
            ),
        )
        for rule in rule_per_adversary.root.get(profile_name, [])
    ]

    rule_rows.sort(key=lambda r: (not r.is_fired, -r.specificity, r.name.lower()))
    count_fired_rule = sum(1 for row in rule_rows if row.is_fired)

    if adversary_object := detection_results.ioc_based_results.get(profile_name):
        for ioc in adversary_object.undetected_related_iocs:
            non_detected_ioc_rows.append(
                IoCRow(
                    path={"flyout": f"ti/indicator/{ioc.id}"},
                    value=ioc.value,
                    author=ioc.author,
                    timestamp=ioc.timestamp,
                    x_opencti_score=ioc.x_opencti_score,
                    indicator_type=ioc.indicator_type,
                    is_detected=False,
                )
            )

        for ioc in adversary_object.detected_iocs:
            detected_ioc_rows.append(
                IoCRow(
                    path={"flyout": f"ti/indicator/{ioc.id}"},
                    value=ioc.value,
                    author=ioc.author,
                    timestamp=ioc.timestamp,
                    x_opencti_score=ioc.x_opencti_score,
                    indicator_type=ioc.indicator_type,
                    is_detected=True,
                )
            )

        ioc_alert_rows = [
            IoCAlertRow(
                path={
                    "Show Rule": f"rules/{rule_id}",
                    "Show Log": f"logs/show/{log_indices[0] if log_indices else ''}/{log_ids[0] if log_ids else ''}",
                    "Show IoC": f"ti/indicator/{ioc_ids}",
                },
                timestamp=timestamp,
                rule_name=rule_name,
                rule_id=rule_id,
                log_id=log_ids[0] if log_ids else "",
                log_index=log_indices[0] if log_indices else "",
                ioc_value=ioc_values,
                ioc_id=ioc_ids,
                actions=["Show Log", "Show Rule", "Show IoC"],
            )
            for timestamp, rule_name, rule_id, log_ids, log_indices, ioc_values, ioc_ids in zip(
                adversary_object.alert_timestamps,
                adversary_object.alert_rule_name,
                adversary_object.alert_rule_id,
                adversary_object.alert_log_ids,
                adversary_object.alert_log_indenes,
                adversary_object.alert_ioc_value,
                adversary_object.alert_ioc_id,
            )
        ]

        ioc_rows = detected_ioc_rows + non_detected_ioc_rows

    adversary_object = AdversaryInfo(
        id=id,
        name=profile_name,
        description=clean_markdown_text(profile["description"]),
        confidence=int(confidence * 100),
        sections=[
            Section(
                title="Related Signature-based Rules",
                description="Sigma rules that can detect activities related to this adversary.",
                information=[
                    FieldWithType(
                        key="Total",
                        value=len(rule_rows),
                        type="number",
                    ),
                    FieldWithType(
                        key="Fired",
                        value=count_fired_rule,
                        type="number",
                    ),
                ],
                data=RuleTable(
                    rows=rule_rows,
                    columns={
                        "path": Column(name="path", type="hidden"),
                        "name": Column(name="Name", type="text"),
                        "specificity": Column(name="Specificity", type="number"),
                        "is_fired": Column(name="Is Fired", type="bool"),
                        "ttp": Column(name="Tags", type="labels"),
                    },
                    total=len(rule_rows),
                ),
            ),
            Section(
                title="Alerts emitted by signature-based rules",
                description="Alerts emitted by signature-based rules for this adversary.",
                information=[
                    FieldWithType(key="Total", value=len(sig_alerts), type="number"),
                ],
                data=SigAlertTable(
                    rows=sig_alerts,
                    columns={
                        "path": Column(name="path", type="hidden"),
                        "timestamp": Column(name="Creation Time", type="date"),
                        "rule_name": Column(name="Rule Name", type="text"),
                        "log_id": Column(name="Log ID", type="text"),
                        "log_index": Column(name="Log Index", type="text"),
                        "actions": Column(name="Actions", type="action"),
                    },
                    total=len(sig_alerts),
                ),
            ),
            Section(
                title="Related Indicator of Compromise (IoC)",
                description="Indicators of Compromise associated with this adversary.",
                information=[
                    FieldWithType(
                        key="Total",
                        value=len(ioc_rows),
                        type="number",
                    ),
                    FieldWithType(
                        key="Matched",
                        value=len(detected_ioc_rows),
                        type="number",
                    ),
                ],
                data=IoCTable(
                    rows=ioc_rows,
                    columns={
                        "path": Column(name="path", type="hidden"),
                        "value": Column(name="IoC Value", type="text"),
                        "indicator_type": Column(name="Indicator Type", type="text"),
                        "author": Column(name="Feed Source", type="text"),
                        "timestamp": Column(name="Creation Time", type="date"),
                        "x_opencti_score": Column(name="Score", type="number"),
                        "is_detected": Column(name="Is Detected", type="bool"),
                    },
                    total=len(ioc_rows),
                ),
            ),
            Section(
                title="Alerts emitted by IoC-based rules",
                description="Alerts emitted by IoC-based rules for this adversary.",
                information=[
                    FieldWithType(
                        key="Total",
                        value=len(ioc_alert_rows),
                        type="number",
                    ),
                    FieldWithType(
                        key="ioc_warn_sign",
                        value=True if len(ioc_alert_rows) > 0 else False,
                        type="warn_sign",
                    ),
                ],
                data=IoCAlertTable(
                    rows=ioc_alert_rows,
                    columns={
                        "path": Column(name="path", type="hidden"),
                        "timestamp": Column(name="Creation Time", type="date"),
                        "ioc_value": Column(name="IoC Value", type="text"),
                        "rule_name": Column(name="Rule Name", type="text"),
                        "log_id": Column(name="Log ID", type="text"),
                        "log_index": Column(name="Log Index", type="text"),
                        "ioc_id": Column(name="IoC ID", type="hidden"),
                        "actions": Column(name="Actions", type="action"),
                    },
                    total=len(ioc_alert_rows),
                ),
            ),
        ],
    )

    return adversary_object


@adversary_router.get("/explain/{id}", response_model=Tuple[AIAssistantBox])
async def get_ai_insights(id: str):
    try:
        llm_result = await build_adv_graph_and_run(adv_id=id)
        return (
            AIAssistantBox(
                title="Explanation",
                value=llm_result["data"],
            ),
        )

    except Exception as e:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generating AI Insight failed: {e}",
        )
