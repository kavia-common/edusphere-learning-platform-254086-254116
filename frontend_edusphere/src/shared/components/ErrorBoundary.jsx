import React from 'react';
import { getLogger } from '../utils/logger';
import { ServerErrorFallback } from '../../pages/error/ServerError';

const logger = getLogger('ErrorBoundary');

/**
 * PUBLIC_INTERFACE
 * ErrorBoundary catches render errors and shows a graceful fallback UI.
 *
 * @returns {React.ReactNode} children or fallback UI
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true, errorId: Math.random().toString(36).slice(2) };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Unhandled UI error', { error: String(error), stack: errorInfo?.componentStack });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ paddingTop: '2rem' }}>
          <section className="app-surface card" role="alert" aria-live="assertive">
            <ServerErrorFallback errorId={this.state.errorId} onRetry={this.handleReload} />
          </section>
        </div>
      );
    }
    // eslint-disable-next-line react/prop-types
    return this.props.children;
  }
}
