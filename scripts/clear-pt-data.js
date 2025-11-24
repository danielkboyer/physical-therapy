/**
 * Clear PT App Data Script
 *
 * This script clears all data for the Physical Therapy app from the shared Neo4j database.
 * It only deletes nodes and relationships specific to this app:
 * - Clinic, Location, User (with role property), Customer, Session nodes
 *
 * Usage: node scripts/clear-pt-data.js
 */

const neo4j = require('neo4j-driver');
require('dotenv').config({ path: './web-app/.env.local' });

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

async function clearPTData() {
  const session = driver.session();

  try {
    console.log('🔍 Checking for PT app data...\n');

    // Count existing data
    const counts = await session.run(`
      RETURN
        size((n:Clinic)) as clinics,
        size((n:Location)) as locations,
        size((n:User)) as users,
        size((n:Customer)) as customers,
        size((n:Session)) as sessions
    `);

    const record = counts.records[0];
    console.log('📊 Current PT app data:');
    console.log(`   Clinics:   ${record.get('clinics')}`);
    console.log(`   Locations: ${record.get('locations')}`);
    console.log(`   Users:     ${record.get('users')}`);
    console.log(`   Customers: ${record.get('customers')}`);
    console.log(`   Sessions:  ${record.get('sessions')}`);
    console.log('');

    // Ask for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('⚠️  Are you sure you want to delete all this data? (yes/no): ', resolve);
    });
    readline.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled.');
      return;
    }

    console.log('\n🗑️  Deleting PT app data...\n');

    // Delete in order to respect relationships
    console.log('   Deleting Sessions...');
    await session.run(`
      MATCH (s:Session)
      DETACH DELETE s
    `);

    console.log('   Deleting Customers...');
    await session.run(`
      MATCH (c:Customer)
      DETACH DELETE c
    `);

    console.log('   Deleting Users...');
    await session.run(`
      MATCH (u:User)
      WHERE u.role IN ['admin', 'therapist']
      DETACH DELETE u
    `);

    console.log('   Deleting Locations...');
    await session.run(`
      MATCH (l:Location)
      DETACH DELETE l
    `);

    console.log('   Deleting Clinics...');
    await session.run(`
      MATCH (c:Clinic)
      DETACH DELETE c
    `);

    console.log('\n✅ All PT app data has been deleted successfully!\n');

    // Verify deletion
    const afterCounts = await session.run(`
      RETURN
        size((n:Clinic)) as clinics,
        size((n:Location)) as locations,
        size((n:User)) as users,
        size((n:Customer)) as customers,
        size((n:Session)) as sessions
    `);

    const afterRecord = afterCounts.records[0];
    console.log('📊 Remaining PT app data:');
    console.log(`   Clinics:   ${afterRecord.get('clinics')}`);
    console.log(`   Locations: ${afterRecord.get('locations')}`);
    console.log(`   Users:     ${afterRecord.get('users')}`);
    console.log(`   Customers: ${afterRecord.get('customers')}`);
    console.log(`   Sessions:  ${afterRecord.get('sessions')}`);

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    await session.close();
  }
}

async function main() {
  try {
    await clearPTData();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await driver.close();
  }
}

main();
