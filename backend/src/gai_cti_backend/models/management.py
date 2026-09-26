import datetime
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

from .utils import Row, Table, Column




class ManagementRow(Row):
    id: str = Field(default_factory=str)
    name: str
    status: Literal["injecting", "injected", "not injected", "deleting", "re-injecting"]
    type: Literal["log", "rule"]
    actions: List[Literal["cancel", "inject", "delete", "re-inject"]] = Field(
        default_factory=list
    )
    tag: Literal["apt", "ti", "other"]
    apt_number: Optional[str] = Field(default=None)


class ManagementTable(Table):
    rows: List[ManagementRow]
    columns: Dict[
        Literal[
            "id",
            "name",
            "status",
            "type",
            "actions",
            "tag",
            "apt_number",
            "filterable",
            "last_row_cursor",
        ],
        Column,
    ]


class ManagementLogsRequest(BaseModel):
    id: str
    # file: Optional[UploadFile] = Field(default=None)
    # tag: Literal["apt", "ti", "other"]
    # apt_number: Literal["apt5", "apt23", None] = Field(default=None)


class ManagementRulesRequest(BaseModel):
    id: str
    # tag: Literal["apt", "ti", "other"]
    # apt_number: Literal["apt5", "apt23", None] = Field(default=None)


class ManagementManualRulesRequest(BaseModel):
    rule_yml: Optional[str] = Field(default=None)
    rule_ndjson: Optional[str] = Field(default=None)


class LogInfo(BaseModel):
    title: str
    dir: str
    description: str
    index_name: str
    index_pattern: str  # this should be unique and can be used as a key (ID)
    post_process: List[str]


class LogMetadata(BaseModel):
    min: datetime.datetime
    max: datetime.datetime
    count: int
    distance: str
    error_count: int


class ManagementBackgroundTask(BaseModel):
    status: Literal["injecting", "injected", "not injected", "deleting", "re-injecting"]
    celery_task_id: str


class InjectedIOCsCache(BaseModel):
    ips: List[str]
    domains: List[str]
    urls: List[str]


class AdversaryIocCache(BaseModel):
    ips: List
    urls: List
    domains: List
    adversary_id: str
    adversary_name: str
