import React from 'react';
import { useToastContext } from './Toast';

/**
 * PUBLIC_INTERFACE
 * useToast returns helpers to show Ocean Professional-styled toast notifications.
 *
 * Example:
 *  const { notify, success, error, info, warning } = useToast();
 *  success('Profile updated', 'Your details were saved');
 */
export function useToast() {
  const { notify, remove } = useToastContext();

  const info = React.useCallback(
    (title, description = '') => notify({ title, description, type: 'info' }),
    [notify]
  );
  const success = React.useCallback(
    (title, description = '') => notify({ title, description, type: 'success' }),
    [notify]
  );
  const error = React.useCallback(
    (title, description = '') => notify({ title, description, type: 'error' }),
    [notify]
  );
  const warning = React.useCallback(
    (title, description = '') => notify({ title, description, type: 'warning' }),
    [notify]
  );

  return { notify, remove, info, success, error, warning };
}
