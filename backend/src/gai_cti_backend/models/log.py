from datetime import datetime
from typing import Dict, List, Literal

from pydantic import BaseModel, Field, Json, RootModel

from .utils import Column, Row, Table


class IndexPattern(BaseModel):
    name: str
    description: str
    pattern: str
    query: str = Field(default='{"match_all":{}}')
    total_count: int = Field(default=0)


class LogRow(Row):
    id: str
    timestamp: datetime
    source: Json


class LogTable(Table):
    rows: List[LogRow]
    columns: Dict[
        Literal[
            "id",
            "timestamp",
            "source",
        ],
        Column,
    ]
