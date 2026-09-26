import { esQuery } from "../../../types/logs";

export type TimeRange = { gte: string; lte: string };

export const getTimeRange = (range: string): TimeRange | null => {
  const now = new Date();
  let startTime = new Date();

  switch (range) {
    case 'today':
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'last_hour':
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'last_minute':
      startTime = new Date(now.getTime() - 60 * 1000);
      break;
    case 'last_15_minutes':
      startTime = new Date(now.getTime() - 15 * 60 * 1000);
      break;
    case 'last_30_minutes':
      startTime = new Date(now.getTime() - 30 * 60 * 1000);
      break;
    case 'last_week':
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'no_filter':
      return null;
    default:
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  return { gte: startTime.toISOString(), lte: now.toISOString() };
};

export const addTimeRangeToQuery = (query: esQuery, timeRange: TimeRange | null): esQuery => {
  if (!timeRange) return query;

  const rangeClause = {
    range: { '@timestamp': timeRange }
  };

  return {
    bool: {
      ...query.bool,
      must: [...(query.bool?.must || []), rangeClause]
    }
  };
};