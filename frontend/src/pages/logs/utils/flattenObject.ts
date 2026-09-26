export const flattenObject = (
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> => {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (isRecord(value)) {
      Object.assign(acc, flattenObject(value, prefixedKey));
    } else {
      acc[prefixedKey] = value;
    }

    return acc;
  }, {} as Record<string, unknown>);
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}