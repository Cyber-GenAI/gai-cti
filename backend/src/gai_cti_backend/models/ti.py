from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field, RootModel

from .utils import ReliabilityLevel, Row, Table, Timestamp, Column
from .visual import HeatmapDataRow, NetworkValue, PieSlice, StackedBarValue

type TTP = str
type Technique = str
type Tactic = str
type Count = int



class TIRow(Row):
    id: str
    name: str
    feed_source: str
    type: str
    creation_time: datetime
    score: int
    labels: List[str]
    cursor: str
    confidence_score: int
    # reliability: ReliabilityLevel


class TITable(Table):
    rows: List[TIRow]
    columns: Dict[
        Literal[
            "id",
            "name",
            "feed_source",
            "type",
            "creation_time",
            "score",
            "labels",
            "cursor",
            "reliability",
            "confidence_score",
        ],
        Column,
    ]


class TextFilter(BaseModel):
    field: str
    values: List[str]
    operator: Literal["contains", "not_contains", "search"]
    _type: Literal["TextFilter"]


class NumberFilter(BaseModel):
    field: str
    values: List[str]
    operator: Literal["gt", "lt", "gte", "lte"]
    _type: Literal["NumberFilter"]


class EnumFilter(BaseModel):
    field: str
    values: List[str]
    operator: Literal["eq", "not_eq", "nil", "not_nil"]
    _type: Literal["EnumFilter"]


class DateFilter(BaseModel):
    field: str
    values: List[str]
    operator: Literal["gt", "lt", "gte", "lte", "nil", "not_nil"]
    _type: Literal["DateFilter"]


class TagFilter(BaseModel):
    field: str
    values: List[str]
    operator: Literal["eq", "not_eq", "nil", "not_nil"]
    _type: Literal["TagFilter"]


class TITableRequest(BaseModel):
    cursor: Optional[str]
    page_size: int
    filters: List[Union[TextFilter, NumberFilter, EnumFilter, DateFilter, TagFilter]]


class Indicator(BaseModel):
    id: str
    name: str
    indicator_pattern: str
    indicator_types: List[str]
    x_opencti_score: int
    valid_until: datetime
    created_at: datetime
    confidence_level: str
    author: str
    is_revoked: bool
    reliability_of_author: str
    objectLabels: List[str]
    external_references: List[dict]
    metadata: Dict[str, str]


class ImportantMalwareRow(Row):
    id: str
    name: str
    num_indicators: int
    num_reports: int
    feed_source: str
    last_ioc_date: datetime


class ImportantMalwareTable(Table):
    rows: List[ImportantMalwareRow]
    columns: Dict[
        Literal[
            "id",
            "name",
            "num_indicators",
            "num_reports",
            "last_ioc_date",
            "feed_source",
        ],
        Column,
    ]


class MapFeed2ID(RootModel[Dict[str, str]]):
    pass


class IoCTypesCache(RootModel[List[str]]):
    pass


class TopDashboardCache(BaseModel):
    last_updated: datetime = Field(default_factory=datetime.now)
    important_malwares: List[ImportantMalwareRow]
    indicator_count: str
    malware_count: str
    active_feeds_count: str
    indicator_count_last_48h: str
    indicator_distribution: Dict[str, int]
    tag_co_occurrence: List[HeatmapDataRow]
    indicator_count_timeseries: Dict[Timestamp, int]
    diverging_conf_risk_data: List[StackedBarValue]
    malware_adv_graph_data: NetworkValue
    malware_sources_pie_data: List[PieSlice]
    malware_info_parallel_coords_data: Dict[str, Any]
