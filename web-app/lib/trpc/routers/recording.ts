import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import {
  createRecording,
  getRecordingsByVisit,
  getRecordingById,
  updateRecording,
} from '../../db/recording';

export const recordingSchema = z.object({
  id: z.string(),
  visitId: z.string(),
  audioData: z.string().optional(),
  transcription: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createRecordingSchema = z.object({
  visitId: z.string(),
  audioData: z.string().optional(),
  transcription: z.string(),
});

export const updateRecordingSchema = z.object({
  id: z.string(),
  audioData: z.string().optional(),
  transcription: z.string(),
});

export const recordingRouter = router({
  // TODO: Add authentication middleware to protect these endpoints
  create: publicProcedure
    .input(createRecordingSchema)
    .mutation(async ({ input }) => {
      return await createRecording(
        input.visitId,
        input.audioData,
        input.transcription
      );
    }),

  getByVisit: publicProcedure
    .input(z.object({ visitId: z.string() }))
    .query(async ({ input }) => {
      return await getRecordingsByVisit(input.visitId);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await getRecordingById(input.id);
    }),

  update: publicProcedure
    .input(updateRecordingSchema)
    .mutation(async ({ input }) => {
      return await updateRecording(
        input.id,
        input.audioData,
        input.transcription
      );
    }),
});
