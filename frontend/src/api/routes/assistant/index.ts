import { API_ROOT } from ".."

const AR_EXPLAIN = "explain"
export const AR_GET_ASSISTANT_EXPLAIN = (route: string, id?: string, pattern?: string) => `${API_ROOT}/${route}/${AR_EXPLAIN}${pattern ? `/${pattern}` : ''}${id ? `/${id}` : ''}`;
export const AR_GET_HELP = (route: string) => `${API_ROOT}${route}`;