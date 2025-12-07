import { IEmrDataConverter } from "../../interfaces";
import { PatientInput, VisitInput } from "../../types";
import { PromptPatient, PromptVisit } from "./types";

export class PromptDataConverter implements IEmrDataConverter {
  convertPatient(emrPatient: unknown): PatientInput {
    const patient = emrPatient as PromptPatient;

    return {
      firstName: patient.firstName,
      lastName: patient.lastName,
      nickName: patient.preferredName,
      externalId: patient.id,
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
