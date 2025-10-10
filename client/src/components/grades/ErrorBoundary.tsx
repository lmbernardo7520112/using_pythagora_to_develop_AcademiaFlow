// src/components/ErrorBoundary.tsx
import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // You can log to remote here
    // console.error('ErrorBoundary caught', error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold">Algo deu errado</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            O aplicativo encontrou um erro. Você pode reabrir a página ou tentar novamente.
          </p>
          <div className="mt-4">
            <button className="px-3 py-1 border rounded" onClick={() => window.location.reload()}>
              Recarregar
            </button>
            <button className="ml-3 px-3 py-1 border rounded" onClick={this.reset}>
              Tentar limpar
            </button>
          </div>
          <pre className="mt-4 text-xs text-red-600">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
