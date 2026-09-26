import { esQuery } from "../../../types/logs";
import { TimeRange } from "./types";

const TIME_IN_MS = {
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;


const getStartOfLocalDay = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getTimeRange = (range: string): TimeRange | null => {
    const now = new Date();
    let startTime: Date;

    switch (range) {
        case "today":
            startTime = getStartOfLocalDay(now);
            break;
        case "last_hour":
            startTime = new Date(now.getTime() - TIME_IN_MS.HOUR);
            break;
        case "last_minute":
            startTime = new Date(now.getTime() - TIME_IN_MS.MINUTE);
            break;
        case "last_15_minutes":
            startTime = new Date(now.getTime() - 15 * TIME_IN_MS.MINUTE);
            break;
        case "last_30_minutes":
            startTime = new Date(now.getTime() - 30 * TIME_IN_MS.MINUTE);
            break;
        case "last_24_hours":
            startTime = new Date(now.getTime() - TIME_IN_MS.DAY);
            break;
        case "last_week":
            startTime = new Date(now.getTime() - TIME_IN_MS.WEEK);
            break;
        case "last_30_days":
            startTime = new Date(now.getTime() - TIME_IN_MS.MONTH);
            break;
        case "no_filter":
            return null;
        default:
            return null;
    }

    return {
        gte: startTime.toISOString(),
        lte: now.toISOString(),
    };
};

export const addTimeRangeToQuery = (query: esQuery, timeRange: TimeRange | null): esQuery => {
    if (!timeRange) return query;

    const timeClause = {
        bool: {
            should: [
                { range: { '@timestamp': timeRange } },
                { range: { timestamp: timeRange } },
            ],
            minimum_should_match: 1
        }
    };

    if (query.bool?.must) {
        return {
            ...query,
            bool: {
                ...query.bool,
                must: [...query.bool.must, timeClause]
            }
        };
    } else if (query.bool) {
        return {
            ...query,
            bool: {
                ...query.bool,
                must: [timeClause]
            }
        };
    } else {
        return {
            bool: {
                must: [query, timeClause]
            }
        };
    }
};