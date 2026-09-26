import { genericTable } from "../../components"
import { fieldWithType, genericContext, globalPayloadClearData, globalPayloadSetIsLoading } from "../global"
import { VisualResponseWithType } from "../visuals"

export type adversary = {
  id: string,
  name: string,
  sources: string[],
  warn_sign: boolean,
  is_important: boolean,
  confidence: number
}

export type adversariesType = 'Markdown' | 'Table'

export type adversarySection = {
  title: string,
  description: string,
  information: fieldWithType[],
  type: adversariesType,
  data: genericTable<number | string[]> | string,
}

export type adversaryData = adversary & {
  description: string,
  sections: adversarySection[]
}

export type adversaryMitre = Record<string, Record<string, number>>
export type adversarySchedule = fieldWithType[]

export type adversariesDashboard = {
  "tracked-sig": VisualResponseWithType<"MetricVisual">
  "tracked-ioc": VisualResponseWithType<"MetricVisual">
  "specificity": VisualResponseWithType<"HeatmapVisual">
  "ioc-per-adv": VisualResponseWithType<"BarVisual">
  "rule-per-adv": VisualResponseWithType<"BarVisual">
}

export type adversariesState = {
  adversaries: genericContext<adversary[]>;
  adversary: genericContext<adversaryData>;
  adversarySchedule: genericContext<adversarySchedule>
  adversariesDashboard: genericContext<adversariesDashboard>
  adversariesDetail: genericContext<fieldWithType[]>
  mitres: genericContext<adversaryMitre>;
  getAdversariesMitre: (isOrganization: boolean) => void;
  getAdversaryData: (id: string) => void;
  getAdversariesDetail: (path: string) => void;
  getAdversarySchedule: () => void;
  getAdversaries: () => void;
  getAdversariesDashboard: () => void;
  runAdversarySchedule: () => Promise<boolean>;
}

export type AdversariesPayloadGetAdversaries = {
  adversaries: adversary[];
}

export type AdversariesPayloadGetAdversariesDetail = {
  adversariesDetail: fieldWithType[];
}

export type AdversariesPayloadGetAdversaryData = {
  adversary: adversaryData;
}
export type AdversariesPayloadGetAdversarySchedule = {
  adversarySchedule: adversarySchedule
}
export type AdversariesPayloadGetAdversariesDashboard = {
  adversariesDashboard: adversariesDashboard
}
export type AdversariesPayloadGetAdversariesMitre = {
  mitres: adversaryMitre
}

export type adversariesActionTypes =
  "SET_ADVERSARIES"
  | "SET_ADVERSARIES_DASHBOARD"
  | "SET_ADVERSARIES_DETAIL"
  | "SET_ADVERSARY_SCHEDULE"
  | "SET_ADVERSARY_DATA"
  | "SET_ADVERSARIES_MITRE"

export type adversariesActions<T> = {
  type: T | "SET_ISLOADING" | "CLEAR_KEY"
  payload: AdversariesPayloadGetAdversaries
  | AdversariesPayloadGetAdversaryData
  | AdversariesPayloadGetAdversarySchedule
  | AdversariesPayloadGetAdversariesDetail
  | AdversariesPayloadGetAdversariesDashboard
  | AdversariesPayloadGetAdversariesMitre
  | globalPayloadSetIsLoading<keyof adversariesState>
  | globalPayloadClearData<keyof adversariesState>
}