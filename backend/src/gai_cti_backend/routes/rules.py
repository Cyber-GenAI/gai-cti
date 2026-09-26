from collections import Counter
from datetime import datetime, timedelta, timezone
from functools import reduce
from itertools import chain
from logging import getLogger
from typing import Dict, List, Tuple

import httpx
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from httpx import HTTPStatusError

from ..elastic_client.rule import (
    change_rule_interval_by_id,
    delete_detection_rule_by_id,
    get_all_rules,
    get_rule_info,
    manually_run_rule,
)
from ..llm_agent.analysis_rule.graph import build_rule_graph_and_run
from ..models.feed import TopDashboardCache
from ..models.home import System
from ..models.rule import PageInfo, Rule, RulePerTechnique
from ..models.utils import AIAssistantBox, FieldWithType
from ..models.visual import (
    BarValue,
    BarVisual,
    MetricVisual,
    PieSlice,
    PieVisual,
    TreeMapSlice,
    TreeMapVisual,
    VisualResponse,
)
from ..utils import get_all_ttps, redis_get, redis_set

logger = getLogger(__name__)
rules_router = APIRouter()


@rules_router.get("/top-dashboard", response_model=Dict[str, VisualResponse])
async def get_top_dashboard() -> Dict[str, VisualResponse]:

    all_rules = list(
        reduce(
            lambda a, b: {"data": chain(a["data"], b["data"])}, await get_all_rules()
        )["data"]
    )

    all_tags = list(
        reduce(lambda a, b: {"tags": chain(a["tags"], b["tags"])}, all_rules)["tags"]
        if all_rules
        else []
    )
    tag_freq = Counter(all_tags)

    risk_scores = [r.get("risk_score", -1) for r in all_rules]
    risk_score_freq = Counter()
    for risk_score in risk_scores:
        risk_score_freq[((risk_score) // 10) * 10] += 1

    severity_freq = Counter([r.get("severity", "Unknown") for r in all_rules])

    top_dashboard_data = await redis_get(
        key="top_dashboard", prefix="feed", model=TopDashboardCache
    )
    assert top_dashboard_data is not None

    visuals = {
        "total-count": MetricVisual(
            title="All Rules",
            description="",
            value=str(len(all_rules)),
        ),
        "sigma-count": MetricVisual(
            title="Sigma Rules",
            description="",
            value=str(
                sum(
                    [
                        1
                        for r in all_rules
                        if "Type: GAI_CTI_SIGMA_LINUX" in r["tags"]
                        or "Type: GAI_CTI_SIGMA_WINDOWS" in r["tags"]
                    ]
                )
            ),
        ),
        "ioc-count": MetricVisual(
            title="TI Rules",
            description="",
            value=str(sum([1 for r in all_rules if "Type: GAI_CTI_TI" in r["tags"]])),
        ),
        "custom-count": MetricVisual(
            title="Custom Rules",
            description="",
            value=str(
                sum([1 for r in all_rules if "Type: GAI_CTI_MANUAL" in r["tags"]])
            ),
        ),
        "severity": PieVisual(
            title="Severity of Rules",
            description="",
            value=[
                PieSlice(name=severity, percent=count)
                for severity, count in severity_freq.items()
            ],
        ),
        "risk-distribution": BarVisual(
            title="Risk Distribution",
            description="",
            value=BarValue(
                x_title="Risk Score",
                y_title="Count",
                x_accessor="risk",
                y_accessors=["count"],
                data=[
                    dict(risk=risk, count=count)
                    for risk, count in risk_score_freq.items()
                ],
            ),
        ),
        "tags-treemap": TreeMapVisual(
            title="Frequent Tags",
            description="",
            value=[
                TreeMapSlice(name=t, percent=count) for t, count in tag_freq.items()
            ],
        ),
    }

    return {
        k: VisualResponse(
            type=v.__class__.__name__,  # pyright: ignore[reportArgumentType]
            data=v,
        )
        for k, v in visuals.items()
    }


@rules_router.get("/pages", response_model=List[PageInfo])
async def get_index_pattern():
    return [
        PageInfo(
            name="All",
            description="All rules",
            tag="",
        ),
        PageInfo(
            name="IoC",
            description="Threat Intelligence rules based on IoCs",
            tag="Type: GAI_CTI_TI",
        ),
        PageInfo(
            name="Sigma Linux",
            description="Sigma rules Linux",
            tag="Type: GAI_CTI_SIGMA_LINUX",
        ),
        PageInfo(
            name="Sigma Windows",
            description="Sigma rules Windows",
            tag="Type: GAI_CTI_SIGMA_WINDOWS",
        ),
    ]


@rules_router.post("/manual-run", response_model=bool)
async def manual_run(rule_id: str):
    """
    Run the rules manually
    """
    try:
        # Grab system start in UTC (make sure System.start_time is stored as UTC-aware)
        system: System = await redis_get(prefix="home", key="system", model=System)
        system_start_utc: datetime = system.start_time
        if system_start_utc.tzinfo is None:
            # If it was stored naïvely, assume UTC
            system_start_utc = system_start_utc.replace(tzinfo=timezone.utc)

        now_utc = datetime.now(timezone.utc)
        days_passed = (now_utc - system_start_utc).days + 1

        end_datetime = now_utc.isoformat(timespec="milliseconds")  # includes +00:00
        start_datetime = (now_utc - timedelta(days=min(89, days_passed))).isoformat(
            timespec="milliseconds"
        )

        await manually_run_rule(
            rule_id,
            start_datetime=start_datetime,
            end_datetime=end_datetime,
        )

        return JSONResponse(
            content={"message": "Rule run successfully"}, status_code=200
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to run rule {rule_id}: {str(e)}"
        )


@rules_router.get("/coverage", response_model=Dict[str, int], status_code=200)
async def get_coverage():
    """
    Returns a dictionary with the count of rules for each tactic-technique pair.
    """
    result = await get_all_ttps()

    try:
        json_responses = await get_all_rules()

        for json_response in json_responses:
            for rule in json_response["data"]:
                for TTP in rule["threat"]:
                    for technique in TTP["technique"]:
                        if f"{TTP['tactic']['id']}/{technique["id"]}" in result:
                            result[f"{TTP['tactic']['id']}/{technique["id"]}"] += 1
                        else:
                            result[f"{TTP['tactic']['id']}/{technique["id"]}"] = 1

    except HTTPStatusError as e:
        logger.error(f"Failed to fetch rules. Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch rules.")

    except Exception as e:
        logger.error(f"An unexpected error has occurred: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error has occurred.")

    return result


@rules_router.get(
    "/coverage/{tactic_id}/{technique_id}",
    response_model=RulePerTechnique,
    status_code=200,
)
async def rules_per_technique(tactic_id: str, technique_id: str):
    """
    Returns all the rules for a specific tactic-technique pair.
    """
    try:
        result = {}
        rules = []
        json_responses = await get_all_rules()

        for json_response in json_responses:
            for rule in json_response["data"]:
                for obj in rule["threat"]:
                    for technique in obj["technique"]:
                        if (
                            technique["id"].upper() == technique_id
                            and obj["tactic"]["id"].upper() == tactic_id
                        ):
                            rules.append(
                                Rule(
                                    id=rule["id"],
                                    rule_id=rule["rule_id"],
                                    name=rule["name"],
                                    tags=tuple(rule.get("tags")),
                                    type=rule["type"],
                                    enabled=rule["enabled"],
                                )
                            )

    except HTTPStatusError as e:
        logger.error(f"Failed to fetch rules. Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch rules.")

    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch rules.")

    if not rules:
        raise HTTPException(
            status_code=404,
            detail=f"No rules found for the cell {tactic_id}/{technique_id}",
        )

    result["count"] = len(rules)
    result["data"] = rules

    return RulePerTechnique(**result)


@rules_router.get("/{id}", response_model=List[FieldWithType])
async def get_info_of_a_rule(
    id: str,
) -> List[FieldWithType]:
    try:
        return await get_rule_info(id)

    except httpx.HTTPStatusError as e:
        if e.response.status_code >= 400 and e.response.status_code < 500:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No rule found for id: {id}",
            )
        raise e

@rules_router.delete("/{id}")
async def remove_a_rule(
    id: str,
) -> bool:
    try:
        await delete_detection_rule_by_id(id)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            logger.warning(f"rule with id {id} not found in order to delete")
            return False
        
        raise e
    
    return True


@rules_router.patch("/{id}/interval/{interval}")
async def patch_rule_interval(id: str, interval: str):
    try:
        await change_rule_interval_by_id(id=id, interval=interval)
        return JSONResponse(
            status_code=200, content=f"Run interval Successfully change for rule: {id}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error changing run interval of rule {id}: {e}"
        )


@rules_router.get("/explain/{id}", response_model=Tuple[AIAssistantBox])
async def explain_a_rule(
    id: str,
) -> Tuple[AIAssistantBox]:

    llm_result = await build_rule_graph_and_run(rule_id=id)

    return (AIAssistantBox(title="Explanation", value=llm_result["explanation"]),)
