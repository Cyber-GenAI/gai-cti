import { API_ROOT } from ".."

const AR_FEEDS = 'feeds'
const AR_FEEDS_CONNECTORS = `${AR_FEEDS}/connector`
const AR_FEEDS_ORGS = `${AR_FEEDS}/organization`

export const AR_GET_FEEDS_DASHBOARD = `${API_ROOT}/${AR_FEEDS}/top-dashboard`
export const AR_GET_FEEDS_DASHBOARD_IOC_COUNTER_OVERTIME = `${API_ROOT}/${AR_FEEDS}/top-dashboard/ioc-heatmap`
export const AR_GET_FEEDS_MAIN_TABLE = `${API_ROOT}/${AR_FEEDS}/main-table`
export const AR_GET_FEEDS_SECOND_TABLE = `${API_ROOT}/${AR_FEEDS}/second-table`

export const AR_GET_FEEDS_CONFIGURATION_FIELDS = `${API_ROOT}/${AR_FEEDS_CONNECTORS}/configurable-fields`
export const AR_GET_FEEDS_ORGANIZATIONS_MAP = `${API_ROOT}/${AR_FEEDS_CONNECTORS}/organizations-map`

export const AR_GET_FEEDS_CONFIGURATION_CONNECTORS = `${API_ROOT}/${AR_FEEDS_CONNECTORS}`
export const AR_CLEAN_UP_FEED_CONNECTORS = `${API_ROOT}/${AR_FEEDS_CONNECTORS}/delete-inactive`
export const AR_SUBMIT_FEEDS_CONFIGURATION_FIELDS = `${API_ROOT}/${AR_FEEDS_CONNECTORS}/configuration`
export const AR_GET_FEEDS_CONFIGURATION_HELP = (group: string) => `${API_ROOT}/${AR_FEEDS_CONNECTORS}/${group}/help`

export const AR_GET_FEED_DETAIL = (id: string) => `${API_ROOT}/${AR_FEEDS_ORGS}/${id}`
export const AR_EDIT_FEED_CONFIDENCE = (id: string) => `${API_ROOT}/${AR_FEEDS_ORGS}/${id}/confidence`
export const AR_EDIT_FEED_RELIABILITY = (id: string) => `${API_ROOT}/${AR_FEEDS_ORGS}/${id}/reliability`