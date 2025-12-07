import { IEmrDataClient } from "../../interfaces";
import { EmrIntegrationConfig, EmrType } from "../../types";
import { PromptPatient, PromptVisit } from "./types";

export class PromptDataClient implements IEmrDataClient {
  async fetchPatient(
    patientId: string,
    config: EmrIntegrationConfig,
    document?: Document
  ): Promise<PromptPatient> {
    if (config.emrType !== EmrType.PROMPT) {
      throw new Error("Invalid EMR type for PromptDataClient");
    }

    // TODO: Implement actual scraping logic based on Prompt EMR's DOM structure
    // This is a placeholder that shows the expected structure

    if (!document) {
      throw new Error("Document is required for Prompt EMR patient scraping");
    }

    // Example scraping logic (update based on actual Prompt DOM):
    const patient: PromptPatient = {
      id: patientId,
      firstName: this.scrapeText(document, '[data-patient-firstname]') || 'Unknown',
      lastName: this.scrapeText(document, '[data-patient-lastname]') || 'Unknown',
      preferredName: this.scrapeText(document, '[data-patient-nickname]'),
      dateOfBirth: this.scrapeText(document, '[data-patient-dob]'),
      email: this.scrapeText(document, '[data-patient-email]'),
      phone: this.scrapeText(document, '[data-patient-phone]'),
    };

    return patient;
  }

  async fetchVisit(
    visitId: string,
    config: EmrIntegrationConfig,
    document?: Document
  ): Promise<PromptVisit> {
    if (config.emrType !== EmrType.PROMPT) {
      throw new Error("Invalid EMR type for PromptDataClient");
    }

    // TODO: Implement actual scraping logic based on Prompt EMR's DOM structure

    if (!document) {
      throw new Error("Document is required for Prompt EMR visit scraping");
    }

    // Example scraping logic (update based on actual Prompt DOM):
    const visit: PromptVisit = {
      id: visitId,
      patientId: this.scrapeText(document, '[data-visit-patient-id]') || '',
      appointmentDate: this.scrapeText(document, '[data-visit-date]') || new Date().toISOString(),
      appointmentType: this.scrapeText(document, '[data-visit-type]'),
      chiefComplaint: this.scrapeText(document, '[data-visit-complaint]'),
      clinicalNotes: this.scrapeText(document, '[data-visit-notes]'),
    };

    return visit;
  }

  async fetchPatientFromPage(
    config: EmrIntegrationConfig,
    document: Document
  ): Promise<PromptPatient | null> {
    if (config.emrType !== EmrType.PROMPT) {
      throw new Error("Invalid EMR type for PromptDataClient");
    }

    // TODO: Implement actual scraping logic to extract patient ID from page
    const patientId = this.scrapeText(document, '[data-patient-id]');

    if (!patientId) {
      return null;
    }

    return this.fetchPatient(patientId, config, document);
  }

  async fetchVisitFromPage(
    config: EmrIntegrationConfig,
    document: Document
  ): Promise<PromptVisit | null> {
    if (config.emrType !== EmrType.PROMPT) {
      throw new Error("Invalid EMR type for PromptDataClient");
    }

    // TODO: Implement actual scraping logic to extract visit ID from page
    const visitId = this.scrapeText(document, '[data-visit-id]');

    if (!visitId) {
      return null;
    }

    return this.fetchVisit(visitId, config, document);
  }

  async canConnect(config: EmrIntegrationConfig): Promise<boolean> {
    if (config.emrType !== EmrType.PROMPT) {
      return false;
    }

    // For DOM scraping, we can always "connect" (no auth needed)
    return true;
  }

  /**
   * Helper method to scrape text from a DOM element
   */
  private scrapeText(document: Document, selector: string): string | undefined {
    const element = document.querySelector(selector);
    return element?.textContent?.trim() || undefined;
  }
}
