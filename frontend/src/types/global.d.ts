import { tableColumnTypes } from "./table";

export type apiResponseStatus = 'success' | 'failed' | 'pending'

export type PieSlice = {
  name: string;
  percent: number,
}

export interface StackedBarDatum {
  x: number | string;
  y: number | null;
  group: string;
}

export interface RangedBarDatum {
  name: string;
  min: number;
  max: number;
}

export type BarSlice = {
  x_title: string,
  y_title: string,
  x_accessor: string,
  y_accessors: string[],
  data: genericObject<string | number>[]
}
export type statisticsCardTypes = "MetricVisual" | "PieVisual" | "BarVisual" | "TableVisual" ;

export type MetricVisual = string
export type PieVisual = PieSlice[]
export type BarVisual = genericTable<string[] | number>
export type TableVisual = BarSlice

export type statisticsCardValue =
  | MetricVisual
  | PieVisual
  | BarVisual
  | TableVisual

export type baseDateData = {
  createdAt: string,
  updatedAt: string
}

export interface genericObject<T> {
  [key: string]: T;
}
export type genericContext<T> = {
  data: T | null
  isLoading: boolean
}

export type globalPayloadSetIsLoading<T> = {
  state: boolean
  key: T
}

export type globalPayloadClearData<T> = {
  key: T
}

export interface genericMap<T = string> {
  latitude: number;
  longitude: number;
  label: T;
  description: string
}

export interface fieldWithType<T = string> {
  key: string,
  value: T,
  type: tableColumnTypes
}

interface visualCardWithType<T extends statisticsCardTypes> {
  type: T;
  data: {
    title: string;
    description: string;
    value: statisticsCardValue[T]
  }
}

export type visualCard = {
  [K in statisticsCardTypes]: visualCardWithType<K>;
}[statisticsCardTypes];