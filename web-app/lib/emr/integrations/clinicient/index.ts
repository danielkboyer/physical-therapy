import { IEmrIntegration } from "../../interfaces";
import { EmrType, EmrPageType } from "../../types";

/**
 * Clinicient EMR Integration (Not yet implemented)
 */
export const ClinicientIntegration: IEmrIntegration = {
  emrType: EmrType.CLINICIENT,
  displayName: "Clinicient",
  converter: {
    convertPatient: () => {
      throw new Error("Clinicient integration not implemented yet");
    },
    convertVisit: () => {
      throw new Error("Clinicient integration not implemented yet");
    },
  },
  pageDetector: {
    isEmrUrl: () => false,
    detectPage: (url) => ({
      pageType: EmrPageType.UNKNOWN,
      url,
    }),
  },
  dataClient: {
    fetchPatient: async () => {
      throw new Error("Clinicient integration not implemented yet");
    },
    fetchVisit: async () => {
      throw new Error("Clinicient integration not implemented yet");
    },
    fetchPatientFromPage: async () => {
      throw new Error("Clinicient integration not implemented yet");
    },
    fetchVisitFromPage: async () => {
      throw new Error("Clinicient integration not implemented yet");
    },
    canConnect: async () => {
      throw new Error("Clinicient integration not implemented yet");
    },
  },
};
