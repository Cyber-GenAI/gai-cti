import { API_ROOT } from ".."

const AR_ADVERSARIES = "adversary"
export const AR_GET_ADVERSARIES = `${API_ROOT}/${AR_ADVERSARIES}/`
export const AR_GET_ADVERSARIES_DETAIL = `${API_ROOT}/`
export const AR_GET_ADVERSARY_DATA = (id: string) => `${API_ROOT}/${AR_ADVERSARIES}/${id}`
export const AR_GET_ADVERSARY_SCHEDULE = `${API_ROOT}/${AR_ADVERSARIES}/schedule`
export const AR_RUN_ADVERSARY_SCHEDULE = `${API_ROOT}/${AR_ADVERSARIES}/schedule/run-now`
export const AR_GET_ADVERSARIES_MITRE_ORG = `${API_ROOT}/${AR_ADVERSARIES}/mitre-map/APT28`
export const AR_GET_ADVERSARIES_MITRE = `${API_ROOT}/${AR_ADVERSARIES}/specificity`
export const AR_GET_ADVERSARIES_DASHBOARD = `${API_ROOT}/${AR_ADVERSARIES}/top-dashboard`