import { fieldWithType, genericContext, globalPayloadClearData, globalPayloadSetIsLoading } from "../global"
import { VisualResponseWithType } from "../visuals"

export type homeStatistic = {
  title: string
  information: fieldWithType[]
}

export type homeVisuals = {
  "active-malwares": VisualResponseWithType<"PieVisual">;
  "ioc-per-adv": VisualResponseWithType<"BarVisual">;
  "ip-map": VisualResponseWithType<"MapVisual">;
  "common-ioc-tags": VisualResponseWithType<"TreeMapVisual">;
}

export type homeDashboard = {
  top_dashboards: homeStatistic[];
  visuals: homeVisuals
}

export type homeState = {
    dashboard: genericContext<homeDashboard>
    getDashboard: () => void
}

export type HomePayloadGetDashboard = {
    dashboard: homeDashboard
}

export type homeActionTypes = "SET_DASHBOARD" 

export type homeActions<T> = {
    type: T | "SET_ISLOADING" | "CLEAR_KEY"
    payload: HomePayloadGetDashboard
    | globalPayloadSetIsLoading<keyof homeState>
    | globalPayloadClearData<keyof homeState>
}