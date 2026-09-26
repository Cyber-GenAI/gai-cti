import asyncio
import heapq
import random
from io import BytesIO
from itertools import islice
from pathlib import Path
from typing import Any, AsyncGenerator, BinaryIO, Dict, List

import aiofiles
import httpx
import orjson

from ..elastic_client.index import delete_index as es_delete_index
from ..elastic_client.index import delete_indexes_bulk
from ..elastic_client.log import ship_json_logs2es, ship_user_uploaded_logs2es
from ..elastic_client.rule import (
    delete_all_detection_rules_bulk,
    delete_detection_rules_by_tag_bulk,
    get_all_rules,
    import_detection_rule,
)
from ..models.home import IntrusionSets2IoCCache
from ..models.management import AdversaryIocCache, LogInfo
from ..opencti.indicator import get_indicators_by_id_bulk
from ..routes.management import get_management_table_
from ..socket_handler.emitters import emit_update_mng_main_table
from ..utils import get_rules_path_list, redis_get, redis_remove, redis_set
from .celery_worker import celery_task


async def inject_logs_async(log_info: LogInfo):
    # try:
    if "inject_adversary_ioc" in log_info.post_process:
        await choose_adversary_to_inject_with_ioc_async()
    await ship_json_logs2es(log_info)


# except Exception as e:
#     print(f"Error injecting log {log_info.index_pattern}: {e}")


async def inject_manual_logs_async(log_info: LogInfo, file: BinaryIO):
    try:
        await ship_user_uploaded_logs2es(log_info, file)
    except Exception as e:
        print(f"Error injecting Manual Log {log_info.index_pattern}: {e}")


async def delete_index_async(index_pattern: str):
    try:
        await es_delete_index(index_pattern)
        # if not wait then the status wrongly shows "injected"
        await asyncio.sleep(5)
    except Exception as e:
        print(f"Error deleting index {index_pattern}: {e}")


async def delete_all_indexes_bulk_async(index_patterns_list: List[str]):
    try:
        await delete_indexes_bulk(index_patterns_list)
    except Exception as e:
        print(f"Error deleting all indexes: {e}")


async def reinject_logs_async(log_info: LogInfo):
    try:
        await es_delete_index(log_info.index_pattern)
        await ship_json_logs2es(log_info)
    except Exception as e:
        print(f"Error during re-injection of {log_info.index_pattern}: {e}")


async def _read_json_file(path: Path) -> dict:
    async with aiofiles.open(path.as_posix(), mode="r") as f:
        content = await f.read()

    rule = orjson.loads(content)
    rule["interval"] = "12h"
    rule["meta"] = {}
    rule["meta"]["from"] = "120h"  # 5 days
    rule["from"] = "now-475200s"
    rule["enabled"] = True

    return rule


async def _batch_files(
    paths: List[Path], size: int = 100
) -> AsyncGenerator[List[dict], None]:
    """Read JSON files in batches"""
    file_iter = (_read_json_file(path) for path in paths)
    while True:
        batch = list(islice(file_iter, size))
        if not batch:
            break
        yield await asyncio.gather(*batch)


async def inject_detection_rule_async(rule_tag: str):
    rules_paths = await get_rules_path_list(rule_tag)
    try:
        async for batch in _batch_files(rules_paths, 10):
            try:
                ndjson_str = "\n".join(
                    orjson.dumps(item).decode("utf-8") for item in batch
                )
                await import_detection_rule(ndjson_str)
                await asyncio.sleep(10)

            except httpx.HTTPStatusError as e:
                status_code = e.response.status_code
                response_text = e.response.text
                error_msg = f"HTTP error {status_code}: {response_text}"
                print(error_msg)

            except Exception as e:
                error_msg = f"Unexpected error processing a batch of rules to inject, Error: {str(e)}"
                print(error_msg)

    except Exception as e:
        error_msg = f"Unexpected error processing rule_tag {rule_tag}, Error: {str(e)}"
        print(error_msg)


async def delete_detection_rule_async(rule_tag: str):
    try:

        await delete_detection_rules_by_tag_bulk(rule_tag)
    except Exception as e:
        print(f"Error deleting rule {rule_tag}: {e}")


async def delete_all_detection_rules_async():
    try:
        await delete_all_detection_rules_bulk()
    except Exception as e:
        print(f"Error deleting all rules: {e}")


async def reinject_detection_rule_async(rule_tag: str):
    try:
        await delete_detection_rules_by_tag_bulk(rule_tag)
        await inject_detection_rule_async(rule_tag)
    except Exception as e:
        print(f"Error during re-injection of {rule_tag}: {e}")


async def choose_adversary_to_inject_with_ioc_async(number_of_iocs: int = 500):
    type Discriminator = str
    type IocType = str

    ioc_table: Dict[IocType, List] = {"ips": [], "urls": [], "domains": []}

    all_intrusions = await redis_get(
        key="intrusion2ioc",
        prefix="home:intrusion",
        model=IntrusionSets2IoCCache,
    )

    assert all_intrusions is not None

    intrusion_to_inject = heapq.nlargest(
        n=1,
        iterable=all_intrusions.data,
        key=lambda x: len(x.relational_iocs),
    )[0]

    iocs_of_intrusion = random.choices(
        [ioc["id"] for ioc in intrusion_to_inject.relational_iocs], k=number_of_iocs
    )
    indicators_data = await get_indicators_by_id_bulk(iocs_of_intrusion)

    for indicator_data in indicators_data:
        ioc_pattern = indicator_data["indicator_pattern"].split("=")[0]
        if "hash" in ioc_pattern:
            continue
        else:
            if "name" in ioc_pattern:
                ioc_table["domains"].append(
                    str(indicator_data["indicator_pattern"].split("=")[1][2:-2])
                )
            elif "url" in ioc_pattern:
                ioc_table["urls"].append(
                    str(indicator_data["indicator_pattern"].split("=")[1][2:-2])
                )
            else:
                ioc_table["ips"].append(
                    str(indicator_data["indicator_pattern"].split("=")[1][2:-2])
                )

    obj = AdversaryIocCache(
        ips=ioc_table["ips"],
        domains=ioc_table["domains"],
        urls=ioc_table["urls"],
        adversary_id=intrusion_to_inject.id,
        adversary_name=intrusion_to_inject.name,
    )

    await redis_set(prefix="mng:adv_ioc", key="adv_ioc_data", obj=obj)


@celery_task(soft_time_limit=10_000, time_limit=10_005)
def inject_logs(log_info: Dict):
    log_info_model = LogInfo(**log_info)
    asyncio.run(inject_logs_async(log_info_model))


@celery_task()
def inject_manual_logs(log_info: Dict, data: bytes):
    log_info_model = LogInfo(**log_info)
    file = BytesIO(data)
    asyncio.run(inject_manual_logs_async(log_info_model, file))


@celery_task()
def delete_index(index_pattern: str):
    asyncio.run(delete_index_async(index_pattern))


@celery_task()
def delete_all_indexes_bulk(index_patterns_list: List[str]):
    asyncio.run(delete_all_indexes_bulk_async(index_patterns_list))


@celery_task()
def reinject_logs(log_info: Dict):
    log_info_model = LogInfo(**log_info)
    asyncio.run(reinject_logs_async(log_info_model))


@celery_task(soft_time_limit=10_000, time_limit=10_005)
def inject_detection_rule(rule_tag: str):
    asyncio.run(inject_detection_rule_async(rule_tag))
    asyncio.run(get_all_rules(renew_cache=True))


@celery_task()
def delete_detection_rule(rule_tag: str):
    asyncio.run(delete_detection_rule_async(rule_tag))
    asyncio.run(get_all_rules(renew_cache=True))


@celery_task()
def delete_all_detection_rules():
    asyncio.run(delete_all_detection_rules_async())
    asyncio.run(get_all_rules(renew_cache=True))


@celery_task()
def reinject_detection_rule(rule_tag: str):
    asyncio.run(reinject_detection_rule_async(rule_tag))
    asyncio.run(get_all_rules(renew_cache=True))


@celery_task()
def post_work_cleanup(*_, key: str, prefix: str):
    async def helper():
        await redis_remove(key=key, prefix=prefix)
        await emit_update_mng_main_table(get_tbl=get_management_table_)
        if "rule" in prefix:
            await get_all_rules(renew_cache=True)

    asyncio.run(helper())
