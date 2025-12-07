/**
 * EMR Integration Module
 * Export all public types, interfaces, and functions for EMR integrations
 */

// Types
export {
  EmrType,
  EmrPageType,
  type EmrIntegration,
  type EmrIntegrationConfig,
  type EmrPageContext,
  type StandardPatient,
  type StandardVisit,
  type PatientInput,
  type VisitInput,
  type PromptAuthConfig,
  type WebPTAuthConfig,
  type ClinicientAuthConfig,
} from "./types";

// Interfaces
export type {
  IEmrIntegration,
  IEmrDataConverter,
  IEmrPageDetector,
  IEmrDataClient,
} from "./interfaces";

// Registry functions
export {
  getEmrIntegration,
  getEmrImplementation,
  getAllEmrImplementations,
} from "./registry";

// Database functions
export {
  createEmrIntegration,
  getEmrIntegrationsByClinic,
  getActiveEmrIntegration,
  getEmrIntegrationById,
  updateEmrIntegration,
  deleteEmrIntegration,
} from "../db/emr-integration";

// Individual integrations (for testing or direct use)
export { PromptIntegration } from "./integrations/prompt";
export { WebPTIntegration } from "./integrations/webpt";
export { ClinicientIntegration } from "./integrations/clinicient";
