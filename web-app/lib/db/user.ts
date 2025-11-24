import { getSession } from '../neo4j';
import { User } from '../types';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

export async function createUser(
  data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { locationIds?: string[] }
): Promise<Omit<User, 'password'>> {
  const session = getSession();
  const id = randomUUID();
  const now = new Date().toISOString();
  const hashedPassword = await bcrypt.hash(data.password, 10);

  try {
    const result = await session.run(
      `
      MATCH (c:Clinic {id: $clinicId})
      CREATE (u:User {
        id: $id,
        email: $email,
        password: $hashedPassword,
        firstName: $firstName,
        lastName: $lastName,
        role: $role,
        clinicId: $clinicId,
        createdAt: $now,
        updatedAt: $now
      })
      CREATE (c)-[:HAS_USER]->(u)
      RETURN u
      `,
      {
        id,
        email: data.email,
        hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        clinicId: data.clinicId,
        now
      }
    );

    // Link user to locations if provided
    if (data.locationIds && data.locationIds.length > 0) {
      for (const locationId of data.locationIds) {
        await session.run(
          `
          MATCH (u:User {id: $userId})
          MATCH (l:Location {id: $locationId})
          CREATE (u)-[:WORKS_AT]->(l)
          `,
          { userId: id, locationId }
        );
      }
    }

    const user = result.records[0].get('u').properties;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  } finally {
    await session.close();
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (u:User {email: $email})
      RETURN u
      `,
      { email }
    );

    if (result.records.length === 0) {
      return null;
    }

    const user = result.records[0].get('u').properties;
    return user as User;
  } finally {
    await session.close();
  }
}

export async function getUserById(id: string): Promise<Omit<User, 'password'> | null> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $id})
      RETURN u
      `,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    const user = result.records[0].get('u').properties;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'password'>;
  } finally {
    await session.close();
  }
}

export async function getUsersByClinicId(clinicId: string): Promise<Omit<User, 'password'>[]> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (c:Clinic {id: $clinicId})-[:HAS_USER]->(u:User)
      RETURN u
      ORDER BY u.firstName, u.lastName
      `,
      { clinicId }
    );

    return result.records.map(record => {
      const user = record.get('u').properties;
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as Omit<User, 'password'>;
    });
  } finally {
    await session.close();
  }
}

export async function getUserLocationIds(userId: string): Promise<string[]> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})-[:WORKS_AT]->(l:Location)
      RETURN l.id as locationId
      `,
      { userId }
    );

    return result.records.map(record => record.get('locationId'));
  } finally {
    await session.close();
  }
}

export async function addUserToLocation(userId: string, locationId: string): Promise<void> {
  const session = getSession();

  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})
      MATCH (l:Location {id: $locationId})
      MERGE (u)-[:WORKS_AT]->(l)
      `,
      { userId, locationId }
    );
  } finally {
    await session.close();
  }
}

export async function removeUserFromLocation(userId: string, locationId: string): Promise<void> {
  const session = getSession();

  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})-[r:WORKS_AT]->(l:Location {id: $locationId})
      DELETE r
      `,
      { userId, locationId }
    );
  } finally {
    await session.close();
  }
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password);
}
