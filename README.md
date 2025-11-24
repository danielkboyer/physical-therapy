# AI Physical Therapy App

An AI-powered platform for physical therapy clinics to record, transcribe, and analyze therapy sessions.

## Project Structure

```
PhysicalTherapyApp/
├── web-app/              # Next.js web application
│   ├── app/              # App router pages and API routes
│   ├── components/       # React components
│   ├── lib/              # Utilities and database functions
│   └── types/            # TypeScript type definitions
├── chrome-extension/     # Chrome extension for session recording
│   ├── manifest.json     # Extension configuration
│   ├── popup.html        # Extension UI
│   ├── popup.js          # Recording logic
│   └── background.js     # Background service worker
└── README.md
```

## Features

### v1 Features

- **Clinic Management**
  - Multi-clinic support with admin roles
  - Multiple locations per clinic
  - User management (admin and therapist roles)
  - Users can work at multiple locations

- **Session Recording**
  - Chrome extension for audio capture
  - High-quality audio recording (44.1kHz)
  - Real-time recording with visual feedback
  - Associate sessions with customers or guests
  - Automatic session upload

- **Customer Management**
  - Create and manage customer profiles
  - Guest customer support (no profile needed)
  - Search and filter customers

- **Data Model**
  - Graph database (Neo4j) for complex relationships
  - Clinics → Locations → Users
  - Sessions linked to therapists, locations, and customers
  - Full audit trail with timestamps

## Tech Stack

### Web Application
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: ShadCN + Tailwind CSS
- **Database**: Neo4j (graph database)
- **Authentication**: NextAuth.js
- **Hosting**: Vercel
- **AI**: Vercel AI SDK (planned for v2)

### Chrome Extension
- **Manifest**: V3
- **Audio API**: MediaRecorder API
- **Storage**: Chrome Storage API
- **Permissions**: tabCapture, storage, activeTab

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

Copy `.env.example` to `.env.local` and fill in your values:

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

#### 3. Initialize Database

The database schema will be created automatically on first run, or you can manually initialize:

```bash
npm run init-db  # You'll need to create this script
```

#### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

#### 5. Install Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. Note the extension ID and update `.env.local`

## Database Schema

### Nodes

- **Clinic**: Represents a physical therapy clinic organization
- **Location**: Physical locations where therapy is provided
- **User**: Therapists and admin users
- **Customer**: Patients receiving therapy
- **Session**: Individual therapy sessions with audio recordings

### Relationships

```
Clinic -[:HAS_LOCATION]-> Location
Clinic -[:HAS_USER]-> User
Clinic -[:HAS_CUSTOMER]-> Customer
Clinic -[:HAS_SESSION]-> Session
User -[:WORKS_AT]-> Location
User -[:CONDUCTED_SESSION]-> Session
Location -[:HOSTED_SESSION]-> Session
Session -[:WITH_CUSTOMER]-> Customer
```

## User Flow

### Initial Setup

1. **Sign Up**: Create clinic account (becomes admin user)
2. **Onboarding**:
   - Add clinic locations
   - Invite team members (therapists)
3. **Chrome Extension**: Install and authenticate

### Recording Sessions

1. Open Chrome extension
2. Select location
3. Enter customer name (or leave as guest)
4. Click "Start Recording"
5. Conduct therapy session
6. Click "Stop Recording"
7. Audio automatically uploaded and saved

### Managing Sessions

1. View all sessions in dashboard
2. Filter by therapist, customer, location
3. Play back audio recordings
4. (v2) View AI-generated transcripts and analysis

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new clinic account
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Onboarding
- `POST /api/onboarding/locations` - Add locations during setup
- `POST /api/onboarding/team` - Add team members during setup

### Locations
- `GET /api/locations` - Get all locations for clinic

### Customers
- `GET /api/customers` - Get all customers (supports search)
- `POST /api/customers` - Create new customer

### Sessions
- `GET /api/sessions` - Get all sessions (supports filtering)
- `POST /api/sessions` - Create new session
- `GET /api/sessions/[id]` - Get session by ID
- `PATCH /api/sessions/[id]` - Update session
- `POST /api/sessions/[id]` - End session and upload audio

## Audio Recording Details

### Format
- **Codec**: WebM
- **Sample Rate**: 44.1kHz
- **Features**: Echo cancellation, noise suppression
- **Chunks**: Recorded in 1-second intervals

### Storage
Currently stored as base64 in Neo4j. For production:
- Upload to cloud storage (S3, GCS, etc.)
- Store URL reference in database
- Implement streaming for large files

### Transcription (Planned v2)
- Use Vercel AI SDK with Whisper API
- Real-time or post-processing transcription
- Store transcript with session

## Security Considerations

### Authentication
- Password hashing with bcrypt (10 rounds)
- JWT-based sessions via NextAuth
- Secure HTTP-only cookies

### CORS
- Restricted to specific extension origin
- Credentials required for API access

### Data Privacy
- HIPAA compliance considerations
- Encrypted data at rest (Neo4j TLS)
- Audit logging on all data access

### Production Checklist
- [ ] Change all default secrets
- [ ] Enable Neo4j encryption
- [ ] Set up proper CORS origins
- [ ] Implement rate limiting
- [ ] Add input validation middleware
- [ ] Set up error monitoring (Sentry)
- [ ] Configure CSP headers
- [ ] Regular security audits

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

### Chrome Extension Publication

1. Create developer account
2. Package extension
3. Submit to Chrome Web Store
4. Update manifest with production URLs

## Future Enhancements (v2+)

### AI Features
- Real-time transcription during sessions
- Automatic SOAP note generation
- Exercise recommendation based on diagnosis
- Progress tracking and insights
- Voice commands during sessions

### Additional Features
- Video recording support
- Mobile app for therapists
- Patient portal for viewing progress
- Billing integration
- Scheduling system
- Analytics dashboard

### Technical Improvements
- WebSocket for real-time updates
- Offline mode support
- Audio compression
- Cloud storage integration
- Multi-language support

## Troubleshooting

### Extension Not Recording
- Check microphone permissions in Chrome
- Verify extension has `tabCapture` permission
- Check console for errors

### Authentication Issues
- Clear cookies and try again
- Verify NEXTAUTH_SECRET is set
- Check CORS configuration

### Database Connection
- Verify Neo4j instance is running
- Check credentials in .env.local
- Ensure network access to Neo4j

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact support or create an issue in the repository.
