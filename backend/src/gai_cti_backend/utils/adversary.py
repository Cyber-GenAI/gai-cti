from logging import getLogger
from typing import Dict, List

import aiofiles
import orjson
from async_lru import alru_cache

from ..elastic_client.rule import get_all_rules
from ..models.home import (
    IntrusionSets2IoCCache,
    IntrusionSetsIoCInfo,
    Top10AdversariesWithIoC,
)
from ..utils import get_all_ttps, redis_get
from ..utils.miscellaneous import get_valid_path
from ..utils.ti import get_adversary_specificity

logger = getLogger(__name__)


async def get_adversary_statistics() -> Dict[str, int]:
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

    return {"adv_with_indicator": adv_with_ioc, "adv_with_sig": adv_with_sig}


# TODO: move to tools
async def create_mostly_used_ttps_metadata_file():
    specificity_data = await get_adversary_specificity()

    ttps_specs_list = [ttps_specs for ttps_specs in specificity_data.values()]
    all_ttps_names = ttps_specs_list[0].keys()

    # If a TTP is not used for more then 140 adversaries, it is not useful for us
    # It will be 27 ttps at the end
    used_ttps: Dict[str, float] = {}
    for ttp_name in all_ttps_names:
        remove_the_ttp = False
        threshold = 140
        ttp_specificity = 0
        for specificity in ttps_specs_list:
            if specificity[ttp_name] == 0:
                threshold -= 1
                if threshold < 0:
                    remove_the_ttp = True
                    break
                else:
                    ttp_specificity += specificity[ttp_name]
                    continue
            else:
                ttp_specificity += specificity[ttp_name]
                continue
        else:
            if not remove_the_ttp:
                used_ttps[ttp_name] = ttp_specificity

    async with aiofiles.open(
        get_valid_path("artifacts/mostly_used_ttps.json"), "wb"
    ) as f:
        await f.write(orjson.dumps(used_ttps))


@alru_cache(ttl=36000)
async def get_used_ttps_names():
    async with aiofiles.open(
        get_valid_path("artifacts/mostly_used_ttps.json"), "r"
    ) as f:
        ttps = orjson.loads(await f.read())

    return ttps


async def create_used_ttps_for_each_adversary_metadata_file():
    specificity_data = await get_adversary_specificity()

    ttps_specs_list = [ttps_specs for ttps_specs in specificity_data.values()]
    all_ttps_names = ttps_specs_list[0].keys()
    all_adversary_names = specificity_data.keys()

    used_ttps_of_each_adversary: Dict[str, List[str]] = {}

    for adv_name in all_adversary_names:
        used_ttps = []
        for ttp_name in all_ttps_names:
            if specificity_data[adv_name][ttp_name] > 0:
                used_ttps.append(ttp_name)

        used_ttps_of_each_adversary[adv_name] = used_ttps

    async with aiofiles.open(
        get_valid_path("artifacts/used_ttps_of_each_adversary.json"), "wb"
    ) as f:
        await f.write(orjson.dumps(used_ttps_of_each_adversary))


async def get_used_ttps_of_each_adversary() -> Dict[str, List[str]]:
    async with aiofiles.open(
        get_valid_path("artifacts/used_ttps_of_each_adversary.json"), "rb"
    ) as f:
        used_ttps_of_each_adversary = orjson.loads(await f.read())
    return used_ttps_of_each_adversary


async def get_rules_per_adversary():
    all_ttps = await get_all_ttps()
    used_ttps_for_each_adv = await get_used_ttps_of_each_adversary()

    specificity_data = await get_adversary_specificity()
    all_adversary_names = specificity_data.keys()

    result: Dict[str, set] = {}

    for ttp_name in all_ttps:
        result[ttp_name] = set()

    json_responses = await get_all_rules()

    for json_response in json_responses:
        for rule in json_response["data"]:
            for TTP in rule["threat"]:
                for technique in TTP["technique"]:
                    if f"{TTP['tactic']['id']}/{technique["id"]}" in result:
                        result[f"{TTP['tactic']['id']}/{technique["id"]}"].add(
                            rule["rule_id"]
                        )
                    # else:
                    #     result[f"{TTP['tactic']['id']}/{technique["id"]}"] = 1

    rules_per_adversary: Dict[str, list] = {}

    for adv_name in all_adversary_names:
        rules = set()
        for ttp_name in used_ttps_for_each_adv[adv_name]:
            if not ttp_name in result:
                logger.warning(
                    f"inconsistent artifact files, {adv_name=} has {ttp_name=} that is not present in all_ttps.json"
                )

            rules.update(result.get(ttp_name, []))

        rules_per_adversary[adv_name] = list(rules)

    return rules_per_adversary


async def get_10_top_ioc_count_per_adversary() -> List[IntrusionSetsIoCInfo]:
    data = await redis_get(
        key="top_10_adversaries_with_ioc",
        prefix="home",
        model=Top10AdversariesWithIoC,
    )
    assert data is not None
    return data.root
