import { getSession } from '../neo4j';

export interface Visit {
  id: string;
  patientId: string;
  clinicId: string;
  visitDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function createVisit(
  patientId: string,
  clinicId: string,
  visitDate: Date
): Promise<Visit> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      CREATE (v:Visit {
        id: randomUUID(),
        patientId: $patientId,
        clinicId: $clinicId,
        visitDate: datetime($visitDate),
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN v
      `,
      { patientId, clinicId, visitDate: visitDate.toISOString() }
    );

    const node = result.records[0].get('v');
    return {
      id: node.properties.id,
      patientId: node.properties.patientId,
      clinicId: node.properties.clinicId,
      visitDate: new Date(node.properties.visitDate),
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
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}
