import asyncio
import json
import uuid
from logging import getLogger
from pathlib import Path
from typing import Dict, List, Literal, Tuple

import aiofiles
import orjson
import yaml
from async_lru import alru_cache
from elasticsearch8 import AsyncElasticsearch
from elasticsearch8.exceptions import ApiError
from fastapi import APIRouter, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse
from gai_cti_backend.llm_agent.utils import available_llms

from .. import background as bg
from ..elastic_client.index import (
    get_all_indices,
    get_all_logSTAR_indices,
    is_index_pattern_exists,
)
from ..elastic_client.rule import (
    delete_detection_rule_by_id,
    get_all_rules,
    get_rules_by_tag,
    import_detection_rule,
)
from ..elastic_client.utils import get_es
from ..models.management import (
    Column,
    InjectedIOCsCache,
    LogInfo,
    ManagementBackgroundTask,
    ManagementLogsRequest,
    ManagementManualRulesRequest,
    ManagementRow,
    ManagementRulesRequest,
    ManagementTable,
)
from ..models.utils import ExplainLLMUpdateRequest, FieldWithType, LLMSettings
from ..socket_handler.emitters import emit_update_mng_main_table
from ..utils import (
    get_redis_client,
    get_rules_path_list,
    redis_get,
    redis_remove,
    redis_search,
    redis_search_objects,
    redis_set,
)
from ..utils.miscellaneous import get_valid_path
from ..utils.sigma_convert import get_rule_in_ndjson_format, process_single_rule

logger = getLogger(__name__)
redis_client = get_redis_client()


status2actions = {
    "injecting": ["cancel"],
    "injected": ["delete", "re-inject"],
    "manual-injected": ["delete"],
    "not injected": ["inject"],
    "deleting": [],
    "re-injecting": [],
}


async def get_status_of_log_injection(
    index_pattern: str,
) -> Literal["injecting", "injected", "not injected", "deleting", "re-injecting"]:
    status_obj = await redis_get(
        key=index_pattern,
        model=ManagementBackgroundTask,
        prefix="mng:log",
    )

    if status_obj:
        return status_obj.status

    if await is_index_pattern_exists(index_pattern):
        return "injected"

    return "not injected"


async def get_status_of_rule_injection(
    rule_tag: str,
) -> Literal["injecting", "injected", "not injected", "deleting", "re-injecting"]:
    status_obj = await redis_get(
        key=rule_tag,
        model=ManagementBackgroundTask,
        prefix="mng:rule",
    )

    if status_obj:
        return status_obj.status

    rules_with_this_tag = await get_rules_by_tag(rule_tag)
    if rules_with_this_tag:
        return "injected"

    return "not injected"


async def get_status_of_manual_rule_injection(rule_id: str):
    status_obj = await redis_get(
        key=rule_id,
        model=ManagementBackgroundTask,
        prefix="mng:rule",
    )

    if status_obj:
        return status_obj.status

    rules_with_this_tag = await get_rules_by_tag("Type: GAI_CTI_MANUAL")
    rules_ids = [rule[0] for rule in rules_with_this_tag]
    if rule_id in rules_ids:
        return "injected"

    return "not injected"


management_router = APIRouter()


@alru_cache(ttl=10000)
async def load_logs_info() -> List[LogInfo]:
    path = get_valid_path("artifacts/logs/info.json")
    async with aiofiles.open(path, mode="r") as f:
        logs_info = orjson.loads(await f.read())
    return [LogInfo(**log_info) for log_info in logs_info]


async def get_log_info(index_pattern: str) -> LogInfo:
    for log_info in await load_logs_info():
        if index_pattern == log_info.index_pattern:
            return log_info

    raise KeyError(
        f"Log info for index {index_pattern} not found in the logs info file."
    )


async def get_management_table_() -> ManagementTable:
    logs_info = await load_logs_info()
    rows = []

    # TI Logs Processing:
    for log_info in logs_info:

        status = await get_status_of_log_injection(index_pattern=log_info.index_pattern)
        rows.append(
            ManagementRow(
                id=log_info.index_pattern,
                name=log_info.title,
                status=status,
                type="log",
                actions=status2actions[status],
                tag="ti" if "packetbeat" in log_info.dir else "other",
                apt_number=None,
            )
        )

    # --------------TI Logs Processing End--------------------

    # APT Logs Processing:
    #
    #
    #
    # --------------APT Logs Processing End--------------------

    # Other Logs Processing:
    all_indices = await get_all_indices()
    manual_logs = [index for index in all_indices if index.startswith("log-manual-")]
    manual_logs.extend(
        [
            item.split(":")[-1]
            for item in await redis_search("mng:log")
            if "log-manual" in item
        ]
    )
    print("@@@@", await redis_search("mng:log"))

    for log in set(manual_logs):
        status = await get_status_of_log_injection(index_pattern=log)

        rows.append(
            ManagementRow(
                id=log,
                name=f"{"Manual"} {log.replace("log-manual-", "").replace("-", " ").title()} {"Log"}",
                status=status,
                type="log",
                actions=status2actions.get(f"manual-{status}", []),
                tag="other",
                apt_number=None,
            )
        )

    # --------------Other Logs Processing End--------------------

    # TI Rules Processing:

    # {RULE_NAME: (RULE_TAG, TAG)}
    rules_titles: Dict[str, Tuple[str, Literal["apt", "ti", "other"]]] = {
        "TI IoC Rules": ("Type: GAI_CTI_TI", "ti"),
        "Sigma Windows Rules": ("Type: GAI_CTI_SIGMA_WINDOWS", "other"),
        "Sigma Linux Rules": ("Type: GAI_CTI_SIGMA_LINUX", "other"),
        # "APT5 Rules": ("GAI_CTI_APT5", "apt"),
    }
    for rule_name in rules_titles:
        manual_rules_tag = rules_titles[rule_name][0]
        status = await get_status_of_rule_injection(manual_rules_tag)

        rows.append(
            ManagementRow(
                id=manual_rules_tag,
                name=rule_name,
                status=status,
                type="rule",
                actions=status2actions[status],
                tag=rules_titles[rule_name][1],
                apt_number=(
                    f"apt{manual_rules_tag.split("T")[-1]}"
                    if "APT" in rule_name
                    else None
                ),
            )
        )
    # --------------TI Rules Processing End--------------------

    # APT Rules Processing:
    #
    #
    #
    # --------------APT Rules Processing End--------------------

    # Other Rules Processing:
    manual_rules_tag = "Type: GAI_CTI_MANUAL"
    manual_rules = await get_rules_by_tag(manual_rules_tag)

    for rule_id, rule_name, _ in manual_rules:
        status = await get_status_of_manual_rule_injection(rule_id)

        rows.append(
            ManagementRow(
                id=rule_id,
                name=rule_name,
                status=status,
                type="rule",
                actions=status2actions.get(f"manual-{status}", []),
                tag="other",
                apt_number=(
                    f"apt{manual_rules_tag.split("T")[-1]}"
                    if "APT" in rule_name
                    else None
                ),
            )
        )

    # --------------Other Rules Processing End--------------------

    columns = {
        "id": Column(name="ID", type="hidden"),
        "name": Column(name="Name", type="long_text"),
        "status": Column(name="Status", type="text"),
        "type": Column(name="Type", type="text"),
        "tag": Column(name="Tag", type="hidden"),
        "apt_number": Column(name="APT Number", type="hidden"),
        "actions": Column(name="Action", type="action"),
    }

    return ManagementTable(
        columns=columns,  # type: ignore
        rows=rows,
        total=len(rows),
        last_row_cursor="",
        filterable=False,
    )


@management_router.get("/main-table", response_model=ManagementTable)
async def get_management_table() -> ManagementTable:
    return await get_management_table_()


# Logs EndPoints:
@management_router.post("/log/inject")
async def inject_logs_data2es(request: ManagementLogsRequest):
    index_pattern = request.id
    index_status = await get_status_of_log_injection(index_pattern)

    if index_status in [
        "injecting",
        "re-injecting",
        "injected",
        "deleting",
    ]:
        raise HTTPException(
            status_code=409,
            detail=f"{index_pattern} Inject action not allowed for '{index_status}' status",
        )

    log_info = await get_log_info(index_pattern)

    result = bg.inject_logs.apply_async(
        args=[log_info.model_dump()],
        link=bg.post_work_cleanup.s(key=index_pattern, prefix="mng:log"),
        link_error=bg.post_work_cleanup.s(key=index_pattern, prefix="mng:log"),
    )

    await redis_set(
        redis_client=redis_client,
        key=index_pattern,
        obj=ManagementBackgroundTask(status="injecting", celery_task_id=result.id),
        prefix="mng:log",
    )

    await emit_update_mng_main_table(get_tbl=get_management_table_)

    return JSONResponse(
        status_code=202,
        content={
            "message": f"{index_pattern} Injection started",
            "celery_task_id": result.id,
        },
    )


@management_router.post("/log/delete")
async def delete_logs_data_from_es(request: ManagementLogsRequest):
    index_pattern = request.id
    index_status = await get_status_of_log_injection(index_pattern)
    if index_status in ["injecting", "re-injecting", "not injected", "deleting"]:
        raise HTTPException(
            status_code=409,
            detail=f"{request.id} Delete action is not allowed for '{index_status}' status",
        )

    result = bg.delete_index.apply_async(
        args=[index_pattern],
        link=bg.post_work_cleanup.s(key=index_pattern, prefix="mng:log"),
        link_error=bg.post_work_cleanup.s(key=index_pattern, prefix="mng:log"),
    )

    await redis_set(
        redis_client=redis_client,
        key=index_pattern,
        obj=ManagementBackgroundTask(status="deleting", celery_task_id=result.id),
        prefix="mng:log",
    )

    await emit_update_mng_main_table(get_tbl=get_management_table_)

    return JSONResponse(
        status_code=202, content={"message": f"{request.id} Deletion started"}
    )


@management_router.post("/log/re-inject")
async def reinject_logs_data2es(request: ManagementLogsRequest):
    index_pattern = request.id
    index_status = await get_status_of_log_injection(index_pattern)
    if index_status in ["injecting", "re-injecting", "deleting", "not injected"]:
        return JSONResponse(
            content={
                "message": f"{request.id} Re-injection action not allowed for '{index_status}' status"
            },
            status_code=409,
        )
    log_info = await get_log_info(index_pattern)

    result = bg.reinject_logs.apply_async(
        args=[log_info.model_dump()],
        link=bg.post_work_cleanup.s(key=index_pattern, prefix="mng:log"),
        link_error=bg.post_work_cleanup.s(key=index_pattern, prefix="mng:log"),
    )

    await redis_set(
        redis_client=redis_client,
        key=index_pattern,
        obj=ManagementBackgroundTask(status="re-injecting", celery_task_id=result.id),
        prefix="mng:log",
    )

    await emit_update_mng_main_table(get_tbl=get_management_table_)

    return JSONResponse(
        content={"message": f"{request.id} Re-injection started"}, status_code=202
    )


@management_router.post("/log/cancel")
async def cancel_injecting_logs_data2es(request: ManagementLogsRequest):
    index_pattern = request.id

    if bgt := await redis_get(
        key=index_pattern,
        prefix="mng:log",
        model=ManagementBackgroundTask,
    ):
        index_status = bgt.status
        celery_task_id = bgt.celery_task_id
    else:
        raise HTTPException(
            status_code=404, detail=f"{index_pattern} No running task found"
        )

    if index_status in ["deleting", "injected", "not injected", "re-injecting"]:
        raise HTTPException(
            status_code=409,
            detail=f"{request.id} Canceling action not allowed for '{index_status}' status",
        )

    bg.celery_revoke_task(id=celery_task_id)
    await redis_remove(key=index_pattern, prefix="mng:log")

    await emit_update_mng_main_table(get_tbl=get_management_table_)

    return JSONResponse(
        status_code=200,
        content={"message": f"{request.id} Task cancellation requested"},
    )


@management_router.post("/log/manual/inject")
async def manual_inject_logs_data2es(index_name_suffix: str, uploaded_file: UploadFile):
    log_name_prefix = "log-manual-"

    title = index_name_suffix.replace("-", " ").replace("_", " ").title()
    index_pattern = f"{log_name_prefix}{index_name_suffix.lower().replace(' ', '-').replace('_', "-").replace(".", "-")}"

    # TODO: check is exists index_name (in all inject apis)

    log_info = {
        "title": "Manual" + title,
        "dir": "artifacts/logs/manual",
        "description": "",
        "index_name": index_pattern,
        "index_pattern": index_pattern,
        "post_process": [],
    }

    log_info = LogInfo(**log_info)
    result = bg.inject_manual_logs.apply_async(
        kwargs={
            "log_info": log_info.model_dump(),
            "data": await uploaded_file.read(),
        },
        link=bg.post_work_cleanup.s(key=index_pattern, prefix="mng:log"),
        link_error=bg.post_work_cleanup.s(key=index_pattern, prefix="mng:log"),
    )

    await redis_set(
        redis_client=redis_client,
        key=index_pattern,
        obj=ManagementBackgroundTask(status="injecting", celery_task_id=result.id),
        prefix="mng:log",
    )

    await emit_update_mng_main_table(get_tbl=get_management_table_)

    return JSONResponse(
        status_code=202,
        content={"message": f"Manual {log_info.index_pattern} Log Injection Started"},
    )


# -------------------Logs EndPoints End-------------------
# Rules EndPoints:
@management_router.post("/rule/inject")
async def inject_rules2es(request: ManagementRulesRequest):
    try:
        rule_tag = request.id
        rule_status = await get_status_of_rule_injection(f"Type: {rule_tag}")

        if rule_status in ["injected", "injecting", "deleting", "re-injecting"]:
            raise HTTPException(
                status_code=409,
                detail=f"{rule_tag} Injecting action not allowed for '{rule_status}' status",
            )

        result = bg.inject_detection_rule.apply_async(
            args=[rule_tag],
            link=bg.post_work_cleanup.s(key=rule_tag, prefix="mng:rule"),
            link_error=bg.post_work_cleanup.s(key=rule_tag, prefix="mng:rule"),
        )

        await redis_set(
            redis_client=redis_client,
            key=rule_tag,
            obj=ManagementBackgroundTask(status="injecting", celery_task_id=result.id),
            prefix="mng:rule",
        )

        await emit_update_mng_main_table(get_tbl=get_management_table_)

        return JSONResponse(
            status_code=202, content={"message": f"{rule_tag} Injection started"}
        )

    except Exception as e:
        print(f"Error starting injection task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start injection: {str(e)}",
        )


@management_router.post("/rule/delete")
async def delete_rules_from_es(request: ManagementRulesRequest):
    # TODO: make this list consistent
    rule_tag = request.id
    if rule_tag not in [
        "Type: GAI_CTI_APT5",
        "Type: GAI_CTI_TI",
        "Type: GAI_CTI_SIGMA_WINDOWS",
        "Type: GAI_CTI_SIGMA_LINUX",
    ]:
        rule_id = request.id
        try:
            await delete_detection_rule_by_id(rule_id)

            await emit_update_mng_main_table(get_tbl=get_management_table_)

            return JSONResponse(
                status_code=202,
                content={"message": f"{rule_id} Deletion successfully done"},
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No rules found for source: {rule_tag} \n{e}",
            )

    rule_status = await get_status_of_rule_injection(rule_tag)

    if rule_status in ["injecting", "deleting", "re-injecting", "not injected"]:
        raise HTTPException(
            status_code=409,
            detail=f"{rule_tag} Deleting action not allowed for '{rule_status}' status",
        )

    try:
        result = bg.delete_detection_rule.apply_async(
            args=[rule_tag],
            link=bg.post_work_cleanup.s(key=rule_tag, prefix="mng:rule"),
            link_error=bg.post_work_cleanup.s(key=rule_tag, prefix="mng:rule"),
        )

        await redis_set(
            redis_client=redis_client,
            key=rule_tag,
            obj=ManagementBackgroundTask(status="deleting", celery_task_id=result.id),
            prefix="mng:rule",
        )

        await emit_update_mng_main_table(get_tbl=get_management_table_)

        return JSONResponse(
            status_code=202, content={"message": f"{rule_tag} Deletion started"}
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error during rule deletion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during rule deletion",
        )


@management_router.post("/rule/re-inject")
async def reinject_rules2es(request: ManagementRulesRequest):
    rule_tag = request.id

    # TODO: make this list consistent
    # TODO: tags have `:` and it is not good for being as Redis key
    if rule_tag not in [
        "Type: GAI_CTI_APT5",
        "Type: GAI_CTI_TI",
        "Type: GAI_CTI_SIGMA_LINUX",
        "Type: GAI_CTI_SIGMA_WINDOWS",
    ]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No rules found for source: {rule_tag}",
        )
    rule_status = await get_status_of_rule_injection(rule_tag)

    if rule_status in ["injecting", "deleting", "re-injecting", "not injected"]:
        raise HTTPException(
            status_code=409,
            detail=f"{rule_tag} Deleting action not allowed for '{rule_status}' status",
        )
    try:

        result = bg.reinject_detection_rule.apply_async(
            args=[rule_tag],
            link=bg.post_work_cleanup.s(key=rule_tag, prefix="mng:rule"),
            link_error=bg.post_work_cleanup.s(key=rule_tag, prefix="mng:rule"),
        )

        await redis_set(
            redis_client=redis_client,
            key=rule_tag,
            obj=ManagementBackgroundTask(
                status="re-injecting", celery_task_id=result.id
            ),
            prefix="mng:rule",
        )

        await emit_update_mng_main_table(get_tbl=get_management_table_)

        return JSONResponse(
            content={"message": f"{rule_tag} Re-injection started"}, status_code=202
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error during rule re-injection: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during rule re-injection",
        )


@management_router.post("/rule/cancel")
async def cancel_injecting_rule2es(request: ManagementRulesRequest):
    rule_tag = request.id

    if bgt := await redis_get(
        key=rule_tag,
        prefix="mng:rule",
        model=ManagementBackgroundTask,
    ):
        rule_status = bgt.status
        celery_task_id = bgt.celery_task_id
    else:
        raise HTTPException(status_code=404, detail=f"{rule_tag} No running task found")

    if rule_status in ["deleting", "injected", "not injected", "re-injecting"]:
        raise HTTPException(
            status_code=409,
            detail=f"{rule_tag} Canceling action not allowed for '{rule_status}' status",
        )

    bg.celery_revoke_task(id=celery_task_id)
    await redis_remove(key=rule_tag, prefix="mng:rule")

    await emit_update_mng_main_table(get_tbl=get_management_table_)

    return JSONResponse(
        status_code=200,
        content={"message": f"{rule_tag} Task cancellation requested"},
    )


@management_router.post("/rule/manual/inject")
async def inject_manual_rule(request: ManagementManualRulesRequest):
    rule = None

    if request.rule_yml:
        rule_raw = await get_rule_in_ndjson_format(request.rule_yml)
        rule = json.loads(rule_raw)
        rule["rule_id"] = str(uuid.uuid4())

    if request.rule_ndjson:
        rule_raw = request.rule_ndjson
        rule = json.loads(rule_raw)
        rule["tags"] += ["Type: GAI_CTI_MANUAL"]
        rule["enabled"] = True
        rule["rule_id"] = str(uuid.uuid4())

    if rule is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"both rule_ndjson and rule_yml can not be None at a time.",
        )

    try:
        await import_detection_rule(json.dumps(rule))
        return JSONResponse(
            status_code=202,
            content={"message": f"{rule["rule_id"]} Injection successfully done"},
        )

    except Exception as e:
        print(f"Error starting rule injection: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start injection: {str(e)}",
        )


@management_router.post("/rule/manual/preview")
async def preview_manual_rule(request: ManagementManualRulesRequest):
    if request.rule_yml:
        rule_raw = await get_rule_in_ndjson_format(request.rule_yml)
        rule = json.loads(rule_raw)
    else:
        rule = json.loads(request.rule_ndjson)
        rule["tags"] += ["Type: GAI_CTI_MANUAL"]
        rule["enabled"] = True

    rule_preview = [
        FieldWithType(key="rule_id", value=str(uuid.uuid4()), type="text"),
        FieldWithType(key="name", value=rule.get("name", ""), type="text"),
        FieldWithType(
            key="description", value=rule.get("description", ""), type="text"
        ),
        FieldWithType(key="author", value="GAI_CTI", type="text"),
        FieldWithType(key="type", value=rule.get("type", ""), type="text"),
        FieldWithType(key="language", value=rule.get("language", ""), type="text"),
        FieldWithType(key="index", value=rule.get("index", []), type="labels"),
        FieldWithType(
            key="risk_score", value=rule.get("risk_score", 50), type="number"
        ),
        FieldWithType(key="severity", value=rule.get("severity", ""), type="text"),
        FieldWithType(key="tags", value=rule.get("tags", []), type="labels"),
    ]

    return rule_preview


# -------------------Rules EndPoints End-------------------


@management_router.get("/running")
async def get_all_running_tasks() -> List[str]:
    return await redis_search(prefix="mng")


@management_router.delete("/alert/all")
async def delete_all_alerts():
    client: AsyncElasticsearch = get_es()
    status_code = 200
    message = ""
    index_pattern = ".internal.alerts-security.alerts-default-*"

    try:
        # Step 1: Get list of matching index names using the main Elasticsearch API
        indices_info = await client.indices.get(
            index=index_pattern, expand_wildcards="all"
        )

        if not indices_info:
            raise ValueError("No matching indices found.")

        # Step 2: Delete all documents in each index
        total_deleted = 0
        for idx in indices_info:
            res = await client.delete_by_query(
                index=idx,
                # Empty query deletes all documents
                body={"query": {"match_all": {}}},
                conflicts="proceed",  # Optional: handle version conflicts gracefully
            )
            total_deleted += res.get("total", 0)

        message = f"Successfully deleted {total_deleted} documents from {len(indices_info)} indices."

    except ApiError as e:
        logger.error(f"Elasticsearch API error while deleting alerts: {e}")
        status_code = 500
        message = "Failed to delete alerts"

    except Exception as e:
        logger.error(f"Unexpected error while deleting alerts: {e}")
        status_code = 500
        message = "Unknown error occurred"

    return JSONResponse(status_code=status_code, content={"message": message})


@management_router.delete("/rule/all")
async def delete_all_rules():
    try:
        result = bg.delete_all_detection_rules.apply_async(
            args=[],
            link=bg.post_work_cleanup.s(key="all", prefix="mng:rule"),
            link_error=bg.post_work_cleanup.s(key="all", prefix="mng:rule"),
        )

        await redis_set(
            redis_client=redis_client,
            key="all",
            obj=ManagementBackgroundTask(status="deleting", celery_task_id=result.id),
            prefix="mng:rule",
        )

        await emit_update_mng_main_table(get_tbl=get_management_table_)

        return JSONResponse(
            status_code=202, content={"message": f"All rules Deletion started"}
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error during all rules deletion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during all rules deletion",
        )


@management_router.delete("/log/all")
async def delete_all_logs():
    index_pattern = "log-*"
    all_indexes_name_list = await get_all_logSTAR_indices()
    for index_name in all_indexes_name_list:
        index_status = await get_status_of_log_injection(index_pattern)
        if index_status in ["injecting", "re-injecting", "not injected", "deleting"]:
            all_indexes_name_list.pop(all_indexes_name_list.index(index_name))

    result = bg.delete_all_indexes_bulk.apply_async(
        args=[all_indexes_name_list],
        link=bg.post_work_cleanup.s(
            key=index_pattern.replace("*", "STAR"), prefix="mng:log"
        ),
        link_error=bg.post_work_cleanup.s(
            key=index_pattern.replace("*", "STAR"), prefix="mng:log"
        ),
    )

    await redis_set(
        redis_client=redis_client,
        key=index_pattern.replace("*", "STAR"),
        obj=ManagementBackgroundTask(status="deleting", celery_task_id=result.id),
        prefix="mng:log",
    )

    await emit_update_mng_main_table(get_tbl=get_management_table_)

    return JSONResponse(
        status_code=202, content={"message": f"All Logs Deletion started"}
    )


@management_router.get("/injected-iocs")
async def get_injected_iocs():
    injected_iocs = await redis_search_objects(
        prefix="mng:injected-iocs", model=InjectedIOCsCache
    )
    content = (
        {k.split(":")[-1]: v.model_dump() for k, v in injected_iocs.items()}
        if injected_iocs
        else dict()
    )

    return JSONResponse(
        status_code=200,
        content=content,
    )


@management_router.get("/explain/llm", response_model=str)
async def get_llm_used_for_explain() -> str:
    if llm_settings := await redis_get(
        key="llm",
        prefix="settings",
        model=LLMSettings,
    ):
        return llm_settings.explain_llm
    else:
        return "DEFAULT"


@management_router.patch("/explain/llm", response_model=str)
async def set_llm_used_for_explain(payload: ExplainLLMUpdateRequest) -> str:
    if payload.llm not in available_llms:
        raise HTTPException(status_code=400, detail="Invalid LLM")

    await redis_set(
        key="llm",
        obj=LLMSettings(explain_llm=payload.llm),
        prefix="settings",
    )

    return payload.llm
