import { getSession } from '../neo4j';
import { Customer } from '../types';
import { randomUUID } from 'crypto';

export async function createCustomer(
  clinicId: string,
  data: Partial<Omit<Customer, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>>
): Promise<Customer> {
  const session = getSession();
  const id = randomUUID();
  const now = new Date().toISOString();

  try {
    const result = await session.run(
      `
      MATCH (c:Clinic {id: $clinicId})
      CREATE (cust:Customer {
        id: $id,
        clinicId: $clinicId,
        firstName: $firstName,
        lastName: $lastName,
        email: $email,
        phone: $phone,
        dateOfBirth: $dateOfBirth,
        isGuest: $isGuest,
        createdAt: $now,
        updatedAt: $now
      })
      CREATE (c)-[:HAS_CUSTOMER]->(cust)
      RETURN cust
      `,
      {
        id,
        clinicId,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        email: data.email || null,
        phone: data.phone || null,
        dateOfBirth: data.dateOfBirth || null,
        isGuest: data.isGuest || false,
        now
      }
    );

    const customer = result.records[0].get('cust').properties;
    return customer as Customer;
  } finally {
    await session.close();
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (cust:Customer {id: $id})
      RETURN cust
      `,
      { id }
    );

    if (result.records.length === 0) {
      return null;
    }

    const customer = result.records[0].get('cust').properties;
    return customer as Customer;
  } finally {
    await session.close();
  }
}

export async function getCustomersByClinicId(clinicId: string): Promise<Customer[]> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (c:Clinic {id: $clinicId})-[:HAS_CUSTOMER]->(cust:Customer)
      WHERE cust.isGuest = false
      RETURN cust
      ORDER BY cust.lastName, cust.firstName
      `,
      { clinicId }
    );

    return result.records.map(record => record.get('cust').properties as Customer);
  } finally {
    await session.close();
  }
}

export async function updateCustomer(
  id: string,
  data: Partial<Omit<Customer, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>>
): Promise<Customer> {
  const session = getSession();
  const now = new Date().toISOString();

  try {
    const updateFields = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([key, _]) => `cust.${key} = $${key}`)
      .join(', ');

    const result = await session.run(
      `
      MATCH (cust:Customer {id: $id})
      SET ${updateFields}, cust.updatedAt = $now
      RETURN cust
      `,
      { id, ...data, now }
    );

    const customer = result.records[0].get('cust').properties;
    return customer as Customer;
  } finally {
    await session.close();
  }
}

export async function searchCustomers(clinicId: string, query: string): Promise<Customer[]> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (c:Clinic {id: $clinicId})-[:HAS_CUSTOMER]->(cust:Customer)
      WHERE cust.isGuest = false
        AND (toLower(cust.firstName) CONTAINS toLower($query)
          OR toLower(cust.lastName) CONTAINS toLower($query)
          OR toLower(cust.email) CONTAINS toLower($query))
      RETURN cust
      ORDER BY cust.lastName, cust.firstName
      LIMIT 20
      `,
      { clinicId, query }
    );

    return result.records.map(record => record.get('cust').properties as Customer);
  } finally {
    await session.close();
  }
}
