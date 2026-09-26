import { useCallback, useMemo, useState } from "react"

export const usePagination = () => {
  const [cursors, setCursors] = useState<string []>([])
  
  const memoizedLastCursor = useMemo(() => cursors.at(-1) ?? '', [cursors]);
  const memoizedLength = useMemo(() => cursors.length, [cursors.length]);

  const nextCursor = useCallback(
    (cursor: string) => {
      setCursors((prev) => [...prev, cursor])
      
      return cursor;
    }, [])
  
  const prevCursor = useCallback(
    () => {
      const currentCursors: string[] = [ ...cursors];
      currentCursors.pop();
      setCursors(currentCursors)

      return currentCursors.at(-1) ?? '';
    }, [cursors])
  
  const clearCursor = useCallback(
    () => {
      setCursors([])
    },[])
  

    return {
      prevCursor,
      nextCursor,
      clearCursor,
      lastCursor: memoizedLastCursor,
      length: memoizedLength
    }
}