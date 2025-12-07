import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './root';

/**
 * Create a tRPC client for use in the browser/Chrome extension
 * @param baseUrl - The base URL of your API (e.g., 'http://localhost:3000')
 */
export function createClient(baseUrl: string) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/api/trpc`,
        headers: () => ({
          'Content-Type': 'application/json',
        }),
      }),
    ],
  });
}

// For web-app usage
export const trpc = createClient(
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
);
