import Cookies from 'universal-cookie';
import { clearAuthCookie, clearEsTokenCookie } from '../../utils/auth';
import { Toastify } from "../../utils/toasts";

type RequestOptions<T> = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate?: (data: any) => data is T;
  config?: RequestInit;
  signal?: AbortSignal;
  silence?: boolean;
};

type ApiResponseError = {
  detail: [
    {
      loc: unknown,
      msg: string,
      type: string
    }
  ]
}

type ApiResponse<T> = T | ApiResponseError

export async function request<T>({
  url,
  method = 'GET',
  data,
  validate,
  config,
  signal,
  silence,
}: RequestOptions<T>): Promise<T> {
  try {
    const cookies = new Cookies();
    const cookieAuth = cookies.get('auth');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(cookieAuth ? { 'Authorization': `Basic ${cookieAuth}` } : {}),
      ...(config?.headers || {}),
    };

    const fetchConfig: RequestInit = {
      method,
      headers,
      signal,
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(url, fetchConfig);
    const responseData = await response.json() as ApiResponse<T>;

    const statusCode = response.status;
    const isBackendSuccess = statusCode >= 200 && statusCode < 400;

    if (statusCode === 401) {
      throw 'auth error'
    }

    if (!response.ok || !isBackendSuccess) {
      const failedResponse = responseData as ApiResponseError
      throw new Error(failedResponse.detail[0].msg || 'Something went wrong with the request.');
    }

    if (validate && !validate(responseData)) {
      throw new Error('Validation failed for API response.');
    }

    return responseData as T;

  } catch (error) {
    if (error === 'auth error') {
      clearAuthCookie()
      clearEsTokenCookie()
      window.location.href = "/#/auth";
      window.location.reload();
      throw null;
    }
    if (!silence) {
      Toastify({ type: 'error', message: (error instanceof Error ? error.message : 'Request failed') });
    }
    throw new Error(`${error} (${url})`);
  }
}
