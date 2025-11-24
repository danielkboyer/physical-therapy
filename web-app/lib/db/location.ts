import { getSession } from '../neo4j';
import { Location } from '../types';
import { randomUUID } from 'crypto';

export async function createLocation(
  clinicId: string,
  data: Omit<Location, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>
): Promise<Location> {
  const session = getSession();
  const id = randomUUID();
  const now = new Date().toISOString();

  try {
    const result = await session.run(
      `
      MATCH (c:Clinic {id: $clinicId})
      CREATE (l:Location {
        id: $id,
        clinicId: $clinicId,
        name: $name,
        address: $address,
        city: $city,
        state: $state,
        zipCode: $zipCode,
        createdAt: $now,
        updatedAt: $now
      })
      CREATE (c)-[:HAS_LOCATION]->(l)
      RETURN l
      `,
      { id, clinicId, ...data, now }
    );

    const location = result.records[0].get('l').properties;
    return location as Location;
  } finally {
    await session.close();
  }
}

export async function getLocationsByClinicId(clinicId: string): Promise<Location[]> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (c:Clinic {id: $clinicId})-[:HAS_LOCATION]->(l:Location)
      RETURN l
      ORDER BY l.name
      `,
      { clinicId }
    );

    return result.records.map(record => record.get('l').properties as Location);
  } finally {
    await session.close();
  }
}

export async function getLocationById(id: string): Promise<Location | null> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (l:Location {id: $id})
      RETURN l
      `,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    const location = result.records[0].get('l').properties;
    return location as Location;
  } finally {
    await session.close();
  }
}

export async function updateLocation(
  id: string,
  data: Partial<Omit<Location, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>>
): Promise<Location> {
  const session = getSession();
  const now = new Date().toISOString();

  try {
    const updateFields = Object.entries(data)
      .map(([key, _]) => `l.${key} = $${key}`)
      .join(', ');

    const result = await session.run(
      `
      MATCH (l:Location {id: $id})
      SET ${updateFields}, l.updatedAt = $now
      RETURN l
      `,
      { id, ...data, now }
    );

    const location = result.records[0].get('l').properties;
    return location as Location;
  } finally {
    await session.close();
  }
}
