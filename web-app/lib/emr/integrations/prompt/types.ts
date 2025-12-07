/**
 * Prompt EMR-specific types
 * These represent the data structures as they exist in the Prompt EMR system
 */

export interface PromptPatient {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
}

export interface PromptVisit {
  id: string;
  patientId: string;
  appointmentDate: string;
  appointmentType?: string;
  chiefComplaint?: string;
  clinicalNotes?: string;
}
