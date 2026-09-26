import { API_ROOT } from ".."

const AR_UTILITIES = 'utils'
const AR_MANAGEMENT = 'mng/explain'
const AR_LOGS = 'logs'

export const AR_GET_ES_TOKEN = `${API_ROOT}/${AR_UTILITIES}/es-token`
export const AR_GET_SYSTEM_AVAILABLE = `${API_ROOT}/${AR_UTILITIES}/system-available`
export const AR_GET_INDEX_PATTERNS =  `${API_ROOT}/${AR_LOGS}/index-patterns`
export const AR_GET_AVAILABLE_LLMS = `${API_ROOT}/${AR_UTILITIES}/available-llms`

export const AR_GET_EXPLAIN_LLM = `${API_ROOT}/${AR_MANAGEMENT}/llm`
export const AR_SET_EXPLAIN_LLM = `${API_ROOT}/${AR_MANAGEMENT}/llm`