import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente de TanStack Query. Configuración conservadora:
 * - 1 reintento (si la API falla dos veces, mostramos ErrorState con botón Reintentar)
 * - sin refetch al enfocar la ventana (los intervalos ya están definidos por hook,
 *   respetando el límite de 10 req/min de football-data.org)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
