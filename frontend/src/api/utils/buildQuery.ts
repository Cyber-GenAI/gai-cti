export function buildQuery(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      searchParams.append(key, String(params[key]));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}