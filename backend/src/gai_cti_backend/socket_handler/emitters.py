import asyncio
from typing import Awaitable, Callable, Coroutine, Literal, Optional

from ..models.management import ManagementTable
from ..models.socket_handler import MessageData
from .socket import sio


async def emit_update_mng_main_table(get_tbl: Callable[[], Awaitable[ManagementTable]]):
    tbl = await get_tbl()
    await sio.emit(
        "update_mng_main_table",
        tbl.model_dump_json(),
        # room="management_table", # TODO: implement rooms
    )


def emit_update_mng_main_table_sync(get_tbl: Callable[[], Awaitable[ManagementTable]]):
    asyncio.create_task(emit_update_mng_main_table(get_tbl))


async def emit_msg_init(
    msg_id: str,
    msg: Optional[str],
    msg_type: Literal["assistant", "user"],
    chat_sid: str,
    sid: str,
    llm_name: Optional[str],
    title: Optional[str] = "general",
):
    """Emit a 'msg_init' event."""
    chat_sid = chat_sid
    msg_data = MessageData(
        msg_id=msg_id,
        chat_sid=chat_sid,
        type=msg_type,
        msg=msg,
        llm=llm_name,
        title=title,
    )
    await sio.emit("on_msg_init", msg_data.model_dump(exclude_none=True), to=sid)


async def emit_msg_append(
    msg_id: str,
    msg: str,
    msg_type: Literal["assistant", "user"],
    chat_sid: str,
    sid: str,
):
    """Emit a 'msg_init' event."""
    chat_sid = chat_sid
    msg_data = MessageData(
        msg_id=msg_id,
        chat_sid=chat_sid,
        type=msg_type,
        msg=msg,
    )
    await sio.emit("on_msg_append", msg_data.model_dump(exclude_none=True), to=sid)


async def emit_msg_end(msg_id: str, chat_sid: str, sid: str):
    """Emit a 'msg_end' event."""
    msg_data = MessageData(
        msg_id=msg_id,
        chat_sid=chat_sid,
    )
    await sio.emit("on_msg_end", msg_data.model_dump(exclude_none=True), to=sid)


async def emit_session_start(chat_sid: str):
    """Emit a 'session_start' event."""
    msg_data = MessageData(chat_sid=chat_sid)
    await sio.emit("on_session_start", msg_data.model_dump(exclude_none=True))
