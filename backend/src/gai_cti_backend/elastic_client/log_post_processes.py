import random
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Callable, Dict, List, Tuple

import aiofiles
import orjson
import pytz
from async_lru import alru_cache

from ..models.management import AdversaryIocCache, LogInfo, LogMetadata
from ..utils import redis_get, redis_set

# Import the global variable functions from the new module
from .utils import get_es
from .utils import injected_iocs_tracker as ioc_tracker


@alru_cache(maxsize=1, ttl=3600)
async def load_metadata_file(path: Path) -> Dict[str, LogMetadata]:
    async with aiofiles.open(path / "metadata.json", "r") as f:
        content = await f.read()

    metadata = orjson.loads(content)
    return {k: LogMetadata(**v) for k, v in metadata.items()}


async def get_metadata(path: Path, index_name: str) -> LogMetadata:
    metadata = await load_metadata_file(path)
    if index_name not in metadata:
        raise ValueError(f"Metadata for index {index_name} not found")
    return metadata[index_name]


@alru_cache(maxsize=1, ttl=3600)
async def get_malicious_ips(size: int) -> List[str]:
    es = get_es()
    res = await es.search(
        index="opencti*",
        body={
            "query": {
                "query_string": {"query": "threatintel.indicator.type:ipv4-addr"}
            },
            "size": size,
        },
    )
    ips_list = [
        intel["_source"]["threatintel"]["indicator"]["ip"][0]
        for intel in res["hits"]["hits"]
    ]
    await es.close()
    return ips_list


@alru_cache(maxsize=1, ttl=3600)
async def get_malicious_domains(size: int) -> List[str]:
    es = get_es()
    res = await es.search(
        index="opencti*",
        body={
            "query": {
                "query_string": {"query": "threatintel.indicator.type:domain-name"}
            },
            "size": size,
        },
    )
    domains_list = [
        intel["_source"]["threatintel"]["indicator"]["domain"][0]
        for intel in res["hits"]["hits"]
    ]
    await es.close()
    return domains_list


@alru_cache(maxsize=1, ttl=3600)
async def get_malicious_urls(size: int) -> List[str]:
    es = get_es()
    res = await es.search(
        index="opencti*",
        body={
            "query": {"query_string": {"query": "threatintel.indicator.type:url"}},
            "size": size,
        },
    )
    url_list = [
        intel["_source"]["threatintel"]["indicator"]["url"]["full"][0]
        for intel in res["hits"]["hits"]
    ]
    await es.close()
    return url_list


type Discriminator = str
type IocType = str

ioc_place_to_inject: Dict[IocType, Tuple[Callable, Discriminator]] = {
    "ips": (get_malicious_ips, "destination.ip"),
    "urls": (get_malicious_urls, "url.full"),
    "domains": (get_malicious_domains, "destination.domain"),
}


async def inject_malicious_ioc(
    log: Dict[str, Any],
    **kwargs: Any,
) -> Dict[str, Any]:  # TODO figure out why we get more than expected alerts
    if random.random() < 0.50:
        return log

    possible_iocs: List[IocType] = []
    for ioc_type, (_, discriminator) in ioc_place_to_inject.items():
        d = log
        discriminator = discriminator.split(".")
        for key in discriminator[:-1]:
            if key not in d:
                break
            d = d[key]
        else:
            possible_iocs.append(ioc_type)

    if not possible_iocs:
        return log

    ioc_type = random.choice(possible_iocs)
    if ioc_tracker.is_limit_exceeded(ioc_type):
        return log

    place_to_inject = ioc_place_to_inject[ioc_type][1].split(".")
    ioc_to_inject = ioc_place_to_inject[ioc_type][0]
    value_to_inject = random.choice(await ioc_to_inject(size=70))

    # inject the value into the log
    d = log
    for key in place_to_inject[:-1]:
        d = d[key]
    d[place_to_inject[-1]] = value_to_inject

    ioc_tracker.add_to_collected_ioc_data(ioc_type, value_to_inject)

    return log


adversary_ioc_place_to_inject: Dict[IocType, Discriminator] = {
    "ips": "destination.ip",
    "urls": "url.full",
    "domains": "destination.domain",
}


async def inject_adversary_ioc(
    log: Dict[str, Any] = None,
    **kwargs: Any,
) -> Dict[str, Any]:
    if random.random() < 0.50:
        return log

    ioc_table: Dict[IocType, List] = {"ips": [], "urls": [], "domains": []}

    adv_iocs = await redis_get(
        prefix="mng:adv_ioc", key="adv_ioc_data", model=AdversaryIocCache
    )
    ioc_table = adv_iocs.model_dump()
    ioc_table.pop("adversary_id")

    ioc_counts = sum([len(ioc_table[itype]) for itype in ioc_table])

    if ioc_counts == 0:
        return log

    possible_iocs: List[IocType] = []
    for ioc_type, discriminator in adversary_ioc_place_to_inject.items():
        d = log
        discriminator = discriminator.split(".")
        for key in discriminator[:-1]:
            if key not in d:
                break
            d = d[key]
        else:
            possible_iocs.append(ioc_type)

    if not possible_iocs:
        return log

    for ioc_type, ioc_list in ioc_table.items():
        if (len(ioc_list) == 0) and (ioc_type in possible_iocs):
            possible_iocs.remove(ioc_type)

    if not possible_iocs:
        return log

    ioc_type = random.choice(possible_iocs)
    if ioc_tracker.is_limit_exceeded(ioc_type):
        return log

    place_to_inject = adversary_ioc_place_to_inject[ioc_type].split(".")
    value_to_inject = random.choice(ioc_table[ioc_type])
    # Remove the value from the list and set to Redis to prevent multiple times injection
    ioc_table[ioc_type].remove(value_to_inject)
    obj = AdversaryIocCache(
        adversary_name=adv_iocs.adversary_name,
        adversary_id=adv_iocs.adversary_id,
        ips=ioc_table["ips"],
        domains=ioc_table["domains"],
        urls=ioc_table["urls"],
    )
    await redis_set(obj=obj, prefix="mng:adv_ioc", key="adv_ioc_data")

    # inject the value into the log
    d = log
    for key in place_to_inject[:-1]:
        d = d[key]
    d[place_to_inject[-1]] = value_to_inject

    ioc_tracker.add_to_collected_ioc_data(ioc_type, value_to_inject)

    return log


async def update_timestamp(
    log: Dict[str, Any],
    log_info: LogInfo,
    index_name_from_file_name: str,
    **kwargs: Any,
) -> Dict[str, Any]:
    metadata = await get_metadata(
        Path(log_info.dir), index_name_from_file_name + ".json.tar.gz"
    )

    tehran_tz = pytz.timezone("Asia/Tehran")

    log_timestamp = datetime.fromisoformat((log["@timestamp"])).astimezone(tehran_tz)
    now = datetime.now(tehran_tz)
    delta: timedelta = now - metadata.max.astimezone(tehran_tz)
    updated_timestamp = log_timestamp + delta
    log["@timestamp"] = updated_timestamp.astimezone(tehran_tz).strftime(
        "%Y-%m-%dT%H:%M:%S%z"
    )

    return log


func_map = {
    "inject_malicious_ioc": inject_malicious_ioc,
    "update_timestamp": update_timestamp,
    "inject_adversary_ioc": inject_adversary_ioc,
    # Add other functions here
    # "another_function": another_function,
}


async def process_log(
    log: Dict[str, Any],
    post_process: List[str],
    log_info: LogInfo,
    index_name_from_file_name: str,
) -> Dict[str, Any]:
    for func_name in post_process:
        log = await func_map[func_name](
            log=log,
            log_info=log_info,
            index_name_from_file_name=index_name_from_file_name,
        )
    return log
