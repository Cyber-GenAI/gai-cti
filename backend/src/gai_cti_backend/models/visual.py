from typing import Any, Dict, Generic, List, Literal, Tuple, Union

from pydantic import BaseModel, Field, model_validator

from .utils import AnyTable, Day, Timestamp


class Visual(BaseModel):
    title: str
    description: str


class MetricVisual(Visual):
    value: str


class PieSlice(BaseModel):
    name: str
    percent: int


class TreeMapSlice(PieSlice):
    pass


class PieVisual(Visual):
    value: List[PieSlice]


class BarValue(BaseModel):
    x_title: str
    y_title: str
    x_accessor: str
    y_accessors: List[str]
    data: List[Dict[str, str | int | float]]


class BarVisual(Visual):
    value: BarValue


class AreaVisual(BarVisual):
    pass


class TableVisual(Visual, Generic[AnyTable]):
    value: AnyTable


class HeatmapDataPoint(BaseModel):
    x: str
    y: float


class HeatmapDataRow(BaseModel):
    id: str
    data: List[HeatmapDataPoint]


class HeatmapData(BaseModel):
    domain: Tuple[int | float, int | float]
    data: List[HeatmapDataRow]


class HeatmapVisual(Visual):
    value: HeatmapData


class RangeBarValue(BaseModel):
    min: Timestamp
    max: Timestamp
    name: str


class RangeBarVisual(Visual):
    value: List[RangeBarValue]


class StackedBarValue(BaseModel):
    x: Timestamp
    y: int | float
    group: str


class StackedBarVisual(Visual):
    value: List[StackedBarValue]


class CalenderHeatmapValue(BaseModel):
    value: int
    day: Day


class CalenderHeatmapVisual(Visual):
    value: List[CalenderHeatmapValue]


class ChordVisual(Visual):
    value: List[List[int]]
    keys: List[str]

    @model_validator(mode="after")
    def validate(self):
        assert len(self.value) == len(self.keys)
        for l in self.value:
            assert len(l) == len(self.keys)
        return self


class ParallelCoordinatesVisual(Visual):
    value: Dict[str, Any]


class Link(BaseModel):
    source: str
    target: str
    distance: float = Field(default=0.5)


class Node(BaseModel):
    id: str
    height: float = Field(default=0)
    size: float = Field(default=1)
    color: str = Field(default="blue")


class NetworkValue(BaseModel):
    nodes: List[Node] = Field(default_factory=list)
    links: List[Link] = Field(default_factory=list)


class NetworkVisual(Visual):
    value: NetworkValue = Field(default_factory=NetworkValue)


class PointInMap(BaseModel):
    latitude: float
    longitude: float
    label: str
    description: str = Field(default="---")
    color: str = Field(default="#00FFEA")
    size: int = Field(default=10)


class MapVisual(Visual):
    value: List[PointInMap]


class TreeMapChild(BaseModel):
    id: str
    value: int


class TreeMapVisual(Visual):
    value: List[TreeMapSlice]


class VisualResponse(BaseModel):
    type: Literal[
        "MetricVisual",
        "PieVisual",
        "TableVisual",
        "BarVisual",
        "HeatmapVisual",
        "ChordVisual",
        "AreaVisual",
        "HeatmapVisual",
        "RangeBarVisual",
        "StackedBarVisual",
        "CalenderHeatmapVisual",
        "ChordVisual",
        "NetworkVisual",
        "ParallelCoordinatesVisual",
        "MapVisual",
        "TreeMapVisual",
    ]
    data: Union[
        MetricVisual,
        PieVisual,
        TableVisual,
        BarVisual,
        HeatmapVisual,
        ChordVisual,
        AreaVisual,
        HeatmapVisual,
        RangeBarVisual,
        StackedBarVisual,
        CalenderHeatmapVisual,
        ChordVisual,
        NetworkVisual,
        ParallelCoordinatesVisual,
        MapVisual,
        TreeMapVisual,
    ]
