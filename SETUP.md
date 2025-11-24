# Setup Guide

Quick start guide to get your AI Physical Therapy App running.

## Prerequisites

- Node.js 20+ installed
- Neo4j database (cloud or local)
- Chrome browser

## Step 1: Neo4j Database Setup

### Option A: Neo4j Aura (Cloud - Recommended)

1. Go to [neo4j.com/cloud/aura](https://neo4j.com/cloud/aura)
2. Create a free account
3. Create a new database
4. Save your credentials (URI, username, password)
5. Wait for database to be ready (takes a few minutes)

### Option B: Local Neo4j

1. Download Neo4j Desktop from [neo4j.com/download](https://neo4j.com/download)
2. Install and create a new project
3. Create a new database
4. Start the database
5. Note your connection details (bolt://localhost:7687)

## Step 2: Web Application Setup

1. Open a terminal and navigate to the web-app directory:
   ```bash
   cd web-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` with your Neo4j credentials:
   ```env
   NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your-password

   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate-a-random-secret-here
   ```

   To generate a secret, run:
   ```bash
   openssl rand -base64 32
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to [http://localhost:3000](http://localhost:3000)

## Step 3: Create Your Clinic Account

1. Click "Get Started" or navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Fill in your clinic information:
   - Clinic name
   - Your name
   - Email
   - Password
3. Click "Create Account"
4. You'll be redirected to the onboarding flow

## Step 4: Complete Onboarding

### Add Locations

1. Add your first clinic location:
   - Location name (e.g., "Downtown Clinic")
   - Address
   - City, State, ZIP
2. Add more locations if needed
3. Click "Continue"

### Add Team Members (Optional)

1. Add therapists or staff:
   - First and last name
   - Email
   - Temporary password (they can change later)
   - Role (Admin or Therapist)
2. Click "Complete Setup"

You'll be redirected to your dashboard.

## Step 5: Install Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Navigate to and select the `chrome-extension` folder
5. The extension should now appear in your extensions list
6. Note the Extension ID (looks like: `abcdefghijklmnopqrstuvwxyz123456`)

## Step 6: Configure Extension

1. Update `.env.local` in web-app folder:
   ```env
   EXTENSION_ORIGIN=chrome-extension://your-extension-id-here
   ```

2. Restart your Next.js dev server:
   ```bash
   # Press Ctrl+C to stop, then:
   npm run dev
   ```

3. Update `popup.js` in the chrome-extension folder if needed:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000';
   ```

## Step 7: Test Recording

1. Click the extension icon in Chrome toolbar
2. You should see a "Log In" button
3. Click it to authenticate
4. Once logged in:
   - Select a location
   - Enter a customer name (optional)
   - Click "Start Recording"
5. Speak for a few seconds
6. Click "Stop Recording"
7. Check your dashboard for the recorded session

## Troubleshooting

### Extension Can't Connect

- Make sure Next.js dev server is running
- Check that CORS is configured (middleware.ts)
- Verify EXTENSION_ORIGIN in .env.local

### Database Connection Errors

- Verify Neo4j credentials in .env.local
- Check that Neo4j database is running
- Test connection using Neo4j Browser

### Authentication Issues

- Clear browser cookies
- Check NEXTAUTH_SECRET is set
- Verify NextAuth configuration

### Audio Recording Not Working

- Check microphone permissions in Chrome
- Verify extension has tabCapture permission
- Check browser console for errors

## Next Steps

### Production Deployment

1. Deploy to Vercel:
   - Push code to GitHub
   - Connect repository to Vercel
   - Add environment variables
   - Deploy

2. Publish Chrome Extension:
   - Update manifest.json with production URLs
   - Package extension
   - Submit to Chrome Web Store

### Add Icons to Extension

Create or add icon files in `chrome-extension/icons/`:
- icon16.png (16x16)
- icon48.png (48x48)
- icon128.png (128x128)

You can use a tool like [favicon.io](https://favicon.io) to generate icons.

## Getting Help

- Check the [README.md](README.md) for detailed documentation
- Review the [Chrome Extension README](chrome-extension/README.md)
- Check console logs for errors
- Ensure all dependencies are installed

## Development Tips

### Useful Commands

```bash
# Web app
cd web-app
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter

# Check what's running
lsof -i :3000        # Check if port 3000 is in use
```

### Database Management

You can use Neo4j Browser to:
- View your data
- Run Cypher queries
- Monitor performance

Connect at: `http://localhost:7474` (local) or through Neo4j Aura console (cloud)

### Useful Cypher Queries

```cypher
// View all clinics
MATCH (c:Clinic) RETURN c

// View all sessions with relationships
MATCH (s:Session)-[r]-(n) RETURN s, r, n

// Count sessions by status
MATCH (s:Session)
RETURN s.status, count(s) as count

// Delete all data (USE WITH CAUTION!)
MATCH (n) DETACH DELETE n
```

## Support

For issues or questions, refer to the main [README.md](README.md) file or create an issue in the repository.
