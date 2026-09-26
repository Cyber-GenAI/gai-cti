import { genericContext, globalPayloadClearData, globalPayloadSetIsLoading } from "../global"

export type indexPattern = {
  name: string,
  description: string,
  total_count: number,
  pattern: string,
  query: string
}

export type utilitiesState = {
  es_token: genericContext<string>;
  getESToken: () => Promise<string>;
  getSystemAvailable: () => Promise<boolean>;
}

export type UtilitiesPayloadGetESToken = {
  es_token: string
}

export type utilitiesActionTypes = "SET_ES_TOKEN"

export type utilitiesActions<T> = {
  type: T | "SET_ISLOADING" | "CLEAR_KEY"
  payload: UtilitiesPayloadGetESToken
  | globalPayloadSetIsLoading<keyof utilitiesState>
  | globalPayloadClearData<keyof utilitiesState>
}