import { EmrType, EmrIntegration as EmrIntegrationDb } from "./types";
import { IEmrIntegration } from "./interfaces";
import { getEmrIntegrationsByClinic } from "../db/emr-integration";
import { PromptIntegration } from "./integrations/prompt";
import { WebPTIntegration } from "./integrations/webpt";
import { ClinicientIntegration } from "./integrations/clinicient";

/**
 * Record of all EMR integration implementations
 * Each EMR type must have a corresponding implementation
 */
const emrImplementations: Record<EmrType, IEmrIntegration> = {
  [EmrType.PROMPT]: PromptIntegration,
  [EmrType.WEBPT]: WebPTIntegration,
  [EmrType.CLINICIENT]: ClinicientIntegration,
};

/**
 * Get the appropriate EMR integration for a clinic
 * @param clinicId - The clinic ID
 * @param currentUrl - The current URL (optional, used to detect which integration to use if multiple are active)
 * @returns The EMR integration and its database config, or null if none found
 */
export async function getEmrIntegration(
  clinicId: string,
  currentUrl?: string
): Promise<{
  integration: IEmrIntegration;
  config: EmrIntegrationDb;
} | null> {
  // Fetch all integrations for this clinic from the database
  const dbIntegrations = await getEmrIntegrationsByClinic(clinicId);

  // Filter to only active integrations
  const activeIntegrations = dbIntegrations.filter((int) => int.isActive);

  if (activeIntegrations.length === 0) {
    return null;
  }

  let selectedConfig: EmrIntegrationDb;

  // If there's only one active integration, use it
  if (activeIntegrations.length === 1) {
    selectedConfig = activeIntegrations[0];
  } else if (currentUrl) {
    // If there are multiple, use the URL to detect which one
    const matchingIntegration = activeIntegrations.find((dbInt) => {
      const implementation = emrImplementations[dbInt.emrType];
      return implementation.pageDetector.isEmrUrl(currentUrl);
    });

    if (!matchingIntegration) {
      // No URL match, use the first one
      selectedConfig = activeIntegrations[0];
    } else {
      selectedConfig = matchingIntegration;
    }
  } else {
    // No URL provided and multiple integrations, use the first one
    selectedConfig = activeIntegrations[0];
  }

  // Get the implementation for this EMR type
  const implementation = emrImplementations[selectedConfig.emrType];

  return {
    integration: implementation,
    config: selectedConfig,
  };
}

/**
 * Get an EMR implementation by type directly
 * This is useful for testing or when you know the exact EMR type
 */
export function getEmrImplementation(emrType: EmrType): IEmrIntegration {
  return emrImplementations[emrType];
}

/**
 * Get all registered EMR implementations
 */
export function getAllEmrImplementations(): IEmrIntegration[] {
  return Object.values(emrImplementations);
}
