import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './ErrorState';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Red de seguridad global: si algún componente lanza un error inesperado,
 * mostramos un estado elegante con reintento en lugar de una pantalla blanca.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Sin console.log en producción: el estado visible ya informa al usuario.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 'var(--space-6) var(--space-4)' }}>
          <ErrorState
            titulo="Algo salió mal de nuestro lado"
            detalle="Recargá la página para seguir. Si persiste, volvé en unos minutos."
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
