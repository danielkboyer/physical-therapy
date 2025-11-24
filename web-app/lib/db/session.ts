import { getSession as getNeo4jSession } from '../neo4j';
import { Session } from '../types';
import { randomUUID } from 'crypto';

export async function createSession(
  clinicId: string,
  locationId: string,
  therapistId: string,
  customerId?: string,
  customerName?: string
): Promise<Session> {
  const session = getNeo4jSession();
  const id = randomUUID();
  const now = new Date().toISOString();

  try {
    const result = await session.run(
      `
      MATCH (c:Clinic {id: $clinicId})
      MATCH (l:Location {id: $locationId})
      MATCH (t:User {id: $therapistId})
      CREATE (s:Session {
        id: $id,
        clinicId: $clinicId,
        locationId: $locationId,
        therapistId: $therapistId,
        customerId: $customerId,
        customerName: $customerName,
        isGuestCustomer: $isGuestCustomer,
        duration: 0,
        status: 'recording',
        startedAt: $now,
        createdAt: $now,
        updatedAt: $now
      })
      CREATE (c)-[:HAS_SESSION]->(s)
      CREATE (l)-[:HOSTED_SESSION]->(s)
      CREATE (t)-[:CONDUCTED_SESSION]->(s)
      ${customerId ? `
      WITH s
      MATCH (cust:Customer {id: $customerId})
      CREATE (s)-[:WITH_CUSTOMER]->(cust)
      ` : ''}
      RETURN s
      `,
      {
        id,
        clinicId,
        locationId,
        therapistId,
        customerId: customerId || null,
        customerName: customerName || null,
        isGuestCustomer: !customerId,
        now
      }
    );

    const sessionData = result.records[0].get('s').properties;
    return sessionData as Session;
  } finally {
    await session.close();
  }
}

export async function getSessionById(id: string): Promise<Session | null> {
  const session = getNeo4jSession();

  try {
    const result = await session.run(
      `
      MATCH (s:Session {id: $id})
      RETURN s
      `,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    const sessionData = result.records[0].get('s').properties;
    return sessionData as Session;
  } finally {
    await session.close();
  }
}

export async function updateSession(
  id: string,
  data: Partial<Omit<Session, 'id' | 'clinicId' | 'locationId' | 'therapistId' | 'createdAt'>>
): Promise<Session> {
  const session = getNeo4jSession();
  const now = new Date().toISOString();

  try {
    const updateFields = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([key, _]) => `s.${key} = $${key}`)
      .join(', ');

    const result = await session.run(
      `
      MATCH (s:Session {id: $id})
      SET ${updateFields}, s.updatedAt = $now
      RETURN s
      `,
      { id, ...data, now }
    );

    const sessionData = result.records[0].get('s').properties;
    return sessionData as Session;
  } finally {
    await session.close();
  }
}

export async function endSession(id: string, audioUrl?: string, audioBlob?: string): Promise<Session> {
  const session = getNeo4jSession();
  const now = new Date().toISOString();

  try {
    const result = await session.run(
      `
      MATCH (s:Session {id: $id})
      SET s.endedAt = $now,
          s.status = 'completed',
          s.audioUrl = $audioUrl,
          s.audioBlob = $audioBlob,
          s.updatedAt = $now
      RETURN s
      `,
      { id, now, audioUrl: audioUrl || null, audioBlob: audioBlob || null }
    );

    const sessionData = result.records[0].get('s').properties;
    return sessionData as Session;
  } finally {
    await session.close();
  }
}

export async function getSessionsByClinicId(
  clinicId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Session[]> {
  const session = getNeo4jSession();

  try {
    const result = await session.run(
      `
      MATCH (c:Clinic {id: $clinicId})-[:HAS_SESSION]->(s:Session)
      RETURN s
      ORDER BY s.startedAt DESC
      SKIP $offset
      LIMIT $limit
      `,
      { clinicId, offset: Math.floor(offset), limit: Math.floor(limit) }
    );

    return result.records.map(record => record.get('s').properties as Session);
  } finally {
    await session.close();
  }
}

export async function getSessionsByTherapistId(
  therapistId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Session[]> {
  const session = getNeo4jSession();

  try {
    const result = await session.run(
      `
      MATCH (t:User {id: $therapistId})-[:CONDUCTED_SESSION]->(s:Session)
      RETURN s
      ORDER BY s.startedAt DESC
      SKIP $offset
      LIMIT $limit
      `,
      { therapistId, offset: Math.floor(offset), limit: Math.floor(limit) }
    );

    return result.records.map(record => record.get('s').properties as Session);
  } finally {
    await session.close();
  }
}

export async function getSessionsByCustomerId(
  customerId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Session[]> {
  const session = getNeo4jSession();

  try {
    const result = await session.run(
      `
      MATCH (s:Session)-[:WITH_CUSTOMER]->(cust:Customer {id: $customerId})
      RETURN s
      ORDER BY s.startedAt DESC
      SKIP $offset
      LIMIT $limit
      `,
      { customerId, offset: Math.floor(offset), limit: Math.floor(limit) }
    );

    return result.records.map(record => record.get('s').properties as Session);
  } finally {
    await session.close();
  }
}
