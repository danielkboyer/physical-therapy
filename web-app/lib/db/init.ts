import { getSession } from '../neo4j';

/**
 * Initialize database with constraints and indexes
 */
export async function initializeDatabase(): Promise<void> {
  const session = getSession();

  try {
    // Clinic constraints
    await session.run(`
      CREATE CONSTRAINT clinic_id IF NOT EXISTS
      FOR (c:Clinic) REQUIRE c.id IS UNIQUE
    `);

    // User constraints
    await session.run(`
      CREATE CONSTRAINT user_id IF NOT EXISTS
      FOR (u:User) REQUIRE u.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT user_email IF NOT EXISTS
      FOR (u:User) REQUIRE u.email IS UNIQUE
    `);

    // Indexes for better query performance
    await session.run(`
      CREATE INDEX clinic_name IF NOT EXISTS
      FOR (c:Clinic) ON (c.name)
    `);

    await session.run(`
      CREATE INDEX user_clinic IF NOT EXISTS
      FOR (u:User) ON (u.clinicId)
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await session.close();
  }
}
