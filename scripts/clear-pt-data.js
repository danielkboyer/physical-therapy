/**
 * Clear PT App Data Script
 *
 * This script clears all data for the Physical Therapy app from the shared Neo4j database.
 * It only deletes nodes and relationships specific to this app:
 * - Clinic and User nodes
 *
 * Usage: node scripts/clear-pt-data.js
 */

const neo4j = require('neo4j-driver');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../web-app/.env.local') });

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
      OPTIONAL MATCH (c:Clinic)
      WITH count(c) as clinics
      OPTIONAL MATCH (u:User)
      RETURN clinics, count(u) as users
    `);

    const record = counts.records[0];
    console.log('📊 Current PT app data:');
    console.log(`   Clinics: ${record.get('clinics')}`);
    console.log(`   Users:   ${record.get('users')}`);
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
    console.log('   Deleting Users...');
    await session.run(`
      MATCH (u:User)
      DETACH DELETE u
    `);

    console.log('   Deleting Clinics...');
    await session.run(`
      MATCH (c:Clinic)
      DETACH DELETE c
    `);

    console.log('\n✅ All PT app data has been deleted successfully!\n');

    // Verify deletion
    const afterCounts = await session.run(`
      OPTIONAL MATCH (c:Clinic)
      WITH count(c) as clinics
      OPTIONAL MATCH (u:User)
      RETURN clinics, count(u) as users
    `);

    const afterRecord = afterCounts.records[0];
    console.log('📊 Remaining PT app data:');
    console.log(`   Clinics: ${afterRecord.get('clinics')}`);
    console.log(`   Users:   ${afterRecord.get('users')}`);

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
