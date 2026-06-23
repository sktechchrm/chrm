import React from 'react';

interface Props { children: React.ReactNode; moduleName?: string; }
interface State { hasError: boolean; error: Error | null; }

/**
 * ErrorBoundary — wraps each HR module in RewardApp.tsx.
 * If a module throws during render, the whole app stays alive.
 * Only the affected module shows a recovery card.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.moduleName ?? 'Module'} crashed:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '40vh', gap: '12px',
          fontFamily: 'var(--font-sans, sans-serif)', color: 'var(--color-text-secondary)',
          padding: '32px',
        }}>
          <div style={{ fontSize: '32px' }}>⚠</div>
          <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {this.props.moduleName ?? 'Module'} encountered an error
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '8px', padding: '8px 20px', borderRadius: '8px',
              background: 'var(--color-background-secondary)', border: '1px solid var(--color-border-secondary)',
              cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-primary)',
              fontFamily: 'inherit',
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
