import { API_ROOT, ELASTIC_API_ROOT } from "..";

const AR_LOGS = 'logs'
export const AR_GET_LOGS = (pattern: string) => `${ELASTIC_API_ROOT}/${pattern}/_search`
export const AR_GET_LOGS_DISTRIBUTION_DASHBOARD = `${API_ROOT}/${AR_LOGS}/top-dashboard`
export const AR_GET_LOGS_INDEX_DASHBOARD = (pattern: string) => `${API_ROOT}/${AR_LOGS}/index-dashboard/${pattern}`