import gzip
from pathlib import Path
from typing import Any, Dict, List

import aiofiles
import orjson
from async_lru import alru_cache

from ..opencti.intrusion_sets import get_adversary_info_by_id


@alru_cache(maxsize=1, ttl=3600)
async def get_adversary_profiles() -> List[Dict[str, Any]]:
    path1 = Path("./artifacts/group_profiles.json.gz")
    path2 = Path("../artifacts/group_profiles.json.gz")

    if path1.exists():
        path = path1
    elif path2.exists():
        path = path2
    else:
        raise FileNotFoundError("group_profiles.json.gz")

    async with aiofiles.open(path, "rb") as f:
        content = await f.read()

    return orjson.loads(gzip.decompress(content))


@alru_cache(maxsize=1000, ttl=3600)
async def get_adversary_profile(_id: str) -> Dict[str, Any]:
    if "intrusion" in _id:
        for profile in await get_adversary_profiles():
            if profile["id"] == _id:
                return profile
    try:
        profile = await get_adversary_info_by_id(_id)
        return profile
    except:
        raise KeyError(f"Adversary ID not found {_id=}")
