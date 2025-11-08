# Instagram Bot Dashboard

## Overview

This is an Instagram DM auto-reply bot with a web-based dashboard. The bot automatically responds to incoming Instagram direct messages with a configurable welcome message. The dashboard provides three authentication methods: username/password login, appstate.json file upload, or cookie string import. Users can configure the welcome message, enable/disable auto-reply, start/stop the bot, and monitor real-time activity through a console and statistics display.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: Vanilla JavaScript with Socket.IO for real-time communication

The frontend is a single-page application served from `index.html` with RTL (right-to-left) layout for Arabic language support. The UI is built with vanilla JavaScript (`public/client.js`) and custom CSS (`public/styles.css`) following Material Design principles adapted for RTL.

**Key Design Decisions**:
- **RTL-First Design**: All layouts flow right-to-left to support Arabic content natively
- **Real-time Updates**: Socket.IO client maintains persistent connection for live bot logs and statistics
- **Client-Side State Management**: Simple state tracking in closure variables (no framework needed for this utility dashboard)
- **Accessibility**: Semantic HTML with ARIA attributes for screen readers

**Component Structure**:
- Status badge displaying bot online/offline state
- Three authentication panels (login form, file upload, cookie import)
- Welcome message configuration with enable/disable toggle
- Bot control buttons (start/stop)
- Real-time console for bot activity logs
- Statistics display showing messages received/sent
- Optional TTS (text-to-speech) toggle for message notifications

### Backend Architecture

**Technology Stack**: Node.js with Express.js server and Socket.IO for WebSocket communication

The backend uses a hybrid Express HTTP server with Socket.IO WebSocket layer for bidirectional communication. The architecture separates concerns between the web server (`server.js`) and bot logic (`bot.js`).

**Key Architectural Decisions**:

1. **Modular Bot Logic**: Bot functionality isolated in `bot.js` as ES module with exported control functions
   - Rationale: Separation allows bot to be started/stopped independently of web server
   - Pros: Testable, maintainable, can be imported by other modules
   - Cons: Requires careful state management between modules

2. **Socket.IO for Real-time Communication**: WebSocket layer for live updates
   - Rationale: Instagram bot needs to stream logs and stats to dashboard in real-time
   - Pros: Bi-directional, event-based, automatic reconnection
   - Cons: Slightly more complex than REST-only approach

3. **File-Based State Persistence**: JSON files for configuration and session state
   - `config.json`: Bot settings, welcome message, statistics, enabled state
   - `appstate.json`: Instagram session serialization (cookies, auth tokens)
   - Rationale: Simple, human-readable, easy to backup/restore
   - Pros: No database required, portable, easy debugging
   - Cons: Not suitable for high concurrency, potential race conditions

4. **Three Authentication Methods**: Flexibility in how users authenticate with Instagram
   - Method 1: Username/password login via Instagram Private API
   - Method 2: Upload serialized appstate.json file
   - Method 3: Paste raw cookie string
   - Rationale: Different users have different comfort levels and technical capabilities
   - Pros: Maximum flexibility, accommodates various use cases
   - Cons: More code paths to maintain

5. **Polling Architecture for Instagram Messages**: Interval-based message checking
   - Rationale: Instagram Private API doesn't provide push notifications
   - Implementation: `setInterval` polling inbox threads every few seconds
   - Pros: Simple, reliable, works with unofficial API
   - Cons: Not real-time, potential rate limiting concerns

### Data Storage

**File-Based JSON Storage**: All persistent data stored in local JSON files

1. **config.json Structure**:
   ```
   - enabled: boolean (auto-reply on/off)
   - welcomeMessage: string (message template)
   - stats: { messagesReceived, messagesSent }
   - botRunning: boolean (current bot state)
   ```

2. **appstate.json Structure**: Serialized Instagram session state from `instagram-private-api` library
   - Contains cookies, CSRF tokens, user ID, device ID
   - Regenerated on each login or imported from file/cookie string

**State Management Strategy**:
- Read config on each API request (simple, no caching complexity)
- Write config immediately on updates (ensures persistence)
- In-memory Map for tracking last message IDs to prevent duplicate replies

### Authentication & Session Management

**Instagram Authentication Flow**:

1. **Initial Login**: Three entry points converge to same session state
   - Username/password → IgApiClient.login() → serialize state
   - File upload → deserialize into IgApiClient.state
   - Cookie string → convert to CookieJar → inject into IgApiClient

2. **Session Persistence**: 
   - After successful authentication, serialize session to `appstate.json`
   - Bot initialization attempts to deserialize from file first
   - Re-authentication only needed if session expires

3. **Security Considerations**:
   - Password cleared from memory after login
   - Sensitive credentials stored in local files only
   - No database exposure of Instagram credentials

## External Dependencies

### Third-Party NPM Packages

1. **instagram-private-api**: Unofficial Instagram API client
   - Purpose: Core Instagram functionality (login, send messages, fetch inbox)
   - Why chosen: Most maintained unofficial Instagram API for Node.js
   - Integration: Singleton instance managed in bot.js module

2. **Socket.IO**: WebSocket library
   - Purpose: Real-time bi-directional communication between server and dashboard
   - Why chosen: Industry standard, automatic fallbacks, easy event-based API
   - Integration: Wraps HTTP server, emits bot logs and stats to connected clients

3. **Express.js**: Web server framework
   - Purpose: HTTP API endpoints and static file serving
   - Why chosen: Minimal, widely adopted, excellent middleware ecosystem

4. **tough-cookie**: Cookie handling library
   - Purpose: Parse and manage cookie strings for Instagram authentication
   - Why chosen: Required by instagram-private-api, robust cookie RFC compliance

5. **multer**: Multipart form data parser
   - Purpose: Handle appstate.json file uploads from dashboard
   - Why chosen: Standard Express middleware for file uploads

6. **fs-extra**: Enhanced filesystem operations
   - Purpose: JSON file read/write with automatic directory creation
   - Why chosen: Promise-based API, reduces boilerplate over native fs

### External Services

**Instagram Platform**: 
- Type: Social media platform API (unofficial)
- Purpose: Send/receive direct messages, authenticate users
- Integration method: instagram-private-api library reverse-engineered endpoints
- Rate limiting: Managed through polling intervals and request throttling
- Authentication: Session-based with serialized state

### UI Component Libraries

**Radix UI**: Accessible component primitives
- Purpose: Pre-built accessible UI components (dialogs, dropdowns, switches, etc.)
- Note: Installed in package.json but appears to be prepared for future migration from vanilla JS to React
- Current state: Design guidelines reference Material Design, but Radix components available

**shadcn/ui**: Component configuration
- Purpose: UI component styling system built on Radix + Tailwind
- Note: `components.json` configured but not actively used in current vanilla JS implementation
- Future direction: May indicate planned migration to React-based dashboard

### Development Tools

**TypeScript**: Type checking (configured but not enforced)
- `server/index.ts` shim exists to import plain JavaScript server
- Indicates incremental migration strategy toward typed codebase

**Vite**: Build tool (configured in package.json scripts)
- Purpose: Bundle client-side code and assets for production
- Current usage: Build script references Vite, suggests future frontend build step

**Drizzle ORM**: Database toolkit
- Purpose: Type-safe database access layer
- Status: Listed in dependencies but no database schema files present
- Implication: Database integration may be planned but not yet implemented