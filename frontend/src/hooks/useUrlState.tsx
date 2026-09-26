import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Hook to sync a single state value with the URL query parameters.
 * Supports lazy defaults (for async-loaded data) and avoids URL loops.
 *
 * @param key URL query param key
 * @param defaultValue Default value or a lazy initializer function () => string
 * @param removeIfDefault Optional: if true, removes the param when value === default
 */
export function useUrlState(
  key: string,
  defaultValue: string | (() => string) = "",
  removeIfDefault = false
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialized = useRef(false);

  const valueFromUrl = searchParams.get(key);
  const defaultVal = typeof defaultValue === "function" ? defaultValue() : defaultValue;
  const value = valueFromUrl ?? defaultVal;

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      const params = new URLSearchParams(searchParams);
      if (removeIfDefault && value === defaultVal) {
        params.delete(key);
      } else if (!params.get(key)) {
        params.set(key, value);
      }
      setSearchParams(params, { replace: true });
    }
  }, [defaultVal, key, removeIfDefault, searchParams, setSearchParams, value]);

  const setValue = (newValue: string) => {
    const params = new URLSearchParams(searchParams);

    if (removeIfDefault && newValue === defaultVal) {
      params.delete(key);
    } else {
      params.set(key, newValue);
    }

    setSearchParams(params, { replace: true });
  };

  return [value, setValue] as const;
}
