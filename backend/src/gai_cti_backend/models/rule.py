from typing import Dict, List, Optional, Tuple

from pydantic import BaseModel, Field, RootModel

from .ti import TTP


class PageInfo(BaseModel):
    name: str
    description: str
    tag: str


class Rule(BaseModel, frozen=True):
    id: str = Field(..., description="ID set by the elasticsearch")
    rule_id: str = Field(..., description="ID set by the user")
    name: str
    tags: Optional[Tuple[str, ...]]
    type: str
    enabled: bool
    ttps: Optional[Tuple[TTP, ...]] = None


class RulePerTechnique(BaseModel):
    count: Optional[int]
    data: Optional[List[Rule]]


class RawRules(RootModel[List[Dict]]):
    pass
