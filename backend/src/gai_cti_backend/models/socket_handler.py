from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class MessageData(BaseModel):
    date: float = Field(default_factory=lambda _: datetime.now().timestamp() * 1000)
    msg_id: Optional[str] = Field(default=None)
    chat_sid: str
    msg: Optional[str] = Field(default=None)
    type: Optional[Literal["assistant", "user"]] = Field(default=None)
    route: Optional[str] = Field(default=None)
    tag: Optional[str] = Field(default=None)
    llm: Optional[str] = Field(default=None)
    title: Optional[str] = Field(default=None)
