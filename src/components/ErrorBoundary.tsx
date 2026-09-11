import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center justify-center text-rose-400 mb-4 animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black mb-2">Une erreur inattendue est survenue</h1>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            L'affichage de l'application a rencontré une interruption. Cliquez ci-dessous pour recharger l'interface en toute sécurité.
          </p>
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 text-left font-mono text-[11px] text-rose-300 max-w-lg w-full mb-6 overflow-x-auto">
            {this.state.error?.message || 'Erreur inconnue'}
          </div>
          <button
            onClick={this.handleReload}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Recharger l'application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
