import { AR_GET_SYSTEM_AVAILABLE } from "../api/routes/utilities";

let _available: boolean | null = null;

export async function getSystemAvailable(refetch = false): Promise<boolean> {
  if (_available !== null && !refetch) return _available;

  try {
    const res = await fetch(AR_GET_SYSTEM_AVAILABLE, { method: "GET" });
    _available = res.ok;
  } catch {
    _available = false;
  }

  return _available;
}