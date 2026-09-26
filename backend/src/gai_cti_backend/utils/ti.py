from functools import lru_cache
from itertools import product
from pathlib import Path
from typing import Dict, List, Tuple

import aiofiles
import orjson
from async_lru import alru_cache

from ..elastic_client.utils import get_es
from ..models.adversary import AdversaryName, SpecificityScore
from ..models.ti import TTP, Count, Tactic, Technique
from ..utils.miscellaneous import get_valid_path

NUMBER_TO_MONTH = {
    1: "January",
    2: "February",
    3: "April",
    4: "March",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
}


@alru_cache(ttl=36000)
async def get_adversary_specificity() -> (
    Dict[AdversaryName, Dict[TTP, SpecificityScore]]
):

    async with aiofiles.open(
        get_valid_path("artifacts/rules/specificity.json"), mode="r"
    ) as f:
        content = await f.read()
    specificity_data = orjson.loads(content)
    return specificity_data


@alru_cache(ttl=3600)
async def get_all_ttps() -> Dict[TTP, Count]:
    async with aiofiles.open(
        get_valid_path("artifacts/rules/all_ttps.json"), mode="r"
    ) as f:
        content = await f.read()
    ttps_data = orjson.loads(content)
    return ttps_data


@lru_cache()
def get_all_ttps_sync() -> Dict[TTP, Count]:
    with open(get_valid_path("artifacts/rules/all_ttps.json"), mode="r") as f:
        content = f.read()
    ttps_data = orjson.loads(content)
    return ttps_data


def gen_all_valid_ttps(
    tactics: List[Tactic],
    techniques: List[Technique],
) -> List[Tuple[Tactic, Technique, TTP]]:
    valid_ttps = get_all_ttps_sync()
    results = []
    for tactic, technique in product(tactics, techniques):
        ttp: TTP = f"{tactic.upper()}/{technique.upper()}"
        if ttp in valid_ttps:
            results.append((tactic, technique, ttp))

    return results


async def get_all_malicious_ips():
    """
    Fetch all malicious IPs from Elasticsearch.
    """

    es_client = get_es()
    size = 10000
    try:
        responses = []
        request_body = {
            "size": size,
            "_source": ["threatintel.indicator.ip"],
            "query": {"exists": {"field": "threatintel.indicator.ip"}},
        }
        response = await es_client.search(
            index="opencti-indicators*", scroll="1m", body=request_body
        )
        responses.append(response.body)
        remaining_requests = response["hits"]["total"]["value"] // size

        scroll_id = response["_scroll_id"]
        # making the remaining requests
        for _ in range(remaining_requests):
            request_body = {"scroll": "1m", "scroll_id": scroll_id}
            response = await es_client.scroll(body=request_body)
            scroll_id = response["_scroll_id"]
            responses.append(response.body)

        ips = set()
        for response in responses:
            for data in response["hits"]["hits"]:
                ips.add(data["_source"]["threatintel"]["indicator"]["ip"][0])
        return ips

    except Exception as e:
        logger.error(f"Failed to fetch malicious IPs. Error: {e}")
        raise e


async def get_all_malicious_domains():
    pass
