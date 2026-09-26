from typing import Tuple

import httpx
import urllib3
from elasticsearch8 import AsyncElasticsearch

from ...conf import elastic_conn_info, kibana_conn_info

KIBANA_URL = kibana_conn_info["url"]
ELASTIC_USER = kibana_conn_info["username"]
ELASTIC_PASSWORD = kibana_conn_info["password"]

client = httpx.AsyncClient(
    base_url=KIBANA_URL,
    auth=(ELASTIC_USER, ELASTIC_PASSWORD),
    headers={"kbn-xsrf": "true"},
    timeout=6000.0,
)


def get_es() -> AsyncElasticsearch:
    urllib3.disable_warnings()
    es = AsyncElasticsearch(
        [elastic_conn_info["url"]],
        basic_auth=(elastic_conn_info["username"], elastic_conn_info["password"]),
        verify_certs=False,
        ssl_show_warn=False,
        timeout=6000.0,
    )

    return es


async def is_es_ready(
    es: AsyncElasticsearch, cpu_threshold: float = 80.0, timeout: str = "30s"
) -> Tuple[bool, str]:
    health = await es.cluster.health(wait_for_status="yellow", timeout=timeout)
    status = health.get("status")

    if status not in ("green", "yellow"):
        return False, f"status is {status}"

    stats = await es.cluster.stats()
    process_cpu = (
        stats.get("nodes", {}).get("process", {}).get("cpu", {}).get("percent", -1)
    )

    if process_cpu >= cpu_threshold:
        return False, f"cpu_percent is {process_cpu}"

    return True, ""


async def is_kibana_ready(
    max_event_loop_delay: float = 500.0,  # milliseconds
    max_heap_usage_ratio: float = 0.8,  # 80% heap limit
    max_load_1m: float = 20.0,  # load avg threshold
    timeout: float = 10.0,
) -> tuple[bool, str]:
    """
    Check if Kibana is ready. Returns (True, "OK") if healthy,
    else (False, reason).
    """
    KIBANA_URL = kibana_conn_info["url"]
    ELASTIC_USER = kibana_conn_info["username"]
    ELASTIC_PASSWORD = kibana_conn_info["password"]

    try:
        async with httpx.AsyncClient(
            base_url=KIBANA_URL,
            auth=(ELASTIC_USER, ELASTIC_PASSWORD),
            headers={"kbn-xsrf": "true"},
            timeout=timeout,
            verify=False,
        ) as client:
            resp = await client.get("/api/status")
            if resp.status_code != 200:
                return False, f"HTTP {resp.status_code}: Failed to get /api/status"

            status = resp.json()

            # 1. Overall
            overall = status.get("status", {}).get("overall", {})
            if overall.get("level") != "available":
                return False, f"Overall status is {overall.get('level')}"

            # 2. Core services
            core = status.get("status", {}).get("core", {})
            for service in ["elasticsearch", "savedObjects"]:
                service_status = core.get(service, {}).get("level")
                if service_status != "available":
                    return False, f"Core service '{service}' status is {service_status}"

            # 3. Plugins
            plugins = status.get("status", {}).get("plugins", {})
            for name, info in plugins.items():
                if info.get("level") != "available":
                    return False, f"Plugin '{name}' is {info.get('level')}"

            # 4. System load
            metrics = status.get("metrics", {})
            load_1m = metrics.get("os", {}).get("load", {}).get("1m", 0)
            if load_1m > max_load_1m:
                return False, f"1-minute load too high: {load_1m:.2f} > {max_load_1m}"

            # 5. Heap usage
            heap = metrics.get("process", {}).get("memory", {}).get("heap", {})
            used = heap.get("used_in_bytes", 0)
            limit = heap.get("size_limit", 1)
            heap_ratio = used / limit
            if heap_ratio > max_heap_usage_ratio:
                return (
                    False,
                    f"Heap usage too high: {heap_ratio:.2%} > {max_heap_usage_ratio:.0%}",
                )

            # 6. Event loop delay
            delay = metrics.get("process", {}).get("event_loop_delay", 0)
            if delay > max_event_loop_delay:
                return (
                    False,
                    f"Event loop delay too high: {delay:.2f}ms > {max_event_loop_delay}ms",
                )

            return True, "Kibana is healthy"

    except Exception as e:
        return False, f"Exception occurred: {type(e).__name__}: {e}"
