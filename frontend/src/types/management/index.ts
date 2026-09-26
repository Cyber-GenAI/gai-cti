import { genericTable } from "../../components"
import { fieldWithType, genericContext, globalPayloadClearData, globalPayloadSetIsLoading } from "../global"

export type managementApiActions = "inject" | "reinject" | "delete" | "cancel"
export type managementTypes = "rule" | "log" | "alert"

export type managementInjectedIocs = string
export type managementTable = genericTable<number | string | string[]>

export type managementParam = { id: string, type: managementTypes, action: managementApiActions }

export type managementApiRequest = (type: managementTypes, action: managementApiActions) => string

export type managementRuleCreate = {
  rule_yml?: string | null
  rule_ndjson?: string | null
}

export type managementState = {
  injected_iocs: genericContext<managementInjectedIocs>;
  management_table: genericContext<managementTable>;
  management_rule_preview: genericContext<fieldWithType[]>
  getManagementTable: (tableData?: managementTable) => void;
  getInjectedIocs: () => void;
  getManagementRulePreview: (rule: managementRuleCreate) => Promise<boolean>;
  submitManagementRule: (rule: managementRuleCreate) => Promise<boolean>;
  generalActions: (params: managementParam) => Promise<boolean>;
  deleteType: (type: managementTypes) => Promise<boolean>;
}

export type ManagementPayloadGetManagementTable = {
  management_table: managementTable;
}
export type ManagementPayloadGetManagementInjectedIOCS = {
  injected_iocs: managementInjectedIocs;
}
export type ManagementPayloadGetManagementRulePreview = {
  management_rule_preview: fieldWithType[];
}
export type managementActionTypes = "SET_MANAGEMENT_TABLE" | "SET_MANAGMENT_PREVIEW" | "SET_INJECTED_IOCS"

export type managementActions<T> = {
  type: T | "SET_ISLOADING" | "CLEAR_KEY"
  payload:
    ManagementPayloadGetManagementTable
    | ManagementPayloadGetManagementRulePreview
    | ManagementPayloadGetManagementInjectedIOCS
    | globalPayloadSetIsLoading<keyof managementState>
    | globalPayloadClearData<keyof managementState>
}