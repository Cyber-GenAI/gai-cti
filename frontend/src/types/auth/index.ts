import { fieldWithType, genericContext, genericMap, globalPayloadSetIsLoading, visualCard } from "../global"

export type homeStatistic = {
  title: string
  information: fieldWithType[]
}

export type homeDashboard = {
  top_dashboards: homeStatistic[];
  map: genericMap[];
  visuals: visualCard[]
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
    payload: HomePayloadGetDashboard | globalPayloadSetIsLoading<unknown>
}