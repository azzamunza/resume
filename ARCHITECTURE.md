# Architecture Overview

This document describes the complete architecture of the resume website with GitHub OAuth backend integration.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Pages                             │
│                  (https://azzamunza.github.io)                   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Frontend (Static)                      │   │
│  │                                                           │   │
│  │  • index.html (Main Resume)                              │   │
│  │  • resumes/index.html (Archive & Editor)                 │   │
│  │  • js/github-oauth-backend.js (OAuth Integration)        │   │
│  │  • css/style.css                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                       │
│                           │ 1. User clicks "Login"               │
│                           │ 2. GET /api/auth/github              │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend OAuth Server                        │
│              (Vercel/Heroku/Railway - Node.js/Express)           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Express Server                          │   │
│  │                                                           │   │
│  │  Authentication Endpoints:                               │   │
│  │  • GET /api/auth/github                                  │   │
│  │    → Redirects to GitHub OAuth                           │   │
│  │  • GET /api/auth/callback                                │   │
│  │    → Handles OAuth callback, exchanges code for token   │   │
│  │  • GET /api/auth/status                                  │   │
│  │    → Returns current auth status                         │   │
│  │  • POST /api/auth/logout                                 │   │
│  │    → Destroys session                                    │   │
│  │                                                           │   │
│  │  GitHub API Proxy Endpoints:                             │   │
│  │  • GET /api/github/user                                  │   │
│  │  • GET /api/github/repos/:owner/:repo                    │   │
│  │  • GET /api/github/repos/:owner/:repo/contents/:path     │   │
│  │  • PUT /api/github/repos/:owner/:repo/contents/:path     │   │
│  │                                                           │   │
│  │  Session Management:                                      │   │
│  │  • express-session                                        │   │
│  │  • Secure cookies (httpOnly, sameSite)                   │   │
│  │  • 24-hour expiration                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                       │
│                           │ 3. Redirect to GitHub                │
│                           │ 4. Exchange code for token           │
│                           │ 5. Store token in session            │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub API                               │
│                    (api.github.com)                              │
│                                                                   │
│  • OAuth Authorization (github.com/login/oauth/authorize)        │
│  • Token Exchange (github.com/login/oauth/access_token)         │
│  • API Endpoints (api.github.com)                                │
│    - User info                                                   │
│    - Repository access                                           │
│    - File operations (read/write)                                │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### Web Application Flow (Backend OAuth)

```
User                Frontend              Backend              GitHub
 │                     │                     │                    │
 │  Click "Login"      │                     │                    │
 ├────────────────────►│                     │                    │
 │                     │  GET /api/auth/github                    │
 │                     ├────────────────────►│                    │
 │                     │                     │  Return authUrl   │
 │                     │◄────────────────────┤                    │
 │  Redirect to GitHub OAuth                 │                    │
 ├───────────────────────────────────────────┴───────────────────►│
 │                     │                     │    Authorize       │
 │◄────────────────────────────────────────────────────────────────┤
 │  Redirect to /api/auth/callback?code=xxx  │                    │
 ├───────────────────────────────────────────►│                    │
 │                     │                     │  Exchange code     │
 │                     │                     ├───────────────────►│
 │                     │                     │  Return token      │
 │                     │                     │◄───────────────────┤
 │                     │                     │  Store in session  │
 │                     │                     │  Set cookie        │
 │  Redirect to frontend with ?auth=success  │                    │
 │◄────────────────────────────────────────┤                    │
 │                     │                     │                    │
 │  User is authenticated                    │                    │
 └─────────────────────┴─────────────────────┴────────────────────┘
```

### Device Flow (Legacy)

```
User                Frontend              GitHub
 │                     │                    │
 │  Click "Login"      │                    │
 ├────────────────────►│                    │
 │                     │  Request device code
 │                     ├───────────────────►│
 │                     │  Return code + URL │
 │                     │◄───────────────────┤
 │  Show modal with code                   │
 │◄────────────────────┤                    │
 │  Go to GitHub and enter code            │
 ├─────────────────────────────────────────►│
 │  Authorize app                          │
 │◄─────────────────────────────────────────┤
 │                     │  Poll for token    │
 │                     ├───────────────────►│
 │                     │  Return token      │
 │                     │◄───────────────────┤
 │                     │  Store in localStorage
 │  User is authenticated                   │
 └─────────────────────┴────────────────────┘
```

## Data Flow

### File Editing Flow

```
1. User Authentication
   User → Frontend → Backend → GitHub → Backend → Frontend
   (Establishes session with access token)

2. Load File Content
   User clicks "Job Search Config" tab
   Frontend → GitHub (raw.githubusercontent.com)
   (Public read, no auth needed)

3. Edit File
   User types in editor textarea
   (Local changes only)

4. Save File
   User clicks "Save to GitHub"
   Frontend → Backend (/api/github/repos/.../contents/...)
   Backend → GitHub API (with access token from session)
   GitHub → Backend (success response)
   Backend → Frontend (confirmation)
   Frontend → User (success message)
```

## Security Architecture

### Token Security

**Backend OAuth (Secure)**
```
Access Token
    │
    ├─ Stored: Server-side session
    ├─ Transport: Never sent to frontend
    ├─ Usage: Backend makes all API calls
    └─ Expiry: Session-based (24 hours)

Session Cookie
    │
    ├─ httpOnly: true (not accessible via JavaScript)
    ├─ secure: true (HTTPS only in production)
    ├─ sameSite: 'none' (cross-site with credentials)
    └─ signed: true (tamper-proof)
```

**Device Flow (Legacy)**
```
Access Token
    │
    ├─ Stored: localStorage (frontend)
    ├─ Transport: Sent with every API call
    ├─ Usage: Frontend makes direct API calls
    └─ Expiry: Manual verification on each use
```

### CORS Handling

**Backend OAuth Solution:**
- Backend server sets CORS headers explicitly
- `credentials: 'include'` in frontend requests
- Session cookies automatically sent with requests
- No CORS issues because backend proxies all GitHub API calls

**Device Flow Issue:**
- Direct calls to GitHub API from frontend
- GitHub's CORS policy may block certain operations
- Browser security restrictions on cross-origin requests

## Component Details

### Frontend Components

#### Main Resume (`index.html`)
- Static HTML resume
- Print customization features
- No OAuth integration needed
- Loads YouTube portfolio via JSON

#### Archive & Editor (`resumes/index.html`)
- Resume archive display
- Job listings archive
- File editor tabs:
  - Job Search Config (SearchSites.md, JobRoles.md)
  - Work History (work-history.md)
- OAuth authentication UI
- Save functionality with backend integration

#### OAuth Integration (`js/github-oauth-backend.js`)
- `initAuth()` - Initialize auth on page load
- `checkAuthStatus()` - Verify session with backend
- `handleAuth()` - Initiate OAuth flow
- `handleLogout()` - Destroy session
- `saveFile()` - Save via backend API proxy

### Backend Components

#### Express Server (`server/index.js`)
- Port: 3000 (configurable via PORT env var)
- CORS middleware with credentials support
- Session middleware with secure cookies
- OAuth endpoints for GitHub Web Application Flow
- GitHub API proxy endpoints
- Error handling middleware

#### Dependencies
- `express` - Web server framework
- `cors` - CORS middleware
- `express-session` - Session management
- `dotenv` - Environment variables
- `node-fetch` - HTTP client for GitHub API

### Environment Variables

**Required:**
- `GITHUB_CLIENT_ID` - GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth App Client Secret

**Optional:**
- `CALLBACK_URL` - OAuth callback URL (default: localhost)
- `FRONTEND_URL` - Frontend origin for CORS (default: GitHub Pages)
- `SESSION_SECRET` - Session encryption key (default: insecure)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## Deployment Architecture

### Vercel (Serverless)

```
GitHub Repository
    │
    ├─ vercel.json (configuration)
    ├─ server/index.js (serverless function)
    └─ Automatic deployment on git push

Vercel Platform
    │
    ├─ Builds: Converts Express app to serverless functions
    ├─ Routes: Maps /api/* to server/index.js
    ├─ Environment: Variables set via dashboard
    └─ Scaling: Automatic based on traffic
```

### Heroku (Traditional)

```
GitHub Repository
    │
    ├─ Procfile (process definition)
    ├─ server/package.json (dependencies)
    └─ Manual deployment via git push

Heroku Platform
    │
    ├─ Buildpack: Detects Node.js
    ├─ Process: Runs node server/index.js
    ├─ Environment: Config vars set via CLI/dashboard
    └─ Scaling: Manual dyno scaling
```

### Railway (Modern)

```
GitHub Repository
    │
    └─ Auto-detects Node.js project

Railway Platform
    │
    ├─ Builds: Automatic on git push
    ├─ Environment: Variables set via dashboard
    ├─ Scaling: Automatic based on usage
    └─ Domains: Auto-generated HTTPS domains
```

## File Structure

```
resume/
├── index.html                      # Main resume page
├── resumes/
│   ├── index.html                  # Archive & editor
│   └── [date-folders]/             # Archived resumes
├── js/
│   ├── script.js                   # Main resume JS
│   └── github-oauth-backend.js     # Backend OAuth integration
├── css/
│   └── style.css                   # Styles
├── data/
│   ├── SearchSites.md              # Job search config
│   ├── JobRoles.md                 # Target roles
│   └── work-history.md             # Work history
├── server/                         # Backend OAuth server
│   ├── index.js                    # Express server
│   ├── package.json                # Dependencies
│   ├── .env.example                # Environment template
│   └── README.md                   # Backend docs
├── vercel.json                     # Vercel config
├── Procfile                        # Heroku config
├── BACKEND_DEPLOYMENT.md           # Deployment guide
├── FRONTEND_INTEGRATION.md         # Integration guide
├── OAUTH_SETUP.md                  # OAuth setup guide
├── ARCHITECTURE.md                 # This file
└── README.md                       # Main documentation
```

## Migration Path

### Phase 1: Current (Device Flow)
- ✅ Frontend-only OAuth using Device Flow
- ✅ Direct GitHub API calls from browser
- ⚠️ May have CORS issues
- ⚠️ Less secure (tokens in localStorage)

### Phase 2: Backend Deployment (This PR)
- ✅ Backend OAuth server implemented
- ✅ Web Application Flow ready
- ✅ Deployment configurations created
- ⏳ Awaiting deployment and frontend integration

### Phase 3: Frontend Integration
- 📋 Update resumes/index.html to use backend API
- 📋 Replace Device Flow with backend OAuth
- 📋 Test end-to-end authentication
- 📋 Verify CORS issues are resolved

### Phase 4: Production
- 📋 Deploy backend to production
- 📋 Deploy frontend changes to GitHub Pages
- 📋 Monitor for issues
- 📋 Gather user feedback

### Phase 5: Deprecation (Future)
- 📋 Mark Device Flow as legacy
- 📋 Eventually remove Device Flow code
- 📋 Keep backend as primary method

## Benefits Over Device Flow

| Aspect | Device Flow | Backend OAuth |
|--------|-------------|---------------|
| **CORS Issues** | ❌ May occur | ✅ Resolved |
| **Token Security** | ⚠️ Frontend localStorage | ✅ Server-side session |
| **User Experience** | ⚠️ Manual code entry | ✅ Seamless redirect |
| **Mobile Support** | ⚠️ Awkward code copying | ✅ Works seamlessly |
| **API Calls** | ❌ Direct (may fail) | ✅ Proxied (always works) |
| **Session Management** | ⚠️ Manual verification | ✅ Automatic |
| **Setup Complexity** | ✅ Simple (no backend) | ⚠️ Requires backend deploy |
| **Maintenance** | ⚠️ User confusion | ✅ Intuitive |

## Performance Considerations

### Backend Response Times
- OAuth initialization: ~100ms (redirect URL generation)
- OAuth callback: ~500-1000ms (token exchange + user info)
- API proxy calls: ~200-500ms (backend → GitHub → backend)
- Session check: ~50ms (session lookup)

### Caching Strategies
- File content loading: Uses public GitHub URLs (fast, no auth)
- User info: Cached in session (no repeated lookups)
- Session data: In-memory or session store (very fast)

### Scaling
- **Vercel**: Auto-scales serverless functions
- **Heroku**: Manual dyno scaling (free tier: 1 dyno)
- **Railway**: Auto-scales based on usage

## Security Checklist

- ✅ Client Secret never exposed to frontend
- ✅ CSRF protection via state parameter
- ✅ Secure session cookies (httpOnly, secure in production)
- ✅ Session expiration (24 hours)
- ✅ CORS properly configured
- ✅ Environment variables not committed to Git
- ✅ HTTPS required in production
- ✅ Input validation on all endpoints
- ✅ Error messages don't leak sensitive info
- ✅ Rate limiting consideration (GitHub's limits apply)

## Monitoring & Observability

### Logs
- Request logs (Express default)
- Error logs (console.error)
- OAuth flow events (success/failure)
- GitHub API errors

### Metrics to Monitor
- Authentication success rate
- API proxy response times
- Session creation/destruction
- Error rates by endpoint
- GitHub API rate limit usage

### Alerting
- Backend server down
- High error rate
- GitHub API rate limit approaching
- OAuth failures (callback errors)

## Future Enhancements

1. **Token Refresh**
   - Implement automatic token refresh
   - Silent re-authentication for expired sessions

2. **Rate Limiting**
   - Add rate limiting middleware
   - Protect against abuse

3. **Caching**
   - Cache GitHub API responses
   - Reduce API calls and improve performance

4. **Database**
   - Add persistent session store (Redis, PostgreSQL)
   - Currently uses in-memory sessions

5. **Multi-Repository Support**
   - Allow editing files in different repositories
   - Dynamic repo selection

6. **Webhooks**
   - Receive notifications of file changes
   - Sync state automatically

7. **Audit Logs**
   - Track all file modifications
   - Security and compliance

## Support & Resources

- **Backend API Docs**: `server/README.md`
- **Deployment Guide**: `BACKEND_DEPLOYMENT.md`
- **Integration Guide**: `FRONTEND_INTEGRATION.md`
- **OAuth Setup**: `OAUTH_SETUP.md`
- **Main Docs**: `README.md`

---

**Last Updated**: November 20, 2025
**Version**: 1.0.0
**Status**: Ready for Deployment
