import { DependencyList, useEffect, useRef } from "react";

export const useDidMountEffect = (callback: () => void, dependencies: DependencyList) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      callback();
    } else {
      isMounted.current = true;
    }
  }, dependencies);
}