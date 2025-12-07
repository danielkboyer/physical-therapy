import { IEmrIntegration } from "../../interfaces";
import { EmrType, EmrPageType } from "../../types";

/**
 * WebPT EMR Integration (Not yet implemented)
 */
export const WebPTIntegration: IEmrIntegration = {
  emrType: EmrType.WEBPT,
  displayName: "WebPT",
  converter: {
    convertPatient: () => {
      throw new Error("WebPT integration not implemented yet");
    },
    convertVisit: () => {
      throw new Error("WebPT integration not implemented yet");
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
      throw new Error("WebPT integration not implemented yet");
    },
    fetchVisit: async () => {
      throw new Error("WebPT integration not implemented yet");
    },
    fetchPatientFromPage: async () => {
      throw new Error("WebPT integration not implemented yet");
    },
    fetchVisitFromPage: async () => {
      throw new Error("WebPT integration not implemented yet");
    },
    canConnect: async () => {
      throw new Error("WebPT integration not implemented yet");
    },
  },
};
