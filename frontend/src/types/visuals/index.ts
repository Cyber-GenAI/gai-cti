import { Data, Dimension } from "hermes-parallel-coordinates";
import { genericTable } from "../../components";
import { genericMap } from "../global";

type Day = string;
type Timestamp = string | number;

export interface Visual {
  title: string;
  description: string;
}

export interface MetricVisual extends Visual {
  value: string;
}

export interface PieSlice {
  name: string;
  percent: number;
}

export interface PieVisual extends Visual {
  value: PieSlice[];
}

export interface BarValue {
  x_title: string;
  y_title: string;
  x_accessor: string;
  y_accessors: string[];
  data: Array<Record<string, string | number>>;
}

export interface BarVisual extends Visual {
  value: BarValue;
}

type AreaVisual = BarVisual;

export interface TableVisual extends Visual {
  value: genericTable<string[] | number>;
}

export interface HeatmapDataPoint {
  x: string;
  y: number;
}

export interface HeatmapDataRow {
  id: string;
  data: HeatmapDataPoint[];
}

export interface HeatmapVisual extends Visual {
  value: {
    data: HeatmapDataRow[];
    domain: [number, number];
  }
}

export interface RangeBarValue {
  min: Timestamp;
  max: Timestamp;
  name: string;
}

export interface RangeBarVisual extends Visual {
  value: RangeBarValue[];
}

export interface StackedBarValue {
  x: Timestamp;
  y: number;
  group: string;
}

export interface StackedBarVisual extends Visual {
  value: StackedBarValue[];
}

export interface CalenderHeatmapValue {
  value: number;
  day: Day;
}

export interface CalenderHeatmapVisual extends Visual {
  value: CalenderHeatmapValue[];
}

export interface ChordVisual extends Visual {
  value: number[][];
  keys: string[];
}

export interface ParallelCoordinatesVisual extends Visual {
  value: {
    dimensions: Dimension[]
    data: Data
  }
}

export interface Link {
  source: string;
  target: string;
  distance?: number;
}

export interface Node {
  id: string;
  height?: number;
  size?: number;
  color?: string;
}

export interface NetworkValue {
  nodes: Node[];
  links: Link[];
}

export interface NetworkVisual extends Visual {
  value: NetworkValue;
}

export interface MapVisual extends Visual {
  value: genericMap[]
}

export interface TreeMapValue {
  id: string
  value: number
}

export type TreeMapVisual = PieVisual;

export type VisualType =
  | "MetricVisual"
  | "MapVisual"
  | "PieVisual"
  | "TableVisual"
  | "BarVisual"
  | "HeatmapVisual"
  | "ChordVisual"
  | "AreaVisual"
  | "RangeBarVisual"
  | "StackedBarVisual"
  | "CalenderHeatmapVisual"
  | "NetworkVisual"
  | "TreeMapVisual"
  | "ParallelCoordinatesVisual";

type VisualDataWithType = {
  MetricVisual: MetricVisual
  MapVisual: MapVisual
  PieVisual: PieVisual
  TableVisual: TableVisual
  BarVisual: BarVisual
  HeatmapVisual: HeatmapVisual
  ChordVisual: ChordVisual
  AreaVisual: AreaVisual
  RangeBarVisual: RangeBarVisual
  StackedBarVisual: StackedBarVisual
  CalenderHeatmapVisual: CalenderHeatmapVisual
  NetworkVisual: NetworkVisual
  TreeMapVisual: TreeMapVisual
  ParallelCoordinatesVisual: ParallelCoordinatesVisual
}

export type VisualData =
  | MetricVisual
  | MapVisual
  | PieVisual
  | TableVisual
  | BarVisual
  | HeatmapVisual
  | ChordVisual
  | AreaVisual
  | RangeBarVisual
  | StackedBarVisual
  | CalenderHeatmapVisual
  | NetworkVisual
  | TreeMapVisual
  | ParallelCoordinatesVisual;

export interface VisualResponseWithType<T extends VisualType> {
  type: T;
  data: VisualDataWithType[T];
}

export interface VisualResponse {
  type: VisualType;
  data: VisualData;
}