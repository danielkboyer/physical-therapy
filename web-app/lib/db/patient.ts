import { getSession } from '../neo4j';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  nickName?: string;
  clinicId: string;
  externalId?: string; // ID from the EMR system
  createdAt: Date;
  updatedAt: Date;
}

export async function createPatient(
  firstName: string,
  lastName: string,
  nickName: string | undefined,
  clinicId: string,
  externalId?: string
): Promise<Patient> {
  const session = getSession();

  try {
    // Use MERGE to upsert based on clinicId and externalId
    // If patient exists, update all fields; if not, create new
    const params: Record<string, any> = {
      firstName,
      lastName,
      clinicId,
      externalId,
    };

    // Only include nickName if it has a value
    if (nickName !== undefined && nickName !== null) {
      params.nickName = nickName;
    }

    const result = await session.run(
      `
      MERGE (p:Patient {clinicId: $clinicId, externalId: $externalId})
      ON CREATE SET
        p.id = randomUUID(),
        p.firstName = $firstName,
        p.lastName = $lastName,
        ${nickName !== undefined && nickName !== null ? 'p.nickName = $nickName,' : ''}
        p.createdAt = datetime(),
        p.updatedAt = datetime()
      ON MATCH SET
        p.firstName = $firstName,
        p.lastName = $lastName,
        ${nickName !== undefined && nickName !== null ? 'p.nickName = $nickName,' : ''}
        p.updatedAt = datetime()
      RETURN p
      `,
      params
    );

    const node = result.records[0].get('p');
    return {
      id: node.properties.id,
      firstName: node.properties.firstName,
      lastName: node.properties.lastName,
      nickName: node.properties.nickName,
      clinicId: node.properties.clinicId,
      externalId: node.properties.externalId,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}

export async function getPatientsByClinic(clinicId: string): Promise<Patient[]> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (p:Patient {clinicId: $clinicId})
      RETURN p
      ORDER BY p.lastName ASC, p.firstName ASC
      `,
      { clinicId }
    );

    return result.records.map(record => {
      const node = record.get('p');
      return {
        id: node.properties.id,
        firstName: node.properties.firstName,
        lastName: node.properties.lastName,
        nickName: node.properties.nickName,
        clinicId: node.properties.clinicId,
        externalId: node.properties.externalId,
        createdAt: new Date(node.properties.createdAt),
        updatedAt: new Date(node.properties.updatedAt),
      };
    });
  } finally {
    await session.close();
  }
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (p:Patient {id: $id})
      RETURN p
      `,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('p');
    return {
      id: node.properties.id,
      firstName: node.properties.firstName,
      lastName: node.properties.lastName,
      nickName: node.properties.nickName,
      clinicId: node.properties.clinicId,
      externalId: node.properties.externalId,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}

export async function getPatientByExternalId(
  clinicId: string,
  externalId: string
): Promise<Patient | null> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (p:Patient {clinicId: $clinicId, externalId: $externalId})
      RETURN p
      `,
      { clinicId, externalId }
    );

    if (result.records.length === 0) {
      return null;
    }

    const node = result.records[0].get('p');
    return {
      id: node.properties.id,
      firstName: node.properties.firstName,
      lastName: node.properties.lastName,
      nickName: node.properties.nickName,
      clinicId: node.properties.clinicId,
      externalId: node.properties.externalId,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}

export async function updatePatient(
  id: string,
  firstName: string,
  lastName: string,
  nickName?: string
): Promise<Patient> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (p:Patient {id: $id})
      SET p.firstName = $firstName, p.lastName = $lastName, p.nickName = $nickName, p.updatedAt = datetime()
      RETURN p
      `,
      { id, firstName, lastName, nickName }
    );

    const node = result.records[0].get('p');
    return {
      id: node.properties.id,
      firstName: node.properties.firstName,
      lastName: node.properties.lastName,
      nickName: node.properties.nickName,
      clinicId: node.properties.clinicId,
      externalId: node.properties.externalId,
      createdAt: new Date(node.properties.createdAt),
      updatedAt: new Date(node.properties.updatedAt),
    };
  } finally {
    await session.close();
  }
}
