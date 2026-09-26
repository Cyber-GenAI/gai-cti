import { genericTable } from "../../components";
import { GroupedFormData, InputField } from "../../components/Form/types";
import { fieldWithType, genericContext, globalPayloadClearData, globalPayloadSetIsLoading } from "../global"
import { tableActions } from "../table";
import { VisualResponseWithType } from "../visuals";

export type reliabilityLevel = "A - Completely reliable" | "B - Usually reliable" | "C - Fairly reliable" | "D - Not usually reliable" | "E - Unreliable" | "F - Reliability cannot be judged"

export type feedConfigurationConnector = {
  key: string
  title: string
  default: boolean
  is_free: boolean
}

export type feedTable = genericTable<number | boolean | tableActions[]>
export type feedDetail = fieldWithType[]
export type feedMetric = VisualResponseWithType<'MetricVisual'>
export type feedDistribution = VisualResponseWithType<'PieVisual'>
export type feedIocCount = VisualResponseWithType<'BarVisual'>
export type feedIocCountOverTime = VisualResponseWithType<'HeatmapVisual'>

export type feedDashboard = {
  total: feedMetric
  active: feedMetric
  distribution: feedDistribution
  iocCount: feedIocCount
}
export type feedDashboardIocCounterOverTime = feedIocCountOverTime
export type feedDashboardIocCounterOverTimeParams = {
  from?: string
  to?: string
}

export type feedState = {
  feedsTable: genericContext<feedTable>,
  feedsSecondTable: genericContext<feedTable>,
  feedDetail: genericContext<feedDetail>,
  feedConfigurationConnectors: genericContext<feedConfigurationConnector[]>
  feedConfigurationFields: genericContext<InputField[]>
  feedMarkdown: genericContext<string>
  feedDashboard: genericContext<feedDashboard>
  feedDashboardIocCounterOverTime: genericContext<feedDashboardIocCounterOverTime>
  feedOrganizationsMap: genericContext<fieldWithType[]>
  getFeedTable: () => void,
  getFeedSecondTable: () => void,
  getFeedDashboard: () => void
  getFeedDashboardIocCounterOverTime: (params: feedDashboardIocCounterOverTimeParams) => void
  getFeedOrganizationsMap: () => void
  getFeedDetail: (id: string) => void
  getFeedConfigurationConnectors: () => void
  getFeedConfigurationHelp: (group: string) => void
  getFeedConfigurationFields: (connectors: string[]) => void
  editFeedConfidenceField: (id: string, confidence: number) => Promise<boolean>
  editFeedReliabilityField: (id: string, reliability: reliabilityLevel) => Promise<boolean>
  submitFeedConfigurationFields: (configuration: GroupedFormData) => Promise<boolean>
  cleanUpConnectors: () => Promise<boolean>
}

export type FeedsPayloadSetFeedTable = {
  feedsTable: feedTable
}

export type FeedsPayloadSetFeedSecondTable = {
  feedsSecondTable: feedTable
}

export type FeedsPayloadSetFeedDetail = {
  feedDetail: feedDetail
}

export type FeedsPayloadSetFeedOrganizationMap = {
  feedOrganizationsMap: fieldWithType[]
}

export type FeedsPayloadSetFeedConfigurationConnectors = {
  feedConfigurationConnectors: feedConfigurationConnector[]
}

export type FeedsPayloadSetFeedConfigurationFields = {
  feedConfigurationFields: InputField[]
}

export type FeedsPayloadSetFeedMarkdown = {
  feedMarkdown: string
}

export type FeedsPayloadSetFeedDashboard = {
  feedDashboard: feedDashboard
}

export type FeedsPayloadSetFeedDashboardIocCounterOverTime = {
  feedDashboardIocCounterOverTime: feedDashboardIocCounterOverTime
}

export type feedActionTypes =
  | "SET_FEED_TABLE"
  | "SET_FEED_SECOND_TABLE"
  | "SET_FEED_DASHBOARD"
  | "SET_FEED_DASHBOARD_IOC_COUNTER_OVERTIME"
  | "SET_FEED_DETAIL"
  | "SET_FEED_CONFIGURATION_CONNECTORS"
  | "SET_FEED_CONFIGURATION_FIELDS"
  | "SET_FEED_MARKDOWN"
  | "SET_FEED_ORGANIZATION_MAP"

export type feedActions<T> = {
  type: T | "SET_ISLOADING" | "CLEAR_KEY"
  payload: FeedsPayloadSetFeedTable
  | FeedsPayloadSetFeedDetail
  | FeedsPayloadSetFeedConfigurationConnectors
  | FeedsPayloadSetFeedConfigurationFields
  | FeedsPayloadSetFeedOrganizationMap
  | FeedsPayloadSetFeedDashboard
  | FeedsPayloadSetFeedDashboardIocCounterOverTime
  | FeedsPayloadSetFeedMarkdown
  | FeedsPayloadSetFeedSecondTable
  | globalPayloadSetIsLoading<keyof feedState>
  | globalPayloadClearData<keyof feedState>}