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

    if (!document) {
      throw new Error("Document is required for Prompt EMR patient scraping");
    }

    // Extract data from the patient details page
    // The name is in a div with class "text-h4 text-p-gray600" that contains the full name with nickname
    const nameElement = document.querySelector('.text-h4.text-p-gray600');
    const fullNameText = nameElement?.textContent?.trim() || '';

    // Parse name - format is like: Danny "Dboy" Boyer
    let firstName = '';
    let lastName = '';
    let nickName: string | undefined;

    // Extract nickname from quotes
    const nicknameMatch = fullNameText.match(/"([^"]+)"/);
    if (nicknameMatch) {
      nickName = nicknameMatch[1];
    }

    // Remove nickname from full name to get first and last name
    const nameWithoutNickname = fullNameText.replace(/"[^"]+"/, '').trim();
    const nameParts = nameWithoutNickname.split(' ').filter(part => part.length > 0);

    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    } else if (nameParts.length === 1) {
      firstName = nameParts[0];
    }

    // Extract other details from the detail rows
    const details: Record<string, string> = {};
    const detailRows = document.querySelectorAll('.p-text-body');

    detailRows.forEach(row => {
      const label = row.querySelector('.p-text-caption.text-p-gray500')?.textContent?.trim();
      const value = row.querySelector('.text-p-gray600')?.textContent?.trim();

      if (label && value && value !== '-') {
        details[label] = value;
      }
    });

    // Build patient object
    const patient: PromptPatient = {
      PatientId: patientId,
      PersonId: patientId,
      FirstName: details['Name']?.split(' ')[0] || firstName,
      LastName: details['Name']?.split(' ').slice(1).join(' ') || lastName,
      PreferredName: details['Name Preference'] || nickName,
      MiddleName: undefined, // Extract middle initial from full name if present
      DateOfBirth: details['Date of Birth'],
      Email: details['Email'],
      MobilePhone: details['Mobile Phone'],
      HomePhone: details['Home Phone'],
      Street1: undefined,
      Street2: undefined,
      City: undefined,
      StateOrProvince: undefined,
      PostalCode: undefined,
      Gender: details['Gender w/ Insurance'],
    };

    // Parse address if present
    const address = details['Address'];
    if (address) {
      const addressLines = address.split('\n').map(line => line.trim());
      if (addressLines.length >= 2) {
        patient.Street1 = addressLines[0];

        // Parse city, state, zip from last line (e.g., "Sandy, UT 84070")
        const cityStateZip = addressLines[addressLines.length - 1];
        const match = cityStateZip.match(/^([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
        if (match) {
          patient.City = match[1];
          patient.StateOrProvince = match[2];
          patient.PostalCode = match[3];
        }
      }
    }

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

    // Extract patient ID from the URL
    const url = document.location?.href || window.location.href;
    const match = url.match(/\/patients\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);

    if (!match) {
      return null;
    }

    const patientId = match[1];
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
