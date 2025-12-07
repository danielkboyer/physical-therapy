import { IEmrIntegration } from "../../interfaces";
import { EmrType } from "../../types";
import { PromptDataConverter } from "./converter";
import { PromptPageDetector } from "./page-detector";
import { PromptDataClient } from "./data-client";

/**
 * Prompt EMR Integration
 * Implements the IEmrIntegration interface for the Prompt EMR system
 */
export const PromptIntegration: IEmrIntegration = {
  emrType: EmrType.PROMPT,
  displayName: "Prompt EMR",
  converter: new PromptDataConverter(),
  pageDetector: new PromptPageDetector(),
  dataClient: new PromptDataClient(),
};
