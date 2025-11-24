# PT App Database Scripts

Utility scripts for managing the Physical Therapy app database.

## Setup

Install dependencies:

```bash
cd scripts
npm install
```

## Available Scripts

### Clear PT App Data

Clears all Physical Therapy app data from the Neo4j database. This script only deletes PT app-specific nodes and leaves other data intact.

**What it deletes:**
- All `Clinic` nodes
- All `Location` nodes
- All `User` nodes with `role` property (admin/therapist)
- All `Customer` nodes
- All `Session` nodes
- All relationships connected to these nodes

**What it preserves:**
- Any other nodes in the database (from other projects)
- Database structure, constraints, and indexes

**Usage:**

```bash
cd scripts
npm run clear
```

Or run directly:

```bash
node clear-pt-data.js
```

**Safety Features:**
- Shows current data counts before deletion
- Requires confirmation (type "yes") before proceeding
- Shows remaining data counts after deletion
- Gracefully handles errors

**Example Output:**

```
🔍 Checking for PT app data...

📊 Current PT app data:
   Clinics:   2
   Locations: 5
   Users:     8
   Customers: 15
   Sessions:  42

⚠️  Are you sure you want to delete all this data? (yes/no): yes

🗑️  Deleting PT app data...

   Deleting Sessions...
   Deleting Customers...
   Deleting Users...
   Deleting Locations...
   Deleting Clinics...

✅ All PT app data has been deleted successfully!

📊 Remaining PT app data:
   Clinics:   0
   Locations: 0
   Users:     0
   Customers: 0
   Sessions:  0
```

## Configuration

The script reads database credentials from `web-app/.env.local`:

- `NEO4J_URI`
- `NEO4J_USERNAME`
- `NEO4J_PASSWORD`

Make sure these are configured before running the script.

## Notes

- This script is safe to use with a shared Neo4j database
- It only targets nodes specific to the PT app
- Always backup your data before running destructive operations
- The script uses `DETACH DELETE` to automatically remove relationships
