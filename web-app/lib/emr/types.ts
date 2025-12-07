import type { Patient } from "../db/patient";
import type { Visit } from "../db/visit";
import { EmrType, EmrPageType, type EmrPageContext } from "@pt-app/shared-models";

// Re-export shared EMR types
export { EmrType, EmrPageType };
export type { EmrPageContext };

// Auth configurations for each EMR type
export interface PromptAuthConfig {
  // Prompt doesn't need auth for now (DOM scraping)
  // Future: could add session tokens if needed
}

export interface WebPTAuthConfig {
  apiKey: string;
  apiSecret: string;
}

export interface ClinicientAuthConfig {
  username: string;
  apiToken: string;
  organizationId: string;
}

// Discriminated union for EMR integrations
export type EmrIntegrationConfig =
  | {
      emrType: EmrType.PROMPT;
      authConfig?: PromptAuthConfig;
    }
  | {
      emrType: EmrType.WEBPT;
      authConfig: WebPTAuthConfig;
    }
  | {
      emrType: EmrType.CLINICIENT;
      authConfig: ClinicientAuthConfig;
    };

// Base EMR Integration type
export interface EmrIntegration {
  id: string;
  clinicId: string;
  emrType: EmrType;
  authConfig?: PromptAuthConfig | WebPTAuthConfig | ClinicientAuthConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Typed EMR Integration variants
export type PromptEmrIntegration = EmrIntegration & {
  emrType: EmrType.PROMPT;
  authConfig?: PromptAuthConfig;
};

export type WebPTEmrIntegration = EmrIntegration & {
  emrType: EmrType.WEBPT;
  authConfig: WebPTAuthConfig;
};

export type ClinicientEmrIntegration = EmrIntegration & {
  emrType: EmrType.CLINICIENT;
  authConfig: ClinicientAuthConfig;
};

// Re-export database types as the standard types
// EMR converters will convert from EMR-specific formats to these types
export type { Patient as StandardPatient, Visit as StandardVisit };

// Input type for creating a patient from EMR data (without id, clinicId, timestamps)
export type PatientInput = Omit<
  Patient,
  "id" | "clinicId" | "createdAt" | "updatedAt"
>;

// Input type for creating a visit from EMR data (without id, clinicId, patientId, timestamps)
export type VisitInput = Omit<
  Visit,
  "id" | "clinicId" | "patientId" | "createdAt" | "updatedAt"
>;
