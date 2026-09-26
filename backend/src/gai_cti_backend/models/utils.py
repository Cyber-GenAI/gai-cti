from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Tuple, TypeVar, Union

from pydantic import BaseModel, Field, model_validator

type Markdown = str
type Timestamp = float
type Day = str  # ex. 2018-12-21
type ReliabilityLevel = Literal[
    "A - Completely reliable",
    "B - Usually reliable",
    "C - Fairly reliable",
    "D - Not usually reliable",
    "E - Unreliable",
    "F - Reliability cannot be judged",
    None,
]


class LocOfIP(BaseModel):
    country: str
    state: str
    city: str
    lat: float
    long: float


class Column(BaseModel):
    name: str
    type: Literal[
        "text",
        "long_text",
        "date",
        "score",
        "labels",
        "number",
        "bool",
        "json",
        "action",
        "hidden",
    ]
    filter: Optional[
        Literal["TextFilter", "NumberFilter", "EnumFilter", "TagFilter", "DateFilter"]
    ] = Field(default=None)
    filter_operators: List[str] = Field(default_factory=list)
    filter_options: List[str] = Field(default_factory=list)


class Row(BaseModel):
    pass


class Table(BaseModel):
    rows: List[Row]
    columns: Dict[str, Column]
    total: int
    last_row_cursor: str = Field(default="")
    filterable: bool = Field(default=False)
    description: Optional[str] = Field(default=None)


AnyTable = TypeVar("AnyTable", bound=Table)


class GenericResponse(BaseModel):
    message: str
    errors: Optional[str] = None


class FieldWithType(BaseModel):
    key: Optional[str]
    value: Union[str, int, float, datetime, bool, List[str]]
    type: Literal[
        "text",
        "number",
        "date",
        "bool",
        "labels",
        "score",
        "warn_sign",
        "external_references",
        "editable_text",
        "editable_reliability",
    ]

    @model_validator(mode="after")
    def validate_value_type(self):
        expected_types = {
            "text": str,
            "number": (int, float),
            "date": datetime,
            "bool": bool,
            "labels": list,  # assuming labels is a list of strings
            "score": (int, float),
            "warn_sign": bool,
            "external_references": str,
            "editable_text": str,
            "editable_reliability": str,
        }

        expected = expected_types.get(self.type)
        if expected is None:
            raise ValueError(f"Invalid type: {self.type}")

        if not isinstance(self.value, expected):
            raise ValueError(
                f"Value {self.value} does not match expected type {expected} for field type '{self.type}'"
            )

        return self


class BaseOptions(BaseModel):
    required: bool = True


class TextOptions(BaseOptions):
    starts_with: Optional[str] = None
    length: Optional[int] = None


class NumberOptions(BaseOptions):
    number_range: Tuple[float, float]


class BooleanOptions(BaseOptions):
    labels: Tuple[str, str]


class SelectOptions(BaseOptions):
    items: List[str]


Options = Union[TextOptions, NumberOptions, BooleanOptions, SelectOptions]
InputFieldType = Literal["text", "number", "boolean", "select"]


class InputFieldWithType(BaseModel):
    key: str
    title: str
    type: InputFieldType
    default: Optional[Union[str, int, float, bool]]
    options: Options
    tag: str = "-"

    @model_validator(mode="after")
    def validate_options_type(self):
        """Ensure the options match the field type."""
        expected_options = {
            "text": TextOptions,
            "number": NumberOptions,
            "boolean": BooleanOptions,
            "select": SelectOptions,
        }

        if self.options is not None:
            expected_type = expected_options.get(self.type)
            if not expected_type:
                raise ValueError(f"Invalid type: {self.type}")
            if not isinstance(self.options, expected_type):
                raise ValueError(
                    f"Options for type '{self.type}' must be of type {expected_type.__name__}, got {type(self.options).__name__}"
                )
        return self


class AIAssistantBox(BaseModel):
    title: str
    value: Markdown


class LLMSettings(BaseModel):
    explain_llm: str


class ExplainLLMUpdateRequest(BaseModel):
    llm: str
