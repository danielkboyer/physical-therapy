import { getSession } from '../neo4j';

/**
 * Example database operations
 * Replace with your own models and operations
 */

export async function createExample(data: { name: string }): Promise<any> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      CREATE (n:Example {
        id: randomUUID(),
        name: $name,
        createdAt: datetime()
      })
      RETURN n
      `,
      { name: data.name }
    );

    return result.records[0]?.get('n').properties;
  } finally {
    await session.close();
  }
}

export async function getExampleById(id: string): Promise<any> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (n:Example {id: $id})
      RETURN n
      `,
      { id }
    );

    return result.records[0]?.get('n').properties;
  } finally {
    await session.close();
  }
}
