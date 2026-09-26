from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Tuple, Union

from pydantic import BaseModel, Field

from .log import LogTable
from .ti import TTP, Tactic, Technique
from .utils import AIAssistantBox, FieldWithType
from .visual import PointInMap


class Alert(BaseModel):
    ai_assistant: Tuple[AIAssistantBox, AIAssistantBox, AIAssistantBox]
    rule: List[FieldWithType]
    logs: LogTable
    ti: List[FieldWithType]
    map: List[PointInMap]
    show_ti: bool


class AlertConcise(BaseModel):
    id: str
    time: datetime
    log_ids: List[str]
    log_indenes: List[str]
    rule_id: str
    rule_name: str
    type: Literal["threat_match", "query"]
    matched_ioc: Dict[str, str] = Field(default={})
    mitre_tag: List[Tuple[Tactic, Technique, TTP]]
    severity: str
    reason: str
