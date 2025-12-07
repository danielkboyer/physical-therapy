import { router } from './trpc';
import { authRouter } from './routers/auth';
/**
 * Main tRPC router
 * All routers are merged here
 */
export const appRouter = router({
    auth: authRouter,
});
