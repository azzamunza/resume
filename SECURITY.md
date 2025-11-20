# Security Documentation

This document outlines the security measures implemented in the GitHub OAuth backend server.

## Overview

The backend server implements multiple layers of security to protect user data and prevent common web vulnerabilities.

## Security Measures

### 1. Authentication & Authorization

#### OAuth Web Application Flow
- Uses GitHub's official OAuth Web Application Flow
- Authorization code exchanged server-side (never exposed to frontend)
- Access tokens stored securely in server-side sessions
- No tokens or secrets in browser localStorage or sessionStorage

#### Session Management
- Session-based authentication using `express-session`
- Secure session cookies:
  - `httpOnly: true` - Prevents JavaScript access
  - `secure: true` in production - HTTPS only
  - `sameSite: 'none'` in production with credentials
  - 24-hour expiration
- Session secret must be strong random string in production

#### Authorization
- `requireAuth` middleware on all API endpoints
- Validates session exists before allowing GitHub API access
- No direct token exposure to frontend

### 2. CSRF (Cross-Site Request Forgery) Protection

#### Multi-layered CSRF Protection

**Layer 1: OAuth State Parameter**
```javascript
// In /api/auth/github endpoint
const state = Math.random().toString(36).substring(7);
req.session.oauthState = state;
// State validated in callback to prevent CSRF
```

**Layer 2: SameSite Cookies**
```javascript
sameSite: 'lax' // In development
sameSite: 'none' // In production with credentials
```

**Layer 3: Session-based Implicit CSRF Token**
- Session ID acts as implicit CSRF token
- Session cookies are `httpOnly` and can only be set by server
- Attackers cannot forge valid session cookies

**Layer 4: Strict CORS Policy**
- Only configured frontend origin allowed
- Credentials required for cross-origin requests

### 3. CORS (Cross-Origin Resource Sharing)

#### Strict Origin Validation
```javascript
origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser clients
    if (origin === FRONTEND_URL) {
        callback(null, true);
    } else {
        callback(new Error('Not allowed by CORS'));
    }
}
```

#### Configuration
- `credentials: true` - Allows cookies
- Specific methods allowed: GET, POST, PUT, DELETE, OPTIONS
- Specific headers allowed: Content-Type, Authorization
- No wildcard (*) origins

### 4. Input Validation & Sanitization

#### File Path Validation
```javascript
// Prevent directory traversal attacks
if (path.includes('..') || path.startsWith('/')) {
    return res.status(400).json({ error: 'Invalid file path' });
}
```

#### Commit Message Validation
```javascript
// Type and length validation
if (!message || typeof message !== 'string' || message.length > 1000) {
    return res.status(400).json({ error: 'Invalid commit message' });
}
```

#### SHA Validation
```javascript
// Validate Git SHA format (40 hex characters)
if (sha && (typeof sha !== 'string' || !/^[a-f0-9]{40}$/i.test(sha))) {
    return res.status(400).json({ error: 'Invalid SHA' });
}
```

#### Branch Name Validation
```javascript
// Allow only safe branch name characters
if (branch && (typeof branch !== 'string' || !/^[\w\-\.\/]+$/.test(branch))) {
    return res.status(400).json({ error: 'Invalid branch name' });
}
```

#### Ref Validation
```javascript
// Validate Git ref format
if (ref && (typeof ref !== 'string' || !/^[\w\-\.\/]+$/.test(ref))) {
    return res.status(400).json({ error: 'Invalid ref' });
}
```

#### URL Encoding
```javascript
// Properly encode query parameters
url += `?ref=${encodeURIComponent(ref)}`;
```

### 5. Secrets Management

#### Environment Variables
All sensitive data stored in environment variables:
- `GITHUB_CLIENT_ID` - Public identifier
- `GITHUB_CLIENT_SECRET` - **Must be kept secret**
- `SESSION_SECRET` - **Must be strong random string**
- `CALLBACK_URL` - Server callback URL
- `FRONTEND_URL` - Frontend origin for CORS

#### .gitignore
- `.env` file excluded from Git
- `node_modules/` excluded
- No secrets in repository

### 6. Error Handling

#### Safe Error Messages
- No sensitive information leaked in error messages
- Stack traces not sent to client
- Generic errors for auth failures
- Detailed errors logged server-side only

```javascript
catch (error) {
    console.error('Error saving file:', error); // Server-side only
    res.status(500).json({ error: 'Failed to update file' }); // Generic message
}
```

### 7. Dependencies

#### Regular Updates
- Dependencies checked for vulnerabilities
- No known vulnerabilities in current dependencies
- Regular `npm audit` recommended

#### Current Dependencies
- `express` ^4.18.2
- `cors` ^2.8.5
- `express-session` ^1.17.3
- `dotenv` ^16.3.1
- `node-fetch` ^2.7.0

All dependencies verified with `gh-advisory-database` tool.

### 8. Rate Limiting

#### GitHub API Rate Limits
- Authenticated requests: 5,000 per hour per user
- Rate limit handled by GitHub
- Server respects GitHub's rate limit headers

#### Recommendation for Production
Consider adding rate limiting middleware:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Security Checklist

Use this checklist when deploying:

- [ ] `GITHUB_CLIENT_SECRET` set securely (not in Git)
- [ ] `SESSION_SECRET` is strong random string (32+ characters)
- [ ] `NODE_ENV=production` in production
- [ ] HTTPS enabled (required for secure cookies)
- [ ] `FRONTEND_URL` set to correct GitHub Pages URL
- [ ] `CALLBACK_URL` matches GitHub OAuth App settings
- [ ] GitHub OAuth App configured correctly
- [ ] `.env` file not committed to Git
- [ ] Regular dependency updates scheduled
- [ ] Monitoring and logging configured
- [ ] Error tracking set up (e.g., Sentry)
- [ ] Rate limiting considered (optional)

## Threat Model

### Threats Mitigated

✅ **CSRF (Cross-Site Request Forgery)**
- OAuth state parameter
- SameSite cookies
- Session-based authentication

✅ **XSS (Cross-Site Scripting)**
- No user-generated content rendered
- httpOnly cookies prevent JavaScript access
- All API responses are JSON (no HTML)

✅ **Token Theft**
- Tokens never sent to frontend
- Tokens stored server-side in sessions
- Session cookies are httpOnly

✅ **Directory Traversal**
- Path validation on all file operations
- No `..` sequences allowed
- No absolute paths allowed

✅ **Injection Attacks**
- All inputs validated and type-checked
- URL parameters properly encoded
- No SQL (no database)
- GitHub API handles all data storage

✅ **Man-in-the-Middle (MITM)**
- HTTPS required in production
- Secure cookies in production
- No sensitive data in URLs

✅ **Session Hijacking**
- httpOnly cookies
- Secure cookies in production
- Session expiration (24 hours)
- Random session IDs

### Potential Threats & Mitigations

⚠️ **DoS (Denial of Service)**
- **Threat**: Excessive requests could overwhelm server
- **Mitigation**: Add rate limiting middleware in production
- **Status**: Recommended for high-traffic deployments

⚠️ **Brute Force Attacks**
- **Threat**: Repeated authentication attempts
- **Mitigation**: GitHub handles OAuth, has own rate limiting
- **Status**: Handled by GitHub

⚠️ **Session Fixation**
- **Threat**: Attacker sets victim's session ID
- **Mitigation**: express-session generates new IDs on login
- **Status**: Mitigated by library

## Incident Response

### If Client Secret is Compromised

1. **Immediate Actions**:
   - Regenerate client secret in GitHub OAuth App settings
   - Update `GITHUB_CLIENT_SECRET` environment variable
   - Restart server with new secret
   - All existing tokens become invalid

2. **Investigation**:
   - Check server logs for unauthorized access
   - Review recent commits to repository
   - Verify no secrets committed to Git

3. **Prevention**:
   - Rotate secrets regularly (e.g., every 90 days)
   - Use secret management service (e.g., AWS Secrets Manager)
   - Enable GitHub secret scanning

### If Session Secret is Compromised

1. **Immediate Actions**:
   - Generate new session secret
   - Update `SESSION_SECRET` environment variable
   - Restart server
   - All user sessions will be invalidated

2. **User Impact**:
   - Users need to re-authenticate
   - No data loss
   - Sessions expire normally after 24 hours anyway

### If Unauthorized Access Detected

1. **Immediate Actions**:
   - Check server logs for suspicious activity
   - Review GitHub audit log for unauthorized commits
   - Revoke OAuth App access if needed

2. **Investigation**:
   - Identify attack vector
   - Check if any secrets were exposed
   - Review recent code changes

3. **Recovery**:
   - Patch vulnerability
   - Rotate secrets if needed
   - Update documentation

## Security Contact

For security issues or questions:
- **Email**: azzamunza@gmail.com
- **GitHub**: Open a security advisory in the repository

## References

- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)

## Version History

- **1.0.0** (2025-11-20) - Initial security documentation
  - OAuth Web Application Flow implemented
  - CSRF protection documented
  - Input validation added
  - CORS validation added

---

**Last Updated**: 2025-11-20  
**Next Review**: 2026-02-20 (3 months)
