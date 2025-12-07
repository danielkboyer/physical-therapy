/**
 * Shared EMR types used across backend and chrome extension
 * This ensures type consistency across the application
 */

export enum EmrType {
  PROMPT = 'prompt',
  WEBPT = 'webpt',
  CLINICIENT = 'clinicient',
}

export enum EmrPageType {
  UNKNOWN = 'unknown',
  PATIENT_LIST = 'patient_list',
  PATIENT_PROFILE = 'patient_profile',
  VISIT = 'visit',
  SCHEDULE = 'schedule',
  DOCUMENTATION = 'documentation',
}

export interface EmrPageContext {
  pageType: EmrPageType;
  patientId?: string;
  visitId?: string;
  url: string;
}
