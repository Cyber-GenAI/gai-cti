
import { useEffect } from 'react';
import { getTimeRange, addTimeRangeToQuery } from '../utils/logsUtils';
import { esQuery } from '../../../types/logs';
import { indexPattern } from '../../../types/utilities';

const useLogsFetcher = (
  indexPatterns: indexPattern[],
  selectedIndex: string,
  timeRange: string,
  getLogs: (pattern: string, query: esQuery) => void
) => {
  useEffect(() => {
    const selectedPattern = indexPatterns.find(i => i.name === selectedIndex);
    if (selectedPattern) {
      let parsedQuery: esQuery = JSON.parse(selectedPattern.query);
      const timeRangeObj = getTimeRange(timeRange);
      parsedQuery = addTimeRangeToQuery(parsedQuery, timeRangeObj);
      getLogs(selectedPattern.pattern, parsedQuery);
    }
  }, [selectedIndex, timeRange, indexPatterns, getLogs]);
};

export default useLogsFetcher;