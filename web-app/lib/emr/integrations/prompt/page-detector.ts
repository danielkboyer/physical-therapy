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

    const context: EmrPageContext = {
      pageType: EmrPageType.UNKNOWN,
      url,
    };

    // URL pattern: https://go.promptemr.com/patients/{uuid}
    if (url.includes("/patients/")) {
      const match = url.match(/\/patients\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (match) {
        context.pageType = EmrPageType.PATIENT_PROFILE;
        context.patientId = match[1];
      } else {
        context.pageType = EmrPageType.PATIENT_LIST;
      }
    } else if (url.includes("/patients")) {
      context.pageType = EmrPageType.PATIENT_LIST;
    } else if (url.includes("/visits/")) {
      const match = url.match(/\/visits\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (match) {
        context.pageType = EmrPageType.VISIT;
        context.visitId = match[1];
      }
    } else if (url.includes("/schedule") || url.includes("/calendar")) {
      context.pageType = EmrPageType.SCHEDULE;
    } else if (url.includes("/documentation") || url.includes("/notes")) {
      context.pageType = EmrPageType.DOCUMENTATION;
    }

    return context;
  }
}
