export type severities = "low" | "medium" | "high" | "critical" | "default";

export type keyedBucket<T = string> = {
  doc_count: number;
  key: T;
}
