import {
  EmrType,
  StandardPatient,
  StandardVisit,
  PatientInput,
  VisitInput,
  EmrPageContext,
  EmrIntegrationConfig,
} from "./types";

/**
 * Base interface that all EMR integrations must implement
 */
export interface IEmrIntegration {
  /**
   * The type of EMR this integration handles
   */
  readonly emrType: EmrType;

  /**
   * The name of the EMR system (for display purposes)
   */
  readonly displayName: string;

  /**
   * Converter instance for this EMR
   */
  readonly converter: IEmrDataConverter;

  /**
   * Page detector instance for this EMR
   */
  readonly pageDetector: IEmrPageDetector;

  /**
   * Data client for fetching EMR data (handles both API and DOM scraping)
   */
  readonly dataClient: IEmrDataClient;
}

/**
 * Interface for converting EMR-specific data to our standard database format
 */
export interface IEmrDataConverter {
  /**
   * Convert EMR-specific patient data to our standard Patient format
   * @param emrPatient - The patient data from the EMR system
   * @returns Patient data that can be saved to our database
   */
  convertPatient(emrPatient: unknown): PatientInput;

  /**
   * Convert EMR-specific visit data to our standard Visit format
   * @param emrVisit - The visit data from the EMR system
   * @returns Visit data that can be saved to our database
   */
  convertVisit(emrVisit: unknown): VisitInput;

  /**
   * Convert our standard Patient format back to EMR-specific format (optional, for API writes)
   * @param standardPatient - Our standard patient data
   * @returns EMR-specific patient format
   */
  convertToEmrPatient?(standardPatient: StandardPatient): unknown;

  /**
   * Convert our standard Visit format back to EMR-specific format (optional, for API writes)
   * @param standardVisit - Our standard visit data
   * @returns EMR-specific visit format
   */
  convertToEmrVisit?(standardVisit: StandardVisit): unknown;
}

/**
 * Interface for detecting what page the user is on in the EMR
 */
export interface IEmrPageDetector {
  /**
   * Detect the current page type and context from the URL and DOM
   * @param url - The current URL
   * @param document - The DOM document
   * @returns Context about the current page
   */
  detectPage(url: string, document: Document): EmrPageContext;

  /**
   * Check if the current URL belongs to this EMR system
   * @param url - The URL to check
   * @returns True if this URL belongs to this EMR
   */
  isEmrUrl(url: string): boolean;
}

/**
 * Interface for fetching data from the EMR
 * Each integration decides internally whether to use API calls or DOM scraping
 */
export interface IEmrDataClient {
  /**
   * Fetch patient data by EMR patient ID
   * @param patientId - The patient ID in the EMR system
   * @param config - The EMR integration configuration (includes auth if needed)
   * @param document - The DOM document (optional, for scraping-based implementations)
   * @returns The EMR-specific patient data (to be converted via IEmrDataConverter)
   */
  fetchPatient(
    patientId: string,
    config: EmrIntegrationConfig,
    document?: Document
  ): Promise<unknown>;

  /**
   * Fetch visit data by EMR visit ID
   * @param visitId - The visit ID in the EMR system
   * @param config - The EMR integration configuration (includes auth if needed)
   * @param document - The DOM document (optional, for scraping-based implementations)
   * @returns The EMR-specific visit data (to be converted via IEmrDataConverter)
   */
  fetchVisit(
    visitId: string,
    config: EmrIntegrationConfig,
    document?: Document
  ): Promise<unknown>;

  /**
   * Fetch patient data from the current page (for scraping scenarios)
   * @param config - The EMR integration configuration
   * @param document - The DOM document to scrape
   * @returns The EMR-specific patient data, or null if not found
   */
  fetchPatientFromPage(
    config: EmrIntegrationConfig,
    document: Document
  ): Promise<unknown | null>;

  /**
   * Fetch visit data from the current page (for scraping scenarios)
   * @param config - The EMR integration configuration
   * @param document - The DOM document to scrape
   * @returns The EMR-specific visit data, or null if not found
   */
  fetchVisitFromPage(
    config: EmrIntegrationConfig,
    document: Document
  ): Promise<unknown | null>;

  /**
   * Fetch all patients (optional, with pagination)
   * @param config - The EMR integration configuration (includes auth if needed)
   * @param params - Optional pagination parameters
   * @returns Array of EMR-specific patient data
   */
  fetchPatients?(
    config: EmrIntegrationConfig,
    params?: { limit?: number; offset?: number }
  ): Promise<unknown[]>;

  /**
   * Fetch visits for a patient (optional)
   * @param patientId - The patient ID in the EMR system
   * @param config - The EMR integration configuration (includes auth if needed)
   * @returns Array of EMR-specific visit data
   */
  fetchVisitsByPatient?(
    patientId: string,
    config: EmrIntegrationConfig
  ): Promise<unknown[]>;

  /**
   * Check if the data client can connect/authenticate with the EMR
   * @param config - The EMR integration configuration
   * @returns True if connection is successful
   */
  canConnect(config: EmrIntegrationConfig): Promise<boolean>;
}
