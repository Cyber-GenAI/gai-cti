from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field, RootModel

from .utils import Column, Table


class UserCreationRequest(BaseModel):
    lname: str
    fname: str
    username: str = Field(
        min_length=3,
        max_length=20,
        pattern=r"^[a-zA-Z][a-zA-Z0-9_-]{2,19}$",
    )
    password: str


class UserObject(BaseModel):
    lname: str
    fname: str
    username: str
    hash_password: str
    last_login: Optional[datetime] = Field(default=datetime.now())
    creation_date: datetime = Field(default_factory=datetime.now, frozen=True)


class UsersTopTableRow(UserObject):
    actions: List[str] = Field(default=["Delete", "Change Password"])


class UsersTopTable(Table):
    rows: List[UsersTopTableRow] = Field(default=[])
    columns: Dict[
        Literal[
            "username",
            "hash_password",
            "creation_date",
            "last_login",
            "fname",
            "lname",
            "actions",
        ],
        Column,
    ]


class MyInfo(BaseModel):
    lname: str
    fname: str
    username: str
    last_login: Optional[datetime] = Field(default=datetime.now())
    creation_date: Optional[datetime] = Field(default_factory=datetime.now, frozen=True)
    is_admin: bool
