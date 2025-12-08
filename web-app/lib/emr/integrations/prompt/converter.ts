import { IEmrDataConverter } from "../../interfaces";
import { PatientInput, VisitInput } from "../../types";
import { PromptPatient, PromptVisit } from "./types";

export class PromptDataConverter implements IEmrDataConverter {
  convertPatient(emrPatient: unknown): PatientInput {
    const patient = emrPatient as PromptPatient;

    return {
      firstName: patient.FirstName,
      lastName: patient.LastName,
      nickName: patient.PreferredName,
      externalId: patient.PatientId, // Use PatientId as the external ID
    };
  }

  convertVisit(emrVisit: unknown): VisitInput {
    const visit = emrVisit as PromptVisit;

    return {
      visitDate: new Date(visit.appointmentDate),
      externalId: visit.id,
    };
  }
}
