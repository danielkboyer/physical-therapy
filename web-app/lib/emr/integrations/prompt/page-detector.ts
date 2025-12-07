import { IEmrPageDetector } from "../../interfaces";
import { EmrPageContext, EmrPageType } from "../../types";

export class PromptPageDetector implements IEmrPageDetector {
  isEmrUrl(url: string): boolean {
    // TODO: Update this with the actual Prompt EMR URL pattern
    // For now, this is a placeholder
    return url.includes("promptemr.com") || url.includes("prompt-ehr.com");
  }

  detectPage(url: string, _document: Document): EmrPageContext {
    if (!this.isEmrUrl(url)) {
      return {
        pageType: EmrPageType.UNKNOWN,
        url,
      };
    }

    // TODO: Implement actual page detection logic based on Prompt EMR's URL structure and DOM
    // This is a placeholder implementation

    const context: EmrPageContext = {
      pageType: EmrPageType.UNKNOWN,
      url,
    };

    // Example detection logic (update based on actual Prompt EMR structure):
    if (url.includes("/patients") && url.match(/\/patients\/\d+/)) {
      // URL pattern like: /patients/123
      const patientId = url.match(/\/patients\/(\d+)/)?.[1];
      context.pageType = EmrPageType.PATIENT_PROFILE;
      context.patientId = patientId;
    } else if (url.includes("/patients")) {
      // URL pattern like: /patients
      context.pageType = EmrPageType.PATIENT_LIST;
    } else if (url.includes("/visits") && url.match(/\/visits\/\d+/)) {
      // URL pattern like: /visits/123
      const visitId = url.match(/\/visits\/(\d+)/)?.[1];
      context.pageType = EmrPageType.VISIT;
      context.visitId = visitId;
    } else if (url.includes("/schedule")) {
      context.pageType = EmrPageType.SCHEDULE;
    } else if (url.includes("/documentation") || url.includes("/notes")) {
      context.pageType = EmrPageType.DOCUMENTATION;
    }

    return context;
  }
}
