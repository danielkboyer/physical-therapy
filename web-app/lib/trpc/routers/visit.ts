import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import {
  createVisit,
  getVisitsByClinic,
  getVisitsByPatient,
  getVisitById,
} from '../../db/visit';

export const visitSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  clinicId: z.string(),
  visitDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createVisitSchema = z.object({
  patientId: z.string(),
  clinicId: z.string(),
  visitDate: z.string().transform((str) => new Date(str)),
});

export const visitRouter = router({
  // TODO: Add authentication middleware to protect these endpoints
  create: publicProcedure
    .input(createVisitSchema)
    .mutation(async ({ input }) => {
      return await createVisit(
        input.patientId,
        input.clinicId,
        input.visitDate
      );
    }),

  getByClinic: publicProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ input }) => {
      return await getVisitsByClinic(input.clinicId);
    }),

  getByPatient: publicProcedure
    .input(z.object({ patientId: z.string() }))
    .query(async ({ input }) => {
      return await getVisitsByPatient(input.patientId);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await getVisitById(input.id);
    }),
});
