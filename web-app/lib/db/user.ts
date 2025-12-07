import { getSession } from '../neo4j';
import bcrypt from 'bcryptjs';
import type { Integer } from 'neo4j-driver';

export interface User {
  id: string;
  email: string;
  name: string;
  clinicId: string;
  createdAt: number;
}

interface UserWithPassword extends User {
  password: string;
}

interface UserNode {
  u: {
    properties: {
      id: string;
      email: string;
      name: string;
      password: string;
      clinicId: string;
      createdAt: Integer;
    };
  };
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  clinicId: string;
}): Promise<User> {
  const session = getSession();

  try {
    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await session.run<UserNode>(
      `
      MATCH (c:Clinic {id: $clinicId})
      CREATE (u:User {
        id: randomUUID(),
        email: $email,
        name: $name,
        password: $password,
        clinicId: $clinicId,
        createdAt: timestamp()
      })
      CREATE (c)-[:HAS_USER]->(u)
      RETURN u
      `,
      {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        clinicId: data.clinicId,
      }
    );

    const user = result.records[0]?.get('u').properties;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      clinicId: user.clinicId,
      createdAt: user.createdAt.toInt(),
    };
  } finally {
    await session.close();
  }
}

export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
  const session = getSession();

  try {
    const result = await session.run<UserNode>(
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
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      clinicId: user.clinicId,
      createdAt: user.createdAt.toInt(),
    };
  } finally {
    await session.close();
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const session = getSession();

  try {
    const result = await session.run<UserNode>(
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
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      clinicId: user.clinicId,
      createdAt: user.createdAt.toInt(),
    };
  } finally {
    await session.close();
  }
}

export async function verifyPassword(user: UserWithPassword, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password);
}

export async function getUsersByClinicId(clinicId: string): Promise<User[]> {
  const session = getSession();

  try {
    const result = await session.run<UserNode>(
      `
      MATCH (c:Clinic {id: $clinicId})-[:HAS_USER]->(u:User)
      RETURN u
      ORDER BY u.name
      `,
      { clinicId }
    );

    return result.records.map(record => {
      const user = record.get('u').properties;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        clinicId: user.clinicId,
        createdAt: user.createdAt.toInt(),
      };
    });
  } finally {
    await session.close();
  }
}
