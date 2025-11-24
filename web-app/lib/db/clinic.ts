import { getSession } from '../neo4j';
import { Clinic } from '../types';
import { randomUUID } from 'crypto';

export async function createClinic(name: string): Promise<Clinic> {
  const session = getSession();
  const id = randomUUID();
  const now = new Date().toISOString();

  try {
    const result = await session.run(
      `
      CREATE (c:Clinic {
        id: $id,
        name: $name,
        createdAt: $now,
        updatedAt: $now
      })
      RETURN c
      `,
      { id, name, now }
    );

    const clinic = result.records[0].get('c').properties;
    return clinic as Clinic;
  } finally {
    await session.close();
  }
}

export async function getClinicById(id: string): Promise<Clinic | null> {
  const session = getSession();

  try {
    const result = await session.run(
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
    return clinic as Clinic;
  } finally {
    await session.close();
  }
}

export async function updateClinic(id: string, name: string): Promise<Clinic> {
  const session = getSession();
  const now = new Date().toISOString();

  try {
    const result = await session.run(
      `
      MATCH (c:Clinic {id: $id})
      SET c.name = $name, c.updatedAt = $now
      RETURN c
      `,
      { id, name, now }
    );

    const clinic = result.records[0].get('c').properties;
    return clinic as Clinic;
  } finally {
    await session.close();
  }
}
