from typing import Dict, List, Optional, Type, TypeVar

from pydantic import BaseModel
from redis.asyncio import Redis

from ..conf import auth_redis_conn_info, redis_conn_info

T = TypeVar("T", bound=BaseModel)


def get_auth_redis_client():
    return Redis(**auth_redis_conn_info)


def get_redis_client():
    return Redis(**redis_conn_info)


async def redis_get(
    key: str,
    model: Type[T],
    prefix: str,
    redis_client: Optional[Redis] = None,
) -> Optional[T]:
    redis_client = redis_client or get_redis_client()
    full_key = f"{prefix}:{key}" if prefix else key
    if raw := await redis_client.get(full_key):
        return model.model_validate_json(raw)
    return None


async def redis_set(
    key: str,
    obj: T,
    prefix: str,
    redis_client: Optional[Redis] = None,
):
    redis_client = redis_client or get_redis_client()

    full_key = f"{prefix}:{key}" if prefix else key
    await redis_client.set(full_key, obj.model_dump_json())


async def redis_search(
    prefix: str,
    redis_client: Optional[Redis] = None,
) -> List[str]:
    redis_client = redis_client or get_redis_client()

    pattern = f"{prefix}:*" if prefix else "*"
    keys = await redis_client.keys(pattern)
    return [key.decode("utf-8") if isinstance(key, bytes) else key for key in keys]


async def redis_search_objects(
    prefix: str,
    model: Type[T],
    redis_client: Optional[Redis] = None,
) -> Dict[str, T]:

    keys = await redis_search(prefix, redis_client)
    results = {}

    for key in keys:
        if obj := await redis_get(key, model, "", redis_client):
            results[key] = obj

    return results


async def redis_remove(
    key: str,
    prefix: str = "",
    redis_client: Optional[Redis] = None,
) -> None:
    redis_client = redis_client or get_redis_client()
    full_key = f"{prefix}:{key}" if prefix else key
    return await redis_client.delete(full_key)
