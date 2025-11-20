# GitHub OAuth Setup Guide

This document explains how to set up GitHub OAuth authentication for the resume website's file editor.

## ⚠️ IMPORTANT UPDATE

This repository now supports **two OAuth methods**:

1. **Backend OAuth Server (Recommended)** - Uses Web Application Flow with a backend server to resolve CORS issues
2. **Device Flow (Legacy)** - Direct frontend authentication (original implementation)

## Current Configuration

### Backend OAuth Server (New)
- **Authentication Method**: Web Application Flow
- **Backend Server**: Node.js/Express server (in `/server` directory)
- **Required Scopes**: `repo` (full control of private repositories)
- **Advantages**: No CORS issues, secure token storage, better UX
- **Setup Required**: Deploy backend server (see BACKEND_DEPLOYMENT.md)

### Device Flow (Legacy)
- **Client ID**: `Ov23liDEPGpyLygXjFwY`
- **Authentication Method**: Device Flow (direct frontend)
- **Required Scopes**: `repo` (full control of private repositories)
- **Limitations**: May have CORS issues, less secure token storage

## GitHub OAuth App Configuration

The OAuth App should be configured with the following settings:

### 1. Device Flow Settings

Device Flow is automatically supported by GitHub OAuth Apps. No special configuration is needed beyond creating the OAuth App.

### 2. Verify OAuth App Settings

1. Go to [GitHub Developer Settings > OAuth Apps](https://github.com/settings/developers)
2. Find the OAuth App with Client ID `Ov23liDEPGpyLygXjFwY`
3. Verify the following settings:
   - **Application name**: Choose a descriptive name
   - **Homepage URL**: `https://azzamunza.github.io/resume/` (or your deployment URL)
   - **Authorization callback URL**: Not required for Device Flow (can be blank or set to homepage)

### 3. Device Flow Support

The Device Flow is enabled by default for all GitHub OAuth Apps. It works as follows:

1. User clicks "Login with GitHub"
2. App requests a device code from `https://github.com/login/device/code`
3. User is shown a verification code and URL
4. User goes to GitHub and enters the code
5. App polls `https://github.com/login/oauth/access_token` for the token
6. Once authorized, the app receives an access token

### 4. Testing the Integration

To test the OAuth integration:

1. Open `resumes/index.html` in a browser
2. Navigate to the "Job Search Config" or "Work History" tab
3. Click "Login with GitHub"
4. Follow the instructions in the modal:
   - Copy the verification code
   - Click "Open GitHub to Authorize"
   - Enter the code on GitHub
   - Authorize the application
5. The page will automatically detect the authorization
6. You should see "Authenticated" status
7. The "Save to GitHub" buttons should be enabled

### 5. Troubleshooting

**"Failed to fetch" error:**
- Check browser console for CORS errors
- Ensure the OAuth App exists and Client ID is correct
- Verify network connectivity

**"Invalid token" error:**
- Token may have expired
- Click "Logout" and re-authenticate
- Check if the OAuth App has been deleted or suspended

**"No access to repository" error:**
- User must have write access to the `azzamunza/resume` repository
- Verify the user is a collaborator or owner
- Check repository visibility settings

**Authorization times out:**
- The device code expires after 15 minutes
- Click "Cancel" and try again
- Ensure you complete the authorization on GitHub quickly

### 6. Security Considerations

✅ **Good Security Practices:**
- Device Flow doesn't expose client secrets (none needed)
- Tokens are stored in localStorage (user-scoped)
- Token verification happens on every page load
- Repository access is verified before allowing saves

⚠️ **Security Notes:**
- Users should only authorize on trusted devices
- Tokens should be cleared when using shared computers
- The "Logout" button clears all stored credentials

### 7. Rate Limits

GitHub API rate limits apply:
- **Authenticated requests**: 5,000 per hour
- **Device Flow polling**: Should poll at 5+ second intervals
- The implementation respects GitHub's recommended intervals

### 8. Backend OAuth Server (Recommended)

**✅ Now Implemented!** The repository includes a complete backend OAuth server implementation.

**Why Use Backend OAuth?**
- ✅ Resolves CORS issues completely
- ✅ Secure token storage (server-side sessions)
- ✅ Better user experience (seamless redirect)
- ✅ Production-ready and scalable
- ✅ No manual code entry required

**Setup Instructions:**

1. **Deploy Backend Server**
   - See `BACKEND_DEPLOYMENT.md` for detailed deployment instructions
   - Deploy to Vercel (recommended), Heroku, Railway, or any Node.js host
   - Backend code is in `/server` directory

2. **Create New GitHub OAuth App**
   - Go to https://github.com/settings/developers
   - Create a new OAuth App (separate from Device Flow app)
   - Set callback URL to: `https://your-backend-url.com/api/auth/callback`
   - Copy Client ID and Client Secret

3. **Configure Backend**
   - Set environment variables (Client ID, Client Secret, Frontend URL, etc.)
   - See `server/.env.example` for all required variables

4. **Update Frontend**
   - See `FRONTEND_INTEGRATION.md` for integration steps
   - Update frontend to use backend API endpoints
   - Test authentication flow

**Benefits over Device Flow:**
- No CORS errors when calling GitHub API
- More secure (tokens never exposed to frontend)
- Better mobile experience (no code copying)
- Supports standard OAuth Web Application Flow
- Session-based authentication (no localStorage)

**Files:**
- `server/index.js` - Backend server implementation
- `server/package.json` - Dependencies
- `server/README.md` - Backend API documentation
- `js/github-oauth-backend.js` - Frontend integration code
- `BACKEND_DEPLOYMENT.md` - Deployment guide
- `FRONTEND_INTEGRATION.md` - Frontend integration guide

### 9. Alternative Authentication Methods (Legacy)

If neither Device Flow nor Backend OAuth work:

**Option 1: Personal Access Token (Manual)**
Users can manually create and paste GitHub Personal Access Tokens (not recommended for production).

**Option 2: GitHub App**
More complex but provides finer-grained permissions and better security. Would require separate implementation.

## Support

For issues with OAuth setup, contact:
- **GitHub Support**: https://support.github.com
- **Repository Owner**: azzamunza@gmail.com

## References

- [GitHub OAuth Device Flow Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow)
- [GitHub API Rate Limits](https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api)
- [OAuth Security Best Practices](https://oauth.net/2/security-best-practices/)
