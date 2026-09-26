import json
from datetime import datetime
from typing import Dict, List, Tuple

from pydantic import BaseModel, Field, RootModel
from pydantic.json import pydantic_encoder

from .utils import FieldWithType
from .visual import PointInMap, VisualResponse


class Statistics(BaseModel):
    title: str
    information: List[FieldWithType]


class MapData(BaseModel):
    data: List[PointInMap]


class Home(BaseModel):
    top_dashboards: Tuple[Statistics, Statistics, Statistics, Statistics]
    visuals: Dict[str, VisualResponse]


class System(BaseModel):
    start_time: datetime
    memory: List[int]
    total_memory: int
    cpu: List[float]


class AlertsStatsCache(BaseModel):
    total: int
    ioc_based: int
    last24: int
    sig_based: int


class IntrusionSetsIoCInfo(BaseModel):
    name: str
    id: str
    aliases: List[str]
    relational_iocs: List[Dict]
    x_opencti_score: int
    indicator_type: str
    createdBy: str


class IntrusionSets2IoCCache(BaseModel):
    last_updated: datetime = Field(default_factory=datetime.now)
    data: List[IntrusionSetsIoCInfo]


class LoginInfoCache(BaseModel):
    last_login: datetime = Field(default_factory=datetime.now)


class DetectedAdversariesCache(BaseModel):
    count: int
    names: List[str] = Field(default=[])


class Top10AdversariesWithIoC(RootModel[List[IntrusionSetsIoCInfo]]):
    pass
