import { API_ROOT, WEBSOCKET_API_ROOT } from ".."
import { managementApiRequest, managementTypes } from "../../../types/management"

const AR_MANAGEMENT = 'mng'
export const AR_GET_MANAGEMENT_TABLE = `${API_ROOT}/${AR_MANAGEMENT}/main-table`
export const AR_MANAGEMENT_TABLES_ACTION: managementApiRequest = (type, action) => `${API_ROOT}/${AR_MANAGEMENT}/${type}/${action}`
export const AR_MANAGEMENT_DELETE_TYPE = (type: managementTypes) => `${API_ROOT}/${AR_MANAGEMENT}/${type}/all`
export const AR_MANAGEMENT_CREATE_LOG = `${API_ROOT}/${AR_MANAGEMENT}/log/manual/inject`
export const AR_MANAGEMENT_WEB_SOCKET = `${WEBSOCKET_API_ROOT}`
export const AR_MANAGEMENT_GET_INJECTED_IOCS = `${API_ROOT}/${AR_MANAGEMENT}/injected-iocs`
export const AR_MANAGEMENT_GET_RULE_PREVIEW = `${API_ROOT}/${AR_MANAGEMENT}/rule/manual/preview`
export const AR_MANAGEMENT_SUBMIT_RULE = `${API_ROOT}/${AR_MANAGEMENT}/rule/manual/inject`