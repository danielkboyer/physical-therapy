import { createTRPCClient, httpBatchLink } from '@trpc/client';

// Copy the AppRouter type from web-app
// This should match web-app/lib/trpc/root.ts
import type { AppRouter } from './types/app-router';

const API_BASE_URL = 'http://localhost:3000'; // Change for production

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_BASE_URL}/api/trpc`,
      headers: () => ({
        'Content-Type': 'application/json',
      }),
    }),
  ],
});
