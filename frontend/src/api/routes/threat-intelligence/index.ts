import { API_ROOT } from ".."

const AR_THREAT_INT = `ti`
export const AR_GET_THREAT_TABLE = `${API_ROOT}/${AR_THREAT_INT}/main-table`
export const AR_GET_THREAT_TI_DASHBOARD = `${API_ROOT}/${AR_THREAT_INT}/ti-dashboard`
export const AR_GET_THREAT_MALWARE_DASHBOARD = `${API_ROOT}/${AR_THREAT_INT}/malware-dashboard`
export const AR_GET_THREAT_IP_DASHBOARD = `${API_ROOT}/${AR_THREAT_INT}/ip-dashboard`
export const AR_GET_THREAT_METADATA = (id: string) => `${API_ROOT}/${AR_THREAT_INT}/indicator/${id}`
export const AR_EDIT_THREAT_CONFIDENCE = (id: string) => `${API_ROOT}/${AR_THREAT_INT}/indicator/${id}/confidence`