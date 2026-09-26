from logging import getLogger
from typing import Annotated, Dict, List, Literal

import httpx
from celery import Task
from fastapi import APIRouter, Depends, HTTPException, Response
from httpx import BasicAuth
from redis.asyncio import Redis

from ..background.apt_detection import (
    run_apt_detection,
    update_adversary_side_bar,
    update_rule_per_adversary,
)
from ..background.feed import (
    set_connectors_dir_name2connector_name,
    set_connectors_with_cached,
    update_feed_dashboard,
    update_map_organizations2connectors,
)
from ..background.home import (
    get_10_top_ioc_count_per_adversary,
    get_alerts_stats,
    system_stats_init,
    update_ioc_count_by_intrusion,
)
from ..background.ip_by_region import update_map_data
from ..background.rules import update_raw_rules
from ..background.ti import update_ti_feeds, update_ti_top_dashboard, update_ti_types
from ..conf import kibana_conn_info, redis_conn_info
from ..elastic_client.utils import get_es
from ..llm_agent.utils import available_llms
from ..models.home import LoginInfoCache
from ..utils import apply_auth, get_redis_client, redis_set

logger = getLogger(__name__)

CACHE_KEYS: Dict[str, Task] = {
    "ti:top_dashboard": update_ti_top_dashboard,
    "ti:feeds_name2id": update_ti_feeds,
    "ti:indicator_types": update_ti_types,
    "feed:connector_dir_name_to_connector_name": set_connectors_dir_name2connector_name,
    "feed:organizations2connectors": update_map_organizations2connectors,
    "feed:all_connector_objects": set_connectors_with_cached,
    "feed:top_dashboard": update_feed_dashboard,
    "adv:adversary_detection_results": run_apt_detection,
    "adv:rule_per_adversary": update_rule_per_adversary,
    "adv:side_bar_cache": update_adversary_side_bar,
    "home:map_data": update_map_data,
    "home:system": system_stats_init,
    "home:alerts_stats": get_alerts_stats,
    "home:intrusion:intrusion2ioc": update_ioc_count_by_intrusion,
    "home:top_10_adversaries_with_ioc": get_10_top_ioc_count_per_adversary,
    "rule:raw_rules": update_raw_rules,
}

utils_router = APIRouter()

# TODO: cache this token with a better expiration policy
# TODO: add proper security policy {"role_descriptors":{...}, "expiration": "1d"}

API_KEY_NAME = "API-key-for-front"


@utils_router.get("/es-token", response_model=Dict[str, str])
async def get_elastic_token(_: Annotated[str, Depends(apply_auth)]):
    await redis_set(key="info", prefix="login", obj=LoginInfoCache())
    result = {}
    redis_client = Redis(**redis_conn_info)
    auth = BasicAuth(kibana_conn_info["username"], kibana_conn_info["password"])
    headers = {"kbn-xsrf": "true"}  # kibana's required header
    token = await redis_client.get("es-token")
    if token:
        result["encoded"] = token
    else:
        try:
            es_client = get_es()

            response = await es_client.search(
                index=".security-7", body={"query": {"term": {"name": API_KEY_NAME}}}
            )
            data = response.body["hits"]["hits"]
            async with httpx.AsyncClient(verify=False) as client:
                for api_key in data:
                    id = api_key["_id"]
                    body = {
                        "apiKeys": [{"name": API_KEY_NAME, "id": id}],
                        "isAdmin": True,
                    }
                    response_invalidate = await client.post(
                        url=f"{kibana_conn_info['url']}/internal/security/api_key/invalidate",
                        json=body,
                        auth=auth,
                        headers=headers,
                    )
                    response_invalidate.raise_for_status()

                response_create = await es_client.security.create_api_key(
                    body={"name": API_KEY_NAME}
                )
                token = response_create["encoded"]
                await redis_client.set(name="es-token", value=token)

                result["encoded"] = token

        except Exception as e:
            raise HTTPException(
                detail={"error": str(e)},
                status_code=500,
            )

    return result


@utils_router.get("/system-available", response_model=bool)
async def check_available_cache(response: Response):
    redis_client = get_redis_client()
    not_meet_conditions = [
        key for key in CACHE_KEYS if not (await redis_client.exists(key))
    ]

    if not_meet_conditions:
        raise HTTPException(
            status_code=503,
            detail="System is initializing, please try again later.",
            headers={"X-Reason": ",".join(not_meet_conditions)},
        )
    else:
        response.headers["X-Reason"] = ",".join(not_meet_conditions)
        return True


@utils_router.get("/available-llms", response_model=List[str])
async def get_available_llms(_: Annotated[str, Depends(apply_auth)]) -> List[str]:
    return available_llms
