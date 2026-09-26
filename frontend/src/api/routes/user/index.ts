import { API_ROOT } from ".."

const AR_USER = `user-management`
export const AR_GET_USER_STATUS = `${API_ROOT}/${AR_USER}/is-admin`
export const AR_GET_USER_TABLE = `${API_ROOT}/${AR_USER}/top-table`
export const AR_GET_USER_FORM = `${API_ROOT}/${AR_USER}/form-template`
export const AR_CREATE_USER = `${API_ROOT}/${AR_USER}/user`
export const AR_GET_USER_INFO = `${API_ROOT}/${AR_USER}/me`
export const AR_DELETE_USER = (userName: string) => `${API_ROOT}/${AR_USER}/user/${userName}`
export const AR_CHANGE_USER_PASSWORD = (userName: string) => `${API_ROOT}/${AR_USER}/user/${userName}/password`
export const AR_CHANGE_CURRENT_USER_PASSWORD = `${API_ROOT}/${AR_USER}/user/password`