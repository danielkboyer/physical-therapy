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

    // Patient constraints
    await session.run(`
      CREATE CONSTRAINT patient_id IF NOT EXISTS
      FOR (p:Patient) REQUIRE p.id IS UNIQUE
    `);

    // Visit constraints
    await session.run(`
      CREATE CONSTRAINT visit_id IF NOT EXISTS
      FOR (v:Visit) REQUIRE v.id IS UNIQUE
    `);

    // Recording constraints
    await session.run(`
      CREATE CONSTRAINT recording_id IF NOT EXISTS
      FOR (r:Recording) REQUIRE r.id IS UNIQUE
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

    await session.run(`
      CREATE INDEX patient_clinic IF NOT EXISTS
      FOR (p:Patient) ON (p.clinicId)
    `);

    await session.run(`
      CREATE INDEX visit_clinic IF NOT EXISTS
      FOR (v:Visit) ON (v.clinicId)
    `);

    await session.run(`
      CREATE INDEX visit_patient IF NOT EXISTS
      FOR (v:Visit) ON (v.patientId)
    `);

    await session.run(`
      CREATE INDEX recording_visit IF NOT EXISTS
      FOR (r:Recording) ON (r.visitId)
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await session.close();
  }
}
