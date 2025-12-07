import { router } from './trpc';
import { authRouter } from './routers/auth';
import { patientRouter } from './routers/patient';
import { visitRouter } from './routers/visit';
import { recordingRouter } from './routers/recording';

/**
 * Main tRPC router
 * All routers are merged here
 */
export const appRouter = router({
  auth: authRouter,
  patient: patientRouter,
  visit: visitRouter,
  recording: recordingRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
