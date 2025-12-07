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
    const result = await session.run(
      `
      CREATE (p:Patient {
        id: randomUUID(),
        firstName: $firstName,
        lastName: $lastName,
        nickName: $nickName,
        clinicId: $clinicId,
        externalId: $externalId,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN p
      `,
      { firstName, lastName, nickName, clinicId, externalId }
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
