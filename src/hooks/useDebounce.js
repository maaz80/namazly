import { useCallback, useRef, useEffect } from 'react';

export const useDebounce = (fn, delay = 800) => {
  const timerRef = useRef(null);
  const fnRef = useRef(fn);

  // Keep callback ref updated with the latest function
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const debouncedFn = useCallback(
    (...args) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    },
    [delay]
  );

  return debouncedFn;
};
