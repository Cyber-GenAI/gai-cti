from typing import Optional
from uuid import uuid4


async def new_session(
    sid: str,
) -> str:
    chat_sid = str(uuid4())
    return chat_sid


async def close_session(sid: str, chat_sid: str):
    pass
