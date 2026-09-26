from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Sequence, Set, Tuple, Union

from pydantic import BaseModel, Field, Json, RootModel

from .rule import Rule
from .utils import Column, FieldWithType, Markdown, Row, Table

type AdversaryName = str
type SpecificityScore = float
type AlertID = str
type RuleID = str


class RuleRow(Row):
    path: Dict[str, str]
    name: str
    ttp: Sequence[str]
    is_fired: bool
    specificity: float


class RuleTable(Table):
    rows: List[RuleRow]
    columns: Dict[
        Literal[
            "path",
            "name",
            "ttp",
            "is_fired",
            "specificity",
        ],
        Column,
    ]


class SigAlertRow(Row):
    path: Dict[str, str]
    timestamp: datetime
    rule_name: str
    rule_id: str
    log_id: str
    log_index: str
    actions: List[Literal["Show Log", "Show Rule"]]


class SigAlertTable(Table):
    rows: List[SigAlertRow]
    columns: Dict[
        Literal[
            "path",
            "timestamp",
            "rule_name",
            "rule_id",
            "log_id",
            "log_index",
            "actions",
        ],
        Column,
    ]


class IoCAlertRow(Row):
    path: Dict[str, str]
    timestamp: datetime
    rule_name: str
    rule_id: str
    log_id: str
    log_index: str
    ioc_value: str
    ioc_id: str
    actions: List[Literal["Show Log", "Show Rule", "Show IoC"]]


class IoCAlertTable(Table):
    rows: List[IoCAlertRow]
    columns: Dict[
        Literal[
            "path",
            "timestamp",
            "rule_name",
            "rule_id",
            "log_id",
            "log_index",
            "ioc_value",
            "ioc_id",
            "actions",
        ],
        Column,
    ]


class IoCRow(Row):
    path: Dict[str, str]
    value: str
    author: str
    timestamp: datetime
    x_opencti_score: int
    indicator_type: str
    is_detected: bool


class IoCTable(Table):
    rows: List[IoCRow]
    columns: Dict[
        Literal[
            "path",
            "value",
            "author",
            "timestamp",
            "x_opencti_score",
            "indicator_type",
            "is_detected",
        ],
        Column,
    ]


class AdversarySideBarItem(BaseModel):
    id: str
    opencti_ref: Optional[str]
    name: str
    sources: List[
        Literal[
            "M",  # Mitre
            "TI",  # Other TI sources
        ]
    ]
    warn_sign: bool
    is_important: bool
    confidence: int
    score: Optional[int] = None


class AdversarySideBarCache(BaseModel):
    last_updated: datetime = Field(default_factory=datetime.now)
    data: List[AdversarySideBarItem]


class Section(BaseModel):
    title: str
    description: Optional[str] = None
    information: List[FieldWithType]
    type: Literal["Table", "Markdown"] = Field(default="Table")
    data: Union[SigAlertTable, RuleTable, Markdown, IoCTable, IoCAlertTable]


class AdversaryInfo(BaseModel):
    id: str
    name: str
    description: str
    confidence: int | float
    sections: List[Section]
    score: int = 0  # should be removed


class AdversaryDetectionSigBaseResult(BaseModel):
    id: str
    name: str
    confidence: float
    ai_insights: str
    fired_rule_ids: List[RuleID]
    alert_rule_name: List[str]
    alert_rule_id: List[str]
    alert_log_ids: List[List[str]]
    alert_log_indenes: List[List[str]]
    alert_timestamps: List[datetime]


class IocSpec(BaseModel):
    id: str
    value: str
    indicator_pattern: str
    author: str
    timestamp: datetime
    x_opencti_score: int
    indicator_type: str


# labels: Optional[List[str]] = Field(default=[])


class AdversaryDetectionIoCBaseResult(BaseModel):
    id: str
    name: str
    undetected_related_iocs: List[IocSpec] = Field(default=[])
    detected_iocs: List[IocSpec] = Field(default=[])
    fired_rule_ids: List[RuleID]
    alert_rule_name: List[str]
    alert_rule_id: List[str]
    alert_ioc_value: List[str]
    alert_ioc_id: List[str]
    alert_log_ids: List[List[str]]
    alert_log_indenes: List[List[str]]
    alert_timestamps: List[datetime]


class AdversaryDetectionResults(BaseModel):
    creation_time: datetime = Field(default_factory=datetime.now)
    sig_based_results: Dict[AdversaryName, AdversaryDetectionSigBaseResult]
    ioc_based_results: Dict[AdversaryName, AdversaryDetectionIoCBaseResult]
    detected_adversaries_count: int
    detected_adversaries_names: Set[str] = Field(default=set())


class RulePerAdversary(RootModel[Dict[AdversaryName, Set[Rule]]]):
    pass
