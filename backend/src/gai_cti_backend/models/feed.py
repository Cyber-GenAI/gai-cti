from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field, RootModel

from ..models.visual import HeatmapDataRow
from .ti import Column, Row, Table
from .utils import ReliabilityLevel


class Connector(BaseModel):
    key: str
    title: str
    default: bool
    is_free: bool = False


class AllConnectorObjects(RootModel[List[Connector]]):
    pass


class ConfigRequest(RootModel[Dict[str, Dict[str, Any]]]):
    pass


class FeedConnectorRow(Row):
    path: Dict[str, str]
    id: str
    name: str
    last_run: Optional[datetime]
    next_run: Optional[datetime]
    n_msg_in_queue: str
    size_msg_in_queue: str
    active: bool
    actions: List[Literal["Show Help"]]


class FeedConnectorTable(Table):
    rows: List[FeedConnectorRow]
    columns: Dict[
        Literal[
            "path",
            "id",
            "name",
            "last_run",
            "next_run",
            "n_msg_in_queue",
            "size_msg_in_queue",
            "active",
            "actions",
        ],
        Column,
    ]


class FeedOrganizationRow(Row):
    id: str
    name: str
    total_ioc_count: str
    confidence_level: int
    reliability_level: ReliabilityLevel


class FeedOrganizationTable(Table):
    rows: List[FeedOrganizationRow]
    columns: Dict[
        Literal[
            "id",
            "name",
            "total_count",
            "confidence_level",
            "reliability_level",
        ],
        Column,
    ]


class FeedUpdate(BaseModel):
    active: Optional[bool] = Field(default=None)
    max_conf_score: Optional[int] = Field(default=None)
    updating_interval: Optional[int] = Field(default=None)


class TopDashboardCache(BaseModel):
    ioc_count_per_feed_data: List[Dict[str, str | int | float]]
    ioc_count_over_time_per_feed_data: list[HeatmapDataRow]


class ChangeReliabilityRequest(BaseModel):
    indicator_id: str
    reliability: ReliabilityLevel


class OrganizationToConnectorMapCache(BaseModel):
    maps: List[Dict]


class ConnectorDirNameToConnectorName(RootModel[Dict]):
    pass
