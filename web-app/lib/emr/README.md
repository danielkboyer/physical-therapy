# EMR Integration System

This module provides a clean abstraction layer for integrating with different Electronic Medical Record (EMR) systems. The system is designed to be extensible, allowing you to easily add new EMR integrations without modifying the core application code.

## Architecture Overview

The EMR integration system follows a plugin architecture with the following components:

1. **Types** (`types.ts`) - Core type definitions and discriminated unions for EMR configurations
2. **Interfaces** (`interfaces.ts`) - Interface contracts that all EMR integrations must implement
3. **Registry** (`registry.ts`) - Centralized registry that manages and provides access to EMR integrations
4. **Database Models** (`../db/emr-integration.ts`) - Database operations for storing EMR integration configurations
5. **Individual Integrations** (`integrations/*/`) - Concrete implementations for specific EMR systems

## Key Concepts

### EMR Integration Components

Each EMR integration consists of three main components:

1. **Data Converter** (`IEmrDataConverter`)
   - Converts EMR-specific patient/visit data to our standard database format
   - Handles the transformation of external EMR data structures

2. **Page Detector** (`IEmrPageDetector`)
   - Detects which page the user is currently on in the EMR system
   - Identifies the EMR system from the URL
   - Returns context about the current page (patient profile, visit, etc.)

3. **Data Client** (`IEmrDataClient`)
   - Fetches data from the EMR system (via API or DOM scraping)
   - Abstracts away the implementation details (API vs scraping)
   - Returns EMR-specific data structures

### Discriminated Union for Auth Config

The system uses TypeScript discriminated unions to ensure type safety for EMR-specific authentication configurations:

```typescript
type EmrIntegrationConfig =
  | { emrType: EmrType.PROMPT; authConfig?: PromptAuthConfig }
  | { emrType: EmrType.WEBPT; authConfig: WebPTAuthConfig }
  | { emrType: EmrType.CLINICIENT; authConfig: ClinicientAuthConfig };
```

This ensures that when you create an integration for a specific EMR type, TypeScript will enforce the correct auth configuration structure.

## Adding a New EMR Integration

To add support for a new EMR system:

### 1. Add the EMR type to the enum

In `types.ts`:
```typescript
export enum EmrType {
  PROMPT = "prompt",
  WEBPT = "webpt",
  CLINICIENT = "clinicient",
  YOUR_NEW_EMR = "your_new_emr", // Add here
}
```

### 2. Define the auth configuration type

In `types.ts`:
```typescript
export interface YourEmrAuthConfig {
  apiKey: string;
  customField: string;
  // Add any EMR-specific auth fields
}
```

### 3. Add to the discriminated union

In `types.ts`:
```typescript
export type EmrIntegrationConfig =
  | { emrType: EmrType.PROMPT; authConfig?: PromptAuthConfig }
  | { emrType: EmrType.WEBPT; authConfig: WebPTAuthConfig }
  | { emrType: EmrType.CLINICIENT; authConfig: ClinicientAuthConfig }
  | { emrType: EmrType.YOUR_NEW_EMR; authConfig: YourEmrAuthConfig }; // Add here
```

### 4. Create the integration folder

Create a new folder: `integrations/your-emr/`

### 5. Implement the components

Create the following files in your integration folder:

**types.ts** - EMR-specific data structures:
```typescript
export interface YourEmrPatient {
  id: string;
  firstName: string;
  lastName: string;
  // EMR-specific fields
}

export interface YourEmrVisit {
  id: string;
  patientId: string;
  date: string;
  // EMR-specific fields
}
```

**converter.ts** - Data conversion logic:
```typescript
import { IEmrDataConverter } from "../../interfaces";
import { PatientInput, VisitInput } from "../../types";
import { YourEmrPatient, YourEmrVisit } from "./types";

export class YourEmrDataConverter implements IEmrDataConverter {
  convertPatient(emrPatient: unknown): PatientInput {
    const patient = emrPatient as YourEmrPatient;
    return {
      firstName: patient.firstName,
      lastName: patient.lastName,
      externalId: patient.id,
      // Map other fields
    };
  }

  convertVisit(emrVisit: unknown): VisitInput {
    const visit = emrVisit as YourEmrVisit;
    return {
      visitDate: new Date(visit.date),
      externalId: visit.id,
      // Map other fields
    };
  }
}
```

**page-detector.ts** - URL and page detection:
```typescript
import { IEmrPageDetector } from "../../interfaces";
import { EmrPageContext, EmrPageType } from "../../types";

export class YourEmrPageDetector implements IEmrPageDetector {
  isEmrUrl(url: string): boolean {
    return url.includes("your-emr-domain.com");
  }

  detectPage(url: string, document: Document): EmrPageContext {
    // Implement page detection logic
    if (url.includes("/patients/")) {
      return {
        pageType: EmrPageType.PATIENT_PROFILE,
        patientId: extractPatientId(url),
        url,
      };
    }
    // Add more detection logic
    return { pageType: EmrPageType.UNKNOWN, url };
  }
}
```

**data-client.ts** - Data fetching (API or scraping):
```typescript
import { IEmrDataClient } from "../../interfaces";
import { EmrIntegrationConfig, EmrType } from "../../types";
import { YourEmrPatient, YourEmrVisit } from "./types";

export class YourEmrDataClient implements IEmrDataClient {
  async fetchPatient(
    patientId: string,
    config: EmrIntegrationConfig,
    document?: Document
  ): Promise<YourEmrPatient> {
    // Implement API call or DOM scraping
  }

  async fetchVisit(
    visitId: string,
    config: EmrIntegrationConfig,
    document?: Document
  ): Promise<YourEmrVisit> {
    // Implement API call or DOM scraping
  }

  async fetchPatientFromPage(
    config: EmrIntegrationConfig,
    document: Document
  ): Promise<YourEmrPatient | null> {
    // Extract patient from current page
  }

  async fetchVisitFromPage(
    config: EmrIntegrationConfig,
    document: Document
  ): Promise<YourEmrVisit | null> {
    // Extract visit from current page
  }

  async canConnect(config: EmrIntegrationConfig): Promise<boolean> {
    // Test connection/authentication
  }
}
```

**index.ts** - Export the integration:
```typescript
import { IEmrIntegration } from "../../interfaces";
import { EmrType } from "../../types";
import { YourEmrDataConverter } from "./converter";
import { YourEmrPageDetector } from "./page-detector";
import { YourEmrDataClient } from "./data-client";

export const YourEmrIntegration: IEmrIntegration = {
  emrType: EmrType.YOUR_NEW_EMR,
  displayName: "Your EMR Name",
  converter: new YourEmrDataConverter(),
  pageDetector: new YourEmrPageDetector(),
  dataClient: new YourEmrDataClient(),
};
```

### 6. Register in the registry

Update `registry.ts`:
```typescript
import { YourEmrIntegration } from "./integrations/your-emr";

const emrImplementations: Record<EmrType, IEmrIntegration> = {
  [EmrType.PROMPT]: PromptIntegration,
  [EmrType.WEBPT]: WebPTIntegration,
  [EmrType.CLINICIENT]: ClinicientIntegration,
  [EmrType.YOUR_NEW_EMR]: YourEmrIntegration, // Add here
};
```

## Usage

### Getting the EMR Integration for a Clinic

The `getEmrIntegration` function automatically retrieves the correct integration based on the clinic's configuration:

```typescript
import { getEmrIntegration } from "@/lib/emr";

// Get EMR integration for a clinic
const emr = await getEmrIntegration(clinicId, currentUrl);

if (emr) {
  const { integration, config } = emr;

  // Use the integration
  const emrPatientData = await integration.dataClient.fetchPatient(
    patientId,
    config,
    document
  );

  // Convert to our standard format
  const standardPatient = integration.converter.convertPatient(emrPatientData);

  // Save to database
  await createPatient(
    standardPatient.firstName,
    standardPatient.lastName,
    standardPatient.nickName,
    clinicId,
    standardPatient.externalId
  );
}
```

### Creating an EMR Integration Configuration

```typescript
import { createEmrIntegration, EmrType } from "@/lib/emr";

// For Prompt (no auth needed)
const promptIntegration = await createEmrIntegration(clinicId, {
  emrType: EmrType.PROMPT,
  authConfig: {},
});

// For WebPT (API auth)
const webptIntegration = await createEmrIntegration(clinicId, {
  emrType: EmrType.WEBPT,
  authConfig: {
    apiKey: "your-api-key",
    apiSecret: "your-api-secret",
  },
});
```

### Using tRPC from the Chrome Extension

```typescript
// Get the active integration
const integration = await trpc.emrIntegration.getActive.query({
  clinicId: user.clinicId,
});

// Get integration with implementation
const emr = await trpc.emrIntegration.getIntegration.query({
  clinicId: user.clinicId,
  currentUrl: window.location.href,
});

// Create new integration
await trpc.emrIntegration.create.mutate({
  clinicId: user.clinicId,
  config: {
    emrType: EmrType.PROMPT,
    authConfig: {},
  },
});
```

## Database Schema

The EMR integration configurations are stored in Neo4j with the following structure:

```cypher
(:EmrIntegration {
  id: string (unique),
  clinicId: string (indexed),
  emrType: string (enum),
  authConfig: string (JSON),
  isActive: boolean,
  createdAt: datetime,
  updatedAt: datetime
})
```

Patients and Visits also include an `externalId` field to link back to the EMR system:

```cypher
(:Patient {
  id: string,
  clinicId: string,
  externalId: string (indexed), // EMR's patient ID
  // ... other fields
})

(:Visit {
  id: string,
  clinicId: string,
  patientId: string,
  externalId: string (indexed), // EMR's visit ID
  // ... other fields
})
```

## Security Considerations

1. **Auth Configuration Storage**: Auth configurations are stored as JSON in the database. For production, consider encrypting sensitive fields like API keys.

2. **Chrome Extension Permissions**: The extension needs appropriate permissions to scrape DOM data from EMR systems. Update `manifest.json` to include the EMR domains.

3. **CORS**: If using API-based integrations, ensure proper CORS configuration on your backend.

## Current Implementation Status

- ✅ **Prompt EMR**: Basic structure implemented (needs DOM selectors to be filled in)
- ⏳ **WebPT**: Stub implementation (throws "not implemented" errors)
- ⏳ **Clinicient**: Stub implementation (throws "not implemented" errors)

## Next Steps for Prompt EMR Integration

1. Identify the actual DOM selectors for patient and visit data on Prompt EMR pages
2. Update `page-detector.ts` with the correct URL patterns
3. Implement the actual scraping logic in `data-client.ts`
4. Test the integration with real Prompt EMR data
5. Implement the `syncPatient` and `syncVisit` procedures in the tRPC router
