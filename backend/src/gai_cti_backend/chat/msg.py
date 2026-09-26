import asyncio
from typing import Any, Dict, cast
from uuid import uuid4

from langchain_core.messages import HumanMessage
from langchain_core.messages.ai import AIMessageChunk
from langchain_core.runnables.config import RunnableConfig

from ..chat.url_router import find_proper_agent, get_related_graph
from ..llm_agent.conversational.main_graph import Node
from ..socket_handler.emitters import emit_msg_append, emit_msg_end, emit_msg_init
from .welcome_messages import WELCOME_MESSAGES


async def submit_user_msg(msg: str, chat_sid: str, sid: str):
    user_msg_id = str(uuid4())
    await emit_msg_init(
        msg_id=user_msg_id,
        msg=msg,
        msg_type="user",
        chat_sid=chat_sid,
        sid=sid,
        llm_name=None,
        title=None,
    )
    await emit_msg_end(
        msg_id=user_msg_id,
        chat_sid=chat_sid,
        sid=sid,
    )


async def send_welcome_msg(llm_name: str, chat_sid: str, sid: str, route: str) -> None:
    agent_name: Node
    agent_name, ـ = await find_proper_agent(route)
    welcome_text = WELCOME_MESSAGES.get(agent_name, "Hello, How can I assist you?")

    welcome_msg_id = str(uuid4())
    await asyncio.sleep(0.9)
    await emit_msg_init(
        msg_id=welcome_msg_id,
        msg=welcome_text,
        msg_type="assistant",
        chat_sid=chat_sid,
        sid=sid,
        llm_name=llm_name,
        title=agent_name,
    )
    await emit_msg_end(
        msg_id=welcome_msg_id,
        chat_sid=chat_sid,
        sid=sid,
    )


async def answer_user_msg(msg: str, llm_name: str, chat_sid: str, sid: str, route: str):
    answer_msg_id = str(uuid4())
    agent_name, agent_metadata = await find_proper_agent(route)

    await emit_msg_init(
        msg_id=answer_msg_id,
        msg="",
        msg_type="assistant",
        chat_sid=chat_sid,
        sid=sid,
        llm_name=llm_name,
        title=agent_name,
    )

    config: RunnableConfig = {
        "configurable": {
            "thread_id": f"{chat_sid}:{sid}",
        }
    }

    async with get_related_graph() as graph:

        initial_state = {
            "messages": [HumanMessage(content=msg)],
            "llm_name": llm_name,
            "chat_sid": chat_sid,
            "sid": sid,
            "agent_name": agent_name,
            **agent_metadata,
        }

        async for _, (
            chunk,
            metadata,
        ) in graph.astream(  # pyright: ignore[reportAssignmentType]
            input=initial_state,
            stream_mode="messages",
            subgraphs=True,
            config=config,
        ):
            chunk = cast(AIMessageChunk, chunk)
            metadata = cast(Dict, metadata)

            if not chunk.content or "stream" not in metadata.get("tags", []):
                continue

            await asyncio.sleep(
                0.05
            )  # TODO: This line should be removed, when front bug is fixed

            await emit_msg_append(
                msg_id=answer_msg_id,
                msg=str(chunk.content),
                msg_type="assistant",
                chat_sid=chat_sid,
                sid=sid,
            )

    await emit_msg_end(
        msg_id=answer_msg_id,
        chat_sid=chat_sid,
        sid=sid,
    )
