from typing import Any, Dict, List

from async_lru import alru_cache

from ..utils import redis_remove
from .utils import client, get_es


@alru_cache(maxsize=100, ttl=10)
async def get_total_count_of_index(index_pattern: str) -> int:
    es = get_es()
    try:
        response = await es.count(index=index_pattern, expand_wildcards="all")
        total_count = response["count"]
    except Exception:
        total_count = 0
    await es.close()
    return total_count


@alru_cache(maxsize=1, ttl=10)
async def get_all_indices() -> List[str]:
    es = get_es()
    indices = await es.indices.get_alias(index="*")
    indices = [index for index in indices.keys() if not index.startswith(".")]
    await es.close()
    return indices


@alru_cache(maxsize=1, ttl=10)
async def get_all_logSTAR_indices() -> List[str]:
    es = get_es()
    indices = await es.indices.get_alias(index="log-*")
    indices = [index for index in indices.keys()]
    await es.close()
    return indices


async def get_index_data_by_index_pattern(index_pattern: str) -> Dict[str, Any]:
    index_name = index_pattern[:-1]
    es = get_es()
    index = await es.indices.get(index=index_pattern)
    index_creation_date = index[index_name]["settings"]["index"]["creation_date"]
    index_data = {
        "index_pattern": index_pattern,
        "index_name": index_name,
        "creation_date": index_creation_date,
    }
    await es.close()
    return index_data


async def is_index_pattern_exists(index_pattern: str) -> bool:
    es = get_es()
    try:
        indices = await es.indices.get(index=index_pattern, expand_wildcards="all")
        exists = len(indices) > 0
    except Exception:
        exists = False
    await es.close()
    return exists


async def delete_index(index_pattern: str) -> None:
    es = get_es()
    await es.cluster.put_settings(
        body={"transient": {"action.destructive_requires_name": False}}
    )
    await es.indices.delete(index=index_pattern, expand_wildcards="all")

    try:
        index_pattern = index_pattern.replace("*", "STAR")
        await redis_remove(prefix="mng:injected-iocs", key=index_pattern)
    except:
        pass

    await es.close()


async def delete_indexes_bulk(index_patterns: List[str]) -> None:
    url = f"/api/index_management/indices/delete"
    data = {"indices": index_patterns}
    response = await client.post(url, json=data, timeout=600)
    response.raise_for_status()
    return response
