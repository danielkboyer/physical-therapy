import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from './types/app-router';

const API_BASE_URL = 'http://localhost:3000'; // Change for production

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Create tRPC client configuration
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${API_BASE_URL}/api/trpc`,
      headers: () => ({
        'Content-Type': 'application/json',
      }),
    }),
  ],
});
