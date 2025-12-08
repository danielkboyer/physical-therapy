import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import {
  createPatient,
  getPatientsByClinic,
  getPatientById,
  updatePatient,
} from '../../db/patient';

export const patientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  nickName: z.string().optional(),
  clinicId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nickName: z.string().nullish(),
  clinicId: z.string(),
  externalId: z.string(),
});

export const updatePatientSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nickName: z.string().optional(),
});

export const patientRouter = router({
  // TODO: Add authentication middleware to protect these endpoints
  create: publicProcedure
    .input(createPatientSchema)
    .mutation(async ({ input }) => {
      return await createPatient(
        input.firstName,
        input.lastName,
        input.nickName ?? undefined,
        input.clinicId,
        input.externalId
      );
    }),

  getByClinic: publicProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ input }) => {
      return await getPatientsByClinic(input.clinicId);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await getPatientById(input.id);
    }),

  update: publicProcedure
    .input(updatePatientSchema)
    .mutation(async ({ input }) => {
      return await updatePatient(
        input.id,
        input.firstName,
        input.lastName,
        input.nickName
      );
    }),
});
