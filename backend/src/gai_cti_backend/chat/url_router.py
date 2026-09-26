import re
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator, Dict, Tuple
from urllib.parse import parse_qs, urlparse

from langgraph.checkpoint.redis.aio import AsyncRedisSaver
from langgraph.graph.state import CompiledStateGraph

from ..conf import redis_conn_info
from ..llm_agent.conversational.main_graph import Node, get_builder

DB_URI = f"redis://{redis_conn_info['host']}:{redis_conn_info['port']}"


async def find_proper_agent(route: str) -> Tuple[Node, Dict[str, Any]]:
    parsed_url = urlparse(route)
    path_list = parsed_url.path.split("/")
    query_dict = parse_qs(parsed_url.query)

    if "alerts" in parsed_url.path:
        if len(path_list) == 2:
            alert_id = path_list[1]
            match = re.search(r"([a-fA-F0-9]{64})", alert_id)
            if match:
                alert_id = match.group(1)
                return "Alert", {"alert_id": alert_id}
        return "Alerts", {}

    if "feeds" in parsed_url:
        return "Feed", {}

    if "rules" in parsed_url:
        current_rule_tab = query_dict.get("tab", "")
        return "Rule", {"rule_id": current_rule_tab}

    if "logs" in parsed_url:
        current_log_name = query_dict.get("index", [""])[0]
        return "Log", {"index_pattern": current_log_name}

    if "threat-intelligence" in parsed_url:
        ti_id = query_dict.get("ti_id", "")
        return "TI", {"ti_id": ti_id}

    if "adversaries" in parsed_url:
        adv_id = query_dict.get("adversaryId", [""])[0]
        return "Adversaries", {"adv_id": adv_id}

    if route == "":
        return "Home", {}

    return "General", {}


@asynccontextmanager
async def get_related_graph() -> AsyncIterator[CompiledStateGraph]:

    builder = get_builder()

    checkpointer_cm = AsyncRedisSaver.from_conn_string(DB_URI)
    async with checkpointer_cm as checkpointer:
        graph = builder.compile(checkpointer=checkpointer)
        yield graph
