import { getSession } from '../neo4j';
import type { Integer } from 'neo4j-driver';

export interface Clinic {
  id: string;
  name: string;
  createdAt: number;
}

interface ClinicNode {
  c: {
    properties: {
      id: string;
      name: string;
      createdAt: Integer;
    };
  };
}

export async function createClinic(name: string): Promise<Clinic> {
  const session = getSession();

  try {
    const result = await session.run<ClinicNode>(
      `
      CREATE (c:Clinic {
        id: randomUUID(),
        name: $name,
        createdAt: datetime().epochMillis
      })
      RETURN c
      `,
      { name }
    );

    const clinic = result.records[0]?.get('c').properties;
    return {
      id: clinic.id,
      name: clinic.name,
      createdAt: clinic.createdAt.toNumber(),
    };
  } finally {
    await session.close();
  }
}

export async function getClinicById(id: string): Promise<Clinic | null> {
  const session = getSession();

  try {
    const result = await session.run<ClinicNode>(
      `
      MATCH (c:Clinic {id: $id})
      RETURN c
      `,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    const clinic = result.records[0].get('c').properties;
    return {
      id: clinic.id,
      name: clinic.name,
      createdAt: clinic.createdAt.toNumber(),
    };
  } finally {
    await session.close();
  }
}
