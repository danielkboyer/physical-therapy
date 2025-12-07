import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import {
  createEmrIntegration,
  getEmrIntegrationsByClinic,
  getActiveEmrIntegration,
  updateEmrIntegration,
  deleteEmrIntegration,
} from "../../db/emr-integration";
import { EmrType } from "../../emr/types";
import { getEmrIntegration } from "../../emr/registry";

// Zod schemas for validation
const authConfigSchema = z.record(z.unknown()).optional();

const emrIntegrationConfigSchema = z.union([
  z.object({
    emrType: z.literal(EmrType.PROMPT),
    authConfig: z.record(z.unknown()).optional(),
  }),
  z.object({
    emrType: z.literal(EmrType.WEBPT),
    authConfig: z.object({
      apiKey: z.string(),
      apiSecret: z.string(),
    }),
  }),
  z.object({
    emrType: z.literal(EmrType.CLINICIENT),
    authConfig: z.object({
      username: z.string(),
      apiToken: z.string(),
      organizationId: z.string(),
    }),
  }),
]);

export const emrIntegrationRouter = router({
  // Create a new EMR integration
  create: publicProcedure
    .input(
      z.object({
        clinicId: z.string(),
        config: emrIntegrationConfigSchema,
      })
    )
    .mutation(async ({ input }) => {
      return await createEmrIntegration(input.clinicId, input.config);
    }),

  // Get all EMR integrations for a clinic
  getByClinic: publicProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ input }) => {
      return await getEmrIntegrationsByClinic(input.clinicId);
    }),

  // Get the active EMR integration for a clinic
  getActive: publicProcedure
    .input(z.object({ clinicId: z.string() }))
    .query(async ({ input }) => {
      return await getActiveEmrIntegration(input.clinicId);
    }),

  // Get the appropriate EMR integration with implementation
  getIntegration: publicProcedure
    .input(
      z.object({
        clinicId: z.string(),
        currentUrl: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return await getEmrIntegration(input.clinicId, input.currentUrl);
    }),

  // Update an EMR integration
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        authConfig: authConfigSchema,
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await updateEmrIntegration(input.id, {
        authConfig: input.authConfig,
        isActive: input.isActive,
      });
    }),

  // Delete an EMR integration
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await deleteEmrIntegration(input.id);
      return { success: true };
    }),

  // Sync patient from EMR to our database
  syncPatient: publicProcedure
    .input(
      z.object({
        clinicId: z.string(),
        patientId: z.string(), // External EMR patient ID
        currentUrl: z.string().optional(),
        // For scraping-based integrations, we'll need to pass the DOM data
        domData: z.string().optional(), // Serialized DOM or specific data
      })
    )
    .mutation(async ({ input }) => {
      const emr = await getEmrIntegration(input.clinicId, input.currentUrl);

      if (!emr) {
        throw new Error("No active EMR integration found for this clinic");
      }

      // TODO: Implement actual patient sync logic
      // This would:
      // 1. Use emr.integration.dataClient to fetch patient data
      // 2. Use emr.integration.converter to convert to our format
      // 3. Check if patient exists by externalId
      // 4. Create or update patient in our database

      throw new Error("syncPatient not fully implemented yet");
    }),

  // Sync visit from EMR to our database
  syncVisit: publicProcedure
    .input(
      z.object({
        clinicId: z.string(),
        visitId: z.string(), // External EMR visit ID
        patientId: z.string(), // Our internal patient ID
        currentUrl: z.string().optional(),
        domData: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const emr = await getEmrIntegration(input.clinicId, input.currentUrl);

      if (!emr) {
        throw new Error("No active EMR integration found for this clinic");
      }

      // TODO: Implement actual visit sync logic
      // This would:
      // 1. Use emr.integration.dataClient to fetch visit data
      // 2. Use emr.integration.converter to convert to our format
      // 3. Check if visit exists by externalId
      // 4. Create or update visit in our database

      throw new Error("syncVisit not fully implemented yet");
    }),
});
