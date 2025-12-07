# Full-Stack Application Starter

A clean architecture starter template with Next.js, Neo4j, and Chrome Extension integration.

## Project Structure

```
PhysicalTherapyApp/
├── web-app/              # Next.js web application
│   ├── app/              # App router pages and API routes
│   ├── components/       # React components (Radix UI + Tailwind)
│   ├── lib/              # Utilities and database functions
│   └── types/            # TypeScript type definitions
├── chrome-extension/     # Chrome extension
│   ├── manifest.json     # Extension configuration
│   ├── popup.html        # Extension UI
│   ├── src/              # TypeScript source files
│   └── dist/             # Compiled JavaScript
└── README.md
```

## Tech Stack

### Web Application
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: Radix UI + Tailwind CSS v4
- **Database**: Neo4j (graph database)
- **Authentication**: NextAuth.js
- **Hosting**: Vercel

### Chrome Extension
- **Manifest**: V3
- **Storage**: Chrome Storage API
- **Permissions**: activeTab, storage, tabCapture

## Getting Started

### Prerequisites

- Node.js 20+
- Neo4j instance (local or cloud)
- Chrome browser (for extension)

### Installation

#### 1. Web Application Setup

```bash
cd web-app
npm install
```

#### 2. Configure Environment Variables

Create `.env.local` in the `web-app` directory:

```env
# Neo4j Configuration
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# Chrome Extension Origin (for CORS)
EXTENSION_ORIGIN=chrome-extension://your-extension-id
```

#### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

#### 4. Chrome Extension Setup

```bash
cd chrome-extension
npm install
npm run build  # Compile TypeScript to JavaScript
```

Then install in Chrome:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. Note the extension ID and update `.env.local`

## Architecture Overview

### Database Layer (Neo4j)

The app uses Neo4j as a graph database. Connection setup is in [web-app/lib/neo4j.ts](web-app/lib/neo4j.ts).

Example database operations are in [web-app/lib/db/example.ts](web-app/lib/db/example.ts).

To initialize your database schema, edit [web-app/lib/db/init.ts](web-app/lib/db/init.ts).

### Authentication

NextAuth.js is configured in [web-app/app/api/auth/[...nextauth]/route.ts](web-app/app/api/auth/[...nextauth]/route.ts).

Auth helpers are in [web-app/lib/auth.ts](web-app/lib/auth.ts):
- `getSession()` - Get current session
- `getCurrentUser()` - Get current user
- `requireAuth()` - Enforce authentication
- `requireAdmin()` - Enforce admin role

### API Routes

Example API route: [web-app/app/api/example/route.ts](web-app/app/api/example/route.ts)

### Pages

- **Home**: [web-app/app/page.tsx](web-app/app/page.tsx) - Landing page
- **Login**: [web-app/app/login/page.tsx](web-app/app/login/page.tsx) - Authentication
- **Dashboard**: [web-app/app/dashboard/page.tsx](web-app/app/dashboard/page.tsx) - Main app view

### Chrome Extension

- **Background Worker**: [chrome-extension/src/background.ts](chrome-extension/src/background.ts)
- **Popup UI**: [chrome-extension/src/popup.ts](chrome-extension/src/popup.ts)
- **Manifest**: [chrome-extension/manifest.json](chrome-extension/manifest.json)

The extension communicates with your Next.js API using `fetch` with credentials.

## CORS Setup

The middleware in [web-app/middleware.ts](web-app/middleware.ts) handles CORS for the Chrome extension.

Update `EXTENSION_ORIGIN` in your `.env.local` with your extension's origin (e.g., `chrome-extension://abc123...`).

## Building Your App

This is a clean slate - the business logic has been removed. Here's how to get started:

1. **Define Your Data Model**
   - Edit [web-app/lib/db/init.ts](web-app/lib/db/init.ts) to create constraints and indexes
   - Create model files in `web-app/lib/db/` (see `example.ts` for reference)

2. **Create API Routes**
   - Add routes in `web-app/app/api/`
   - Use the example route as a template

3. **Build Your UI**
   - Add pages in `web-app/app/`
   - Use existing UI components from `components/ui/`

4. **Extend the Chrome Extension**
   - Add functionality to `src/popup.ts` and `src/background.ts`
   - Update permissions in `manifest.json` as needed

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

### Chrome Extension Publication

1. Build the extension: `cd chrome-extension && npm run build`
2. Create a ZIP of the chrome-extension folder
3. Upload to Chrome Web Store

## Security Checklist

- [ ] Change all default secrets
- [ ] Enable Neo4j encryption
- [ ] Set up proper CORS origins
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up error monitoring
- [ ] Configure CSP headers

## License

MIT License - feel free to use this as a starter for your own projects.
