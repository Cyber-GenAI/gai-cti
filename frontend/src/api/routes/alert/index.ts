import { API_ROOT, KIBANA_API_ROOT } from ".."
import { AR_KIBANA_DETECTION_ENGINE, AR_KIBANA_INTERNALS } from "../third-party"

const AR_ALERT = "alert"
export const AR_GET_ALERT_DETAIL = (id: string) => `${API_ROOT}/${AR_ALERT}/${id}`
export const AR_GET_ALERT_ASSISTANT = (id: string) => `${API_ROOT}/${AR_ALERT}/explain/${id}`
export const AR_KIBANA_ALERTS_DASHBOARD = `${KIBANA_API_ROOT}/${AR_KIBANA_DETECTION_ENGINE}/signals/search`
export const AR_KIBANA_LIST_ALERTS = `${String(KIBANA_API_ROOT).split("api")[0]}${AR_KIBANA_INTERNALS}/bsearch?compress=true`
export const AR_KIBANA_LIST_ALERTS_GROUPS = `${KIBANA_API_ROOT}/${AR_KIBANA_DETECTION_ENGINE}/signals/search`
export const AR_KIBANA_APP = String(KIBANA_API_ROOT).split("api")[0]