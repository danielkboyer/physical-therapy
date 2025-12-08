import { getSession } from '../neo4j';

export interface Visit {
  id: string;
  patientId: string;
  clinicId: string;
  visitDate: Date;
  externalId?: string; // ID from the EMR system
  createdAt: Date;
  updatedAt: Date;
}

export async function createVisit(
  patientId: string,
  clinicId: string,
  visitDate: Date,
  externalId?: string
): Promise<Visit> {
  const session = getSession();

  try {
    // Use MERGE to upsert based on clinicId and externalId
    // If visit exists, update visitDate and patientId; if not, create new
    const result = await session.run(
      `
      MERGE (v:Visit {clinicId: $clinicId, externalId: $externalId})
      ON CREATE SET
        v.id = randomUUID(),
        v.patientId = $patientId,
        v.visitDate = datetime($visitDate),
        v.createdAt = datetime(),
        v.updatedAt = datetime()
      ON MATCH SET
        v.patientId = $patientId,
        v.visitDate = datetime($visitDate),
        v.updatedAt = datetime()
      RETURN v
      `,
      { patientId, clinicId, visitDate: visitDate.toISOString(), externalId }
    );

    const node = result.records[0].get('v');
    return {
      id: node.properties.id,
      patientId: node.properties.patientId,
      clinicId: node.properties.clinicId,
      visitDate: new Date(node.properties.visitDate),
      externalId: node.properties.externalId,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}

export async function getVisitsByClinic(clinicId: string): Promise<Visit[]> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (v:Visit {clinicId: $clinicId})
      RETURN v
      ORDER BY v.visitDate DESC
      `,
      { clinicId }
    );

    return result.records.map(record => {
      const node = record.get('v');
      return {
        id: node.properties.id,
        patientId: node.properties.patientId,
        clinicId: node.properties.clinicId,
        visitDate: new Date(node.properties.visitDate),
        externalId: node.properties.externalId,
        createdAt: new Date(node.properties.createdAt),
        updatedAt: new Date(node.properties.updatedAt),
      };
    });
  } finally {
    await session.close();
  }
}

export async function getVisitsByPatient(patientId: string): Promise<Visit[]> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (v:Visit {patientId: $patientId})
      RETURN v
      ORDER BY v.visitDate DESC
      `,
      { patientId }
    );

    return result.records.map(record => {
      const node = record.get('v');
      return {
        id: node.properties.id,
        patientId: node.properties.patientId,
        clinicId: node.properties.clinicId,
        visitDate: new Date(node.properties.visitDate),
        externalId: node.properties.externalId,
        createdAt: new Date(node.properties.createdAt),
        updatedAt: new Date(node.properties.updatedAt),
      };
    });
  } finally {
    await session.close();
  }
}

export async function getVisitById(id: string): Promise<Visit | null> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (v:Visit {id: $id})
      RETURN v
      `,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('v');
    return {
      id: node.properties.id,
      patientId: node.properties.patientId,
      clinicId: node.properties.clinicId,
      visitDate: new Date(node.properties.visitDate),
      externalId: node.properties.externalId,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}

export async function getVisitByExternalId(
  clinicId: string,
  externalId: string
): Promise<Visit | null> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (v:Visit {clinicId: $clinicId, externalId: $externalId})
      RETURN v
      `,
      { clinicId, externalId }
    );

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('v');
    return {
      id: node.properties.id,
      patientId: node.properties.patientId,
      clinicId: node.properties.clinicId,
      visitDate: new Date(node.properties.visitDate),
      externalId: node.properties.externalId,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}
