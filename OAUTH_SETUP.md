# GitHub OAuth Setup Guide

This document explains how to set up GitHub OAuth authentication for the resume website's file editor.

## Current Configuration

- **Client ID**: `Ov23liDEPGpyLygXjFwY`
- **Authentication Method**: Device Flow
- **Required Scopes**: `repo` (full control of private repositories)

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

### 8. Alternative Authentication Methods

If Device Flow doesn't work (e.g., in restricted networks):

**Option 1: Personal Access Token (Manual)**
Users can still use the old method by modifying the code to accept manual token entry.

**Option 2: GitHub OAuth Web Flow**
Requires a server-side callback handler to exchange the authorization code for a token. This would require:
- A serverless function (e.g., Netlify Functions, Vercel Functions)
- Secure storage of the client secret
- Callback URL configuration

**Option 3: GitHub App**
More complex but provides finer-grained permissions and better security.

## Support

For issues with OAuth setup, contact:
- **GitHub Support**: https://support.github.com
- **Repository Owner**: azzamunza@gmail.com

## References

- [GitHub OAuth Device Flow Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow)
- [GitHub API Rate Limits](https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api)
- [OAuth Security Best Practices](https://oauth.net/2/security-best-practices/)
