import { getSession } from "../neo4j";
import {
  EmrType,
  EmrIntegration,
  EmrIntegrationConfig,
  PromptAuthConfig,
  WebPTAuthConfig,
  ClinicientAuthConfig,
} from "../emr/types";

// Validation helper to ensure emrType is valid
function validateEmrType(emrType: string): EmrType {
  if (!Object.values(EmrType).includes(emrType as EmrType)) {
    throw new Error(`Invalid EMR type: ${emrType}`);
  }
  return emrType as EmrType;
}

export async function createEmrIntegration(
  clinicId: string,
  config: EmrIntegrationConfig
): Promise<EmrIntegration> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      CREATE (e:EmrIntegration {
        id: randomUUID(),
        clinicId: $clinicId,
        emrType: $emrType,
        authConfig: $authConfig,
        isActive: true,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN e
      `,
      {
        clinicId,
        emrType: config.emrType,
        authConfig: config.authConfig
          ? JSON.stringify(config.authConfig)
          : null,
      }
    );

    const node = result.records[0]?.get("e");
    if (!node) {
      throw new Error("Failed to create EMR integration");
    }

    return {
      id: node.properties.id,
      clinicId: node.properties.clinicId,
      emrType: validateEmrType(node.properties.emrType),
      authConfig: node.properties.authConfig
        ? JSON.parse(node.properties.authConfig)
        : undefined,
      isActive: node.properties.isActive,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}

export async function getEmrIntegrationsByClinic(
  clinicId: string
): Promise<EmrIntegration[]> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (e:EmrIntegration {clinicId: $clinicId})
      RETURN e
      ORDER BY e.createdAt DESC
      `,
      { clinicId }
    );

    return result.records.map((record) => {
      const node = record.get("e");
      return {
        id: node.properties.id,
        clinicId: node.properties.clinicId,
        emrType: validateEmrType(node.properties.emrType),
        authConfig: node.properties.authConfig
          ? JSON.parse(node.properties.authConfig)
          : undefined,
        isActive: node.properties.isActive,
        createdAt: new Date(node.properties.createdAt),
        updatedAt: new Date(node.properties.updatedAt),
      };
    });
  } finally {
    await session.close();
  }
}

export async function getActiveEmrIntegration(
  clinicId: string
): Promise<EmrIntegration | null> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (e:EmrIntegration {clinicId: $clinicId, isActive: true})
      RETURN e
      ORDER BY e.createdAt DESC
      LIMIT 1
      `,
      { clinicId }
    );

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get("e");
    return {
      id: node.properties.id,
      clinicId: node.properties.clinicId,
      emrType: validateEmrType(node.properties.emrType),
      authConfig: node.properties.authConfig
        ? JSON.parse(node.properties.authConfig)
        : undefined,
      isActive: node.properties.isActive,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}

export async function getEmrIntegrationById(
  id: string
): Promise<EmrIntegration | null> {
  const session = getSession();
  try {
    const result = await session.run(
      `
      MATCH (e:EmrIntegration {id: $id})
      RETURN e
      `,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get("e");
    return {
      id: node.properties.id,
      clinicId: node.properties.clinicId,
      emrType: validateEmrType(node.properties.emrType),
      authConfig: node.properties.authConfig
        ? JSON.parse(node.properties.authConfig)
        : undefined,
      isActive: node.properties.isActive,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}

export async function updateEmrIntegration(
  id: string,
  updates: {
    authConfig?:
      | PromptAuthConfig
      | WebPTAuthConfig
      | ClinicientAuthConfig;
    isActive?: boolean;
  }
): Promise<EmrIntegration> {
  const session = getSession();
  try {
    const setClauses: string[] = ["e.updatedAt = datetime()"];
    const params: Record<string, unknown> = { id };

    if (updates.authConfig !== undefined) {
      setClauses.push("e.authConfig = $authConfig");
      params.authConfig = JSON.stringify(updates.authConfig);
    }

    if (updates.isActive !== undefined) {
      setClauses.push("e.isActive = $isActive");
      params.isActive = updates.isActive;
    }

    const result = await session.run(
      `
      MATCH (e:EmrIntegration {id: $id})
      SET ${setClauses.join(", ")}
      RETURN e
      `,
      params
    );

    const node = result.records[0]?.get("e");
    if (!node) {
      throw new Error("EMR integration not found");
    }

    return {
      id: node.properties.id,
      clinicId: node.properties.clinicId,
      emrType: validateEmrType(node.properties.emrType),
      authConfig: node.properties.authConfig
        ? JSON.parse(node.properties.authConfig)
        : undefined,
      isActive: node.properties.isActive,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}

export async function deleteEmrIntegration(id: string): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      `
      MATCH (e:EmrIntegration {id: $id})
      DELETE e
      `,
      { id }
    );
  } finally {
    await session.close();
  }
}

export async function initializeEmrIntegrationConstraints(): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      "CREATE CONSTRAINT emr_integration_id IF NOT EXISTS FOR (e:EmrIntegration) REQUIRE e.id IS UNIQUE"
    );
    await session.run(
      "CREATE INDEX emr_integration_clinic IF NOT EXISTS FOR (e:EmrIntegration) ON (e.clinicId)"
    );
  } finally {
    await session.close();
  }
}
