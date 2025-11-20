# Frontend Integration Guide

This guide shows how to update the frontend to use the backend OAuth server instead of the Device Flow.

## Overview

The current implementation uses GitHub Device Flow (direct frontend authentication). We need to replace it with backend API calls to resolve CORS issues.

## Changes Required

### Option 1: Quick Integration (Recommended for Testing)

Replace the OAuth code in `resumes/index.html` with the new backend integration.

#### Step 1: Add Backend URL Configuration

At the very top of the `<script>` section in `resumes/index.html` (around line 1010), add:

```javascript
// Backend API URL - UPDATE THIS with your deployed backend URL
window.BACKEND_API_URL = 'https://your-backend-url.vercel.app';
```

#### Step 2: Include the Backend OAuth Script

Add this line before the closing `</body>` tag in `resumes/index.html`:

```html
<script src="../js/github-oauth-backend.js"></script>
```

#### Step 3: Comment Out or Remove Device Flow Code

In `resumes/index.html`, find the section starting with:
```javascript
// GitHub OAuth and File Editor Functionality
```

Comment out or remove the entire Device Flow implementation (lines approximately 1011-1493).

**OR** simply rename the functions to avoid conflicts:
- `handleAuth()` → `handleAuthDeviceFlow()`
- `handleLogout()` → `handleLogoutDeviceFlow()`
- `loadFileContents()` → `loadFileContentsDeviceFlow()`
- `saveFile()` → `saveFileDeviceFlow()`

### Option 2: Complete Migration (Production Ready)

Create a completely new version of `resumes/index.html` with backend integration.

This approach involves:
1. Removing all Device Flow code
2. Integrating the backend OAuth code directly
3. Updating all API calls to use backend endpoints

## Detailed Integration Steps

### 1. Update Authentication Initialization

**Old Code (Device Flow)**:
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    checkStoredAuth(); // Uses localStorage
    await loadFileContents();
});

function checkStoredAuth() {
    accessToken = localStorage.getItem('github_access_token');
    userInfo = JSON.parse(localStorage.getItem('github_user_info') || 'null');
    
    if (accessToken && userInfo) {
        verifyToken().then(valid => {
            if (valid) {
                updateAuthUI(true);
            } else {
                handleLogout();
            }
        });
    }
}
```

**New Code (Backend API)**:
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus(); // Checks session with backend
    await loadFileContents();
});

async function checkAuthStatus() {
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/auth/status`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            isAuthenticated = true;
            updateAuthUI(true);
        } else {
            updateAuthUI(false);
        }
        
        return data.authenticated;
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateAuthUI(false);
        return false;
    }
}
```

### 2. Update Login Function

**Old Code (Device Flow)**:
```javascript
async function handleAuth() {
    try {
        // Request device and user codes
        const deviceCodeResponse = await fetch('https://github.com/login/device/code', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                scope: 'repo'
            })
        });
        
        // ... show modal and poll for token
    } catch (error) {
        alert('Authentication failed: ' + error.message);
    }
}
```

**New Code (Backend API)**:
```javascript
async function handleAuth() {
    try {
        // Get GitHub authorization URL from backend
        const response = await fetch(`${BACKEND_API_URL}/api/auth/github`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        // Redirect to GitHub OAuth authorization
        window.location.href = data.authUrl;
        
    } catch (error) {
        console.error('Authentication error:', error);
        alert('Failed to start authentication: ' + error.message);
    }
}
```

### 3. Update Logout Function

**Old Code (Device Flow)**:
```javascript
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        accessToken = null;
        userInfo = null;
        localStorage.removeItem('github_access_token');
        localStorage.removeItem('github_user_info');
        updateAuthUI(false);
        showMessage('Logged out successfully', 'info');
    }
}
```

**New Code (Backend API)**:
```javascript
async function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to logout');
        }
        
        currentUser = null;
        isAuthenticated = false;
        updateAuthUI(false);
        showMessage('Logged out successfully', 'info');
        
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout: ' + error.message);
    }
}
```

### 4. Update File Save Function

**Old Code (Direct GitHub API)**:
```javascript
async function saveFile(fileType) {
    // ... setup code ...
    
    try {
        // Get current file
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        // ... update file ...
    } catch (error) {
        // Handle error
    }
}
```

**New Code (Backend API Proxy)**:
```javascript
async function saveFile(fileType) {
    // ... setup code ...
    
    try {
        // Get current file via backend
        const response = await fetch(
            `${BACKEND_API_URL}/api/github/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`,
            {
                credentials: 'include'
            }
        );
        
        const fileData = await response.json();
        
        // Update file via backend
        const updateResponse = await fetch(
            `${BACKEND_API_URL}/api/github/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    message: `Update ${fileName} via resume editor`,
                    content: btoa(unescape(encodeURIComponent(content))),
                    sha: fileData.sha,
                    branch: GITHUB_BRANCH
                })
            }
        );
        
        // ... handle response ...
    } catch (error) {
        // Handle error
    }
}
```

### 5. Handle OAuth Callback

Add code to handle the OAuth callback redirect:

```javascript
// Check for OAuth callback parameters
const urlParams = new URLSearchParams(window.location.search);
const authStatus = urlParams.get('auth');
const error = urlParams.get('error');

if (authStatus === 'success') {
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    showMessage('Successfully authenticated with GitHub!', 'success');
    // Refresh auth status
    checkAuthStatus();
} else if (error) {
    // Clean URL and show error
    window.history.replaceState({}, document.title, window.location.pathname);
    showMessage(`Authentication failed: ${error}`, 'error');
}
```

## Key Differences

### Device Flow vs Web Application Flow

| Aspect | Device Flow (Old) | Web Application Flow (New) |
|--------|------------------|---------------------------|
| **Authentication** | Shows code, user enters on GitHub | Redirects to GitHub, auto returns |
| **Token Storage** | localStorage (frontend) | Session (backend) |
| **CORS Issues** | Direct API calls may fail | No CORS issues (proxied) |
| **Security** | Client-side token handling | Server-side token handling |
| **User Experience** | Manual code entry | Seamless redirect |

### Important Notes

1. **Always include `credentials: 'include'`** in fetch requests to the backend
2. **Remove all localStorage token handling** - sessions are managed server-side
3. **Update all GitHub API calls** to use backend proxy endpoints
4. **Handle OAuth callback** on page load to show success/error messages
5. **Backend URL must be HTTPS in production** for secure cookies

## Testing Checklist

After integration:

- [ ] Authentication redirects to GitHub correctly
- [ ] OAuth callback returns to resume site with success
- [ ] User info displays after authentication
- [ ] File loading works (SearchSites.md, JobRoles.md, work-history.md)
- [ ] File saving works and commits to GitHub
- [ ] Logout clears session
- [ ] Session persists across page refreshes
- [ ] No CORS errors in browser console
- [ ] Authentication state is checked on page load

## Troubleshooting

### "credentials: 'include' not working"

**Cause**: CORS misconfiguration or mixed HTTP/HTTPS

**Solution**:
1. Ensure backend has `credentials: true` in CORS config
2. Use HTTPS for both frontend and backend in production
3. Check that `FRONTEND_URL` in backend matches exactly

### "Session not persisting"

**Cause**: Cookies not being sent or stored

**Solution**:
1. Check browser cookie settings
2. Ensure `credentials: 'include'` in all fetch requests
3. Verify `sameSite` cookie setting in backend
4. Use HTTPS in production

### "404 on API calls"

**Cause**: Wrong backend URL or endpoint path

**Solution**:
1. Verify `BACKEND_API_URL` is correct
2. Check that backend is deployed and running
3. Test backend health endpoint: `https://your-backend.com/health`

## Rollback Plan

If issues occur after integration:

1. **Quick Rollback**: Comment out the new backend integration script and uncomment Device Flow code
2. **Full Rollback**: Revert changes to `resumes/index.html`
3. **Keep Backend Running**: Backend can coexist with Device Flow for testing

## Next Steps

After successful integration:

1. Test all functionality thoroughly
2. Update documentation
3. Deploy frontend changes to GitHub Pages
4. Monitor for errors
5. Collect user feedback
6. Eventually remove Device Flow code completely

## Support

For issues with frontend integration:
- Check browser console for errors
- Test backend endpoints with curl or Postman
- Review server logs for API errors
- Verify all environment variables are set correctly

---

**Remember**: The backend server must be deployed and running before the frontend integration will work!
