import React from 'react';

/**
 * PUBLIC_INTERFACE
 * usePagination manages page and pageSize and exposes helpers.
 */
export function usePagination(initial = { page: 1, pageSize: 12 }) {
  /** Returns { page, pageSize, setPage, setPageSize, next, prev } */
  const [page, setPage] = React.useState(initial.page || 1);
  const [pageSize, setPageSize] = React.useState(initial.pageSize || 12);

  const next = React.useCallback(() => setPage((p) => p + 1), []);
  const prev = React.useCallback(() => setPage((p) => Math.max(1, p - 1)), []);

  return { page, pageSize, setPage, setPageSize, next, prev };
}
