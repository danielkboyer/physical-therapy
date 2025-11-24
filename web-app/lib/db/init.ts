import { getSession } from '../neo4j';

export async function initializeDatabase() {
  const session = getSession();

  try {
    // Create constraints for unique IDs
    await session.run(`
      CREATE CONSTRAINT clinic_id IF NOT EXISTS
      FOR (c:Clinic) REQUIRE c.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT location_id IF NOT EXISTS
      FOR (l:Location) REQUIRE l.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT user_id IF NOT EXISTS
      FOR (u:User) REQUIRE u.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT user_email IF NOT EXISTS
      FOR (u:User) REQUIRE u.email IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT customer_id IF NOT EXISTS
      FOR (c:Customer) REQUIRE c.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT session_id IF NOT EXISTS
      FOR (s:Session) REQUIRE s.id IS UNIQUE
    `);

    // Create indexes for better query performance
    await session.run(`
      CREATE INDEX clinic_name IF NOT EXISTS
      FOR (c:Clinic) ON (c.name)
    `);

    await session.run(`
      CREATE INDEX location_clinic IF NOT EXISTS
      FOR (l:Location) ON (l.clinicId)
    `);

    await session.run(`
      CREATE INDEX user_clinic IF NOT EXISTS
      FOR (u:User) ON (u.clinicId)
    `);

    await session.run(`
      CREATE INDEX session_clinic IF NOT EXISTS
      FOR (s:Session) ON (s.clinicId)
    `);

    await session.run(`
      CREATE INDEX session_therapist IF NOT EXISTS
      FOR (s:Session) ON (s.therapistId)
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await session.close();
  }
}
