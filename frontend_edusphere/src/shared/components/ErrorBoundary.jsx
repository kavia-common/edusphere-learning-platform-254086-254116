import React from 'react';
import { getLogger } from '../utils/logger';

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
            <h2>Something went wrong.</h2>
            <p>We encountered an unexpected error. Please try reloading the page.</p>
            <p style={{ opacity: 0.7, fontSize: 12 }}>Error ID: {this.state.errorId}</p>
            <button className="btn btn-primary" onClick={this.handleReload}>Reload</button>
          </section>
        </div>
      );
    }
    // eslint-disable-next-line react/prop-types
    return this.props.children;
  }
}
