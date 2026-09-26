import { genericTable } from "../../components"
import { requestFilterParam } from "../../components/DataTable/types"
import { fieldWithType, genericContext, globalPayloadClearData, globalPayloadSetIsLoading } from "../global"
import { VisualResponseWithType } from "../visuals"

export type threatTIDashboard = {
    "active-feeds": VisualResponseWithType<"MetricVisual">
    "malware-count": VisualResponseWithType<"MetricVisual">
    "indicator-count": VisualResponseWithType<"MetricVisual">
    "indicator-count-48h": VisualResponseWithType<"MetricVisual">
    "cumulative-ioc-count": VisualResponseWithType<"AreaVisual"> 
    "diverging-conf-risk": VisualResponseWithType<"StackedBarVisual">
    "ioc-type-pie": VisualResponseWithType<"PieVisual">
    "tag-corr-heatmap": VisualResponseWithType<"HeatmapVisual">
}

export type threatMalwareDashboard = {
    "important-table": VisualResponseWithType<"TableVisual">
    "malware-adversary-graph": VisualResponseWithType<"NetworkVisual">
    "malware-info-parallel-coord": VisualResponseWithType<"ParallelCoordinatesVisual">
    "malware-feed-pie": VisualResponseWithType<"PieVisual">
}

export type threatIPDashboard = {
    "ip-geo-map": VisualResponseWithType<"MapVisual">
}

export type threatIntelligenceTable = genericTable<number | string[]>

export type threatIntelligenceTableParams = {
    cursor?: string | null;
    page_size?: number;
    filters?: requestFilterParam[]
}

export type threatIntelligenceState = {
  threatTIDashboard: genericContext<threatTIDashboard>;
  threatMalwareDashboard: genericContext<threatMalwareDashboard>
  threatIPDashboard: genericContext<threatIPDashboard>
  threatTable: genericContext<threatIntelligenceTable>;
  threatMetadata: genericContext<fieldWithType[]>;
  getThreatTIDashboard: () => void;
  getThreatMalwareDashboard: () => void;
  getThreatIPDashboard: () => void;
  getThreatTable: (params?: threatIntelligenceTableParams) => void;
  getThreatMetadata: (id: string) => void;
  editThreatConfidenceField: (id: string, confidence: number) => Promise<boolean>;
  setThreatTableParams: (params: threatIntelligenceTableParams) => void;
}

export type ThreatIntelligencePayloadGetTable = {
    threatTable: threatIntelligenceTable
}

export type ThreatIntelligencePayloadGetTIDashboard = {
    tiDashboard: threatTIDashboard
}

export type ThreatIntelligencePayloadGetMalwareDashboard = {
    malwareDashboard: threatMalwareDashboard
}

export type ThreatIntelligencePayloadGetIPDashboard = {
    ipDashboard: threatIPDashboard
}

export type ThreatIntelligencePayloadGetMetadata = {
    threatMetadata: fieldWithType[]
}

export type threatIntelligenceActionTypes = "SET_THREAT_TABLE" | "SET_THREAT_TI_DASHBOARD" | "SET_THREAT_MALWARE_DASHBOARD" | "SET_THREAT_IP_DASHBOARD" | "SET_THREAT_METADATA" 

export type threatIntelligenceActions<T> = {
    type: T | "SET_ISLOADING" | "CLEAR_KEY"
    payload: ThreatIntelligencePayloadGetTable
    | ThreatIntelligencePayloadGetTIDashboard
    | ThreatIntelligencePayloadGetMetadata
    | ThreatIntelligencePayloadGetMalwareDashboard
    | ThreatIntelligencePayloadGetIPDashboard
    | globalPayloadSetIsLoading<keyof threatIntelligenceState>
    | globalPayloadClearData<keyof threatIntelligenceState>
}