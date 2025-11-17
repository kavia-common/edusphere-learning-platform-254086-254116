import React from 'react';

/**
 * PUBLIC_INTERFACE
 * useDebounce returns a debounced value after delay.
 */
export function useDebounce(value, delay = 300) {
  /** Debounces the given value and returns stabilized result after delay ms. */
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
