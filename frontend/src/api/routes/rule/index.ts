import { API_ROOT, KIBANA_API_ROOT } from ".."
import { AR_KIBANA_DETECTION_ENGINE } from "../third-party"

const AR_RULES = 'rules'
const AR_KIBANA_RULES = `${AR_KIBANA_DETECTION_ENGINE}/rules`
export const AR_GET_RULES_PAGES = `${API_ROOT}/${AR_RULES}/pages`
export const AR_GET_RULES_DASHBOARD = `${API_ROOT}/${AR_RULES}/top-dashboard`
export const AR_GET_RULE_DETAIL = (id: string) => `${API_ROOT}/${AR_RULES}/${id}`
export const AR_DELETE_RULE = (id: string) => `${API_ROOT}/${AR_RULES}/${id}`
export const AR_GET_RULES_MITRE_COVERAGE = `${API_ROOT}/${AR_RULES}/coverage`
export const AR_RUN_RULE_MANUAL = `${API_ROOT}/${AR_RULES}/manual-run`
export const AR_EDIT_RULE_INTERVAL = (id: string, interval: string) => `${API_ROOT}/${AR_RULES}/${id}/interval/${interval}`
export const AR_GET_TECHNIQUE_RULES = (technique: string) => `${API_ROOT}/${AR_RULES}/coverage/${technique}`
export const AR_KIBANA_LIST_RULES = `${KIBANA_API_ROOT}/${AR_KIBANA_RULES}/_find`