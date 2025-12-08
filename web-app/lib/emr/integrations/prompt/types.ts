/**
 * Prompt EMR-specific types
 * These represent the data structures as they exist in the Prompt EMR system
 * Based on API response from: https://go.promptemr.com/api/api/patients/{patientId}
 */

export interface PromptPatient {
  PersonId: string;
  PatientId: string;
  FirstName: string;
  LastName: string;
  PreferredName?: string;
  MiddleName?: string;
  DateOfBirth?: string;
  Email?: string;
  MobilePhone?: string;
  HomePhone?: string;
  Street1?: string;
  Street2?: string;
  City?: string;
  StateOrProvince?: string;
  PostalCode?: string;
  CountryCode?: string;
  Gender?: string;
  SSN?: string;
  ExternalId?: string;
  ExternalSource?: string;
  Inactive?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PromptVisit {
  id: string;
  patientId: string;
  appointmentDate: string;
  appointmentType?: string;
  chiefComplaint?: string;
  clinicalNotes?: string;
}
