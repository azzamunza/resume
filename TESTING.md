# Testing Guide for GitHub OAuth Integration

This document provides testing instructions for the new GitHub OAuth Device Flow authentication feature.

## What Was Changed

The website previously required users to manually create and paste GitHub Personal Access Tokens. This has been replaced with a streamlined OAuth Device Flow that provides:

- One-click authentication with GitHub
- Guided authentication process
- No manual token management
- Better security

## Prerequisites for Testing

1. Access to the repository: `https://github.com/azzamunza/resume`
2. A GitHub account with write access to the repository
3. A modern web browser (Chrome, Firefox, Safari, or Edge)
4. The website deployed to GitHub Pages or a local server

## Test Scenarios

### Test 1: First-Time Authentication

**Goal**: Verify that a new user can authenticate successfully.

**Steps**:
1. Open the website in a browser
2. Navigate to the "Job Search Config" tab
3. Verify the authentication status shows "Not Authenticated" (orange badge)
4. Click the "Login with GitHub" button
5. Verify a modal appears with:
   - A verification code (8 characters)
   - A "Copy Code" button
   - An "Open GitHub to Authorize" button
   - Animated loading indicator
   - A "Cancel" button
6. Click "Copy Code" and verify the code is copied to clipboard
7. Click "Open GitHub to Authorize"
8. Verify a new tab opens to https://github.com/login/device
9. Paste the verification code and click "Continue"
10. Review the permissions and click "Authorize"
11. Return to the original tab
12. Verify the modal automatically closes (within 5-10 seconds)
13. Verify the authentication status changes to "Authenticated" (green badge)
14. Verify the user info is displayed (e.g., "Logged in as: username")
15. Verify all "Save to GitHub" buttons are now enabled

**Expected Results**: 
- ✅ Authentication completes successfully
- ✅ Modal closes automatically
- ✅ Save buttons become enabled
- ✅ User information is displayed

### Test 2: Page Reload with Stored Token

**Goal**: Verify that authentication persists across page reloads.

**Steps**:
1. Complete Test 1 first (authenticate successfully)
2. Reload the page (Ctrl+R or Cmd+R)
3. Navigate to the "Job Search Config" tab
4. Verify the authentication status shows "Authenticated" immediately
5. Verify the user info is still displayed
6. Verify all "Save to GitHub" buttons are enabled

**Expected Results**:
- ✅ Authentication state is restored from localStorage
- ✅ No need to authenticate again
- ✅ Save buttons are enabled immediately

### Test 3: Cancelling Authentication

**Goal**: Verify that users can cancel the authentication flow.

**Steps**:
1. Navigate to the "Job Search Config" tab
2. If authenticated, click "Logout" first
3. Click "Login with GitHub"
4. Verify the modal appears with the verification code
5. Click the "Cancel" button
6. Verify the modal closes
7. Verify the authentication status remains "Not Authenticated"
8. Verify the "Save to GitHub" buttons remain disabled

**Expected Results**:
- ✅ Modal closes when Cancel is clicked
- ✅ Authentication does not complete
- ✅ Save buttons remain disabled

### Test 4: Logout

**Goal**: Verify that users can logout and clear their authentication.

**Steps**:
1. Complete Test 1 first (authenticate successfully)
2. Verify the "Logout" button is visible (red button)
3. Click the "Logout" button
4. Verify a confirmation dialog appears
5. Click "OK" to confirm
6. Verify the authentication status changes to "Not Authenticated"
7. Verify the user info is cleared
8. Verify all "Save to GitHub" buttons are disabled
9. Reload the page
10. Verify the authentication is still cleared (not restored)

**Expected Results**:
- ✅ Logout clears the authentication
- ✅ Tokens are removed from localStorage
- ✅ Save buttons are disabled
- ✅ Authentication doesn't persist after logout

### Test 5: Save File to GitHub

**Goal**: Verify that authenticated users can save files successfully.

**Steps**:
1. Complete Test 1 first (authenticate successfully)
2. Navigate to the "Job Search Config" tab
3. Verify the SearchSites.md and JobRoles.md files are loaded
4. Make a small change to SearchSites.md (e.g., add a comment line)
5. Click the "Save to GitHub" button for SearchSites.md
6. Verify the button shows "Saving..." briefly
7. Verify a success message appears: "Saved successfully! ✓"
8. Open GitHub and navigate to `data/SearchSites.md`
9. Verify the changes are committed to the repository
10. Verify the commit message is: "Update SearchSites.md via web editor"

**Expected Results**:
- ✅ File saves successfully
- ✅ Success message is displayed
- ✅ Changes appear on GitHub
- ✅ Commit message is correct

### Test 6: Work History Tab

**Goal**: Verify that authentication works across all tabs.

**Steps**:
1. Navigate to the "Job Search Config" tab
2. Authenticate (if not already authenticated)
3. Navigate to the "Work History" tab
4. Verify the work-history.md file is loaded
5. Verify the "Save to GitHub" button is enabled (not disabled)
6. Make a small change to the work-history.md content
7. Click "Save to GitHub"
8. Verify the file saves successfully

**Expected Results**:
- ✅ Authentication state is shared across tabs
- ✅ Save button is enabled on Work History tab
- ✅ File can be saved from Work History tab

### Test 7: Invalid Token Recovery

**Goal**: Verify that expired/invalid tokens are handled gracefully.

**Steps**:
1. Complete Test 1 first (authenticate successfully)
2. Open browser Developer Tools (F12)
3. Go to Application/Storage > Local Storage
4. Find `github_access_token`
5. Manually edit the token value to make it invalid (e.g., change a few characters)
6. Reload the page
7. Verify the authentication status shows "Not Authenticated"
8. Verify the save buttons are disabled
9. Authenticate again using Test 1 steps
10. Verify authentication works normally

**Expected Results**:
- ✅ Invalid tokens are detected and cleared
- ✅ User is prompted to authenticate again
- ✅ Re-authentication works normally

### Test 8: Multiple Browser Tabs

**Goal**: Verify behavior with multiple tabs open.

**Steps**:
1. Open the website in Tab 1
2. Navigate to "Job Search Config" and authenticate
3. Open the same website in Tab 2 (new tab)
4. Navigate to "Job Search Config" in Tab 2
5. Verify Tab 2 also shows "Authenticated" status
6. In Tab 2, click "Logout"
7. Switch back to Tab 1
8. Reload Tab 1
9. Verify Tab 1 now shows "Not Authenticated"

**Expected Results**:
- ✅ Authentication is shared across tabs (via localStorage)
- ✅ Logout in one tab affects all tabs (after reload)

## Error Scenarios to Test

### Network Error During Authentication

**Scenario**: Network fails during device flow polling

**Steps**:
1. Click "Login with GitHub"
2. Immediately disconnect from the internet
3. Verify an error message appears
4. Reconnect to the internet
5. Authenticate again

**Expected**: Graceful error handling with clear error message

### Expired Device Code

**Scenario**: User takes too long to authorize (>15 minutes)

**Steps**:
1. Click "Login with GitHub"
2. Note the verification code but don't authorize immediately
3. Wait 15+ minutes
4. Try to authorize on GitHub
5. Verify an error message appears about expiration

**Expected**: Clear error message, user can try again

### No Repository Access

**Scenario**: User doesn't have access to the repository

**Note**: This scenario requires a GitHub account without access to the repository.

**Steps**:
1. Use a GitHub account without write access to `azzamunza/resume`
2. Complete authentication
3. Verify an error message: "No access to repository..."

**Expected**: Authentication fails with clear error message

## Browser Compatibility

Test the feature in multiple browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Performance Testing

1. **Page Load**: Verify page loads quickly even when checking stored tokens
2. **Modal Display**: Modal should appear instantly when clicking "Login with GitHub"
3. **Polling**: Verify polling happens at appropriate intervals (5+ seconds)
4. **File Loading**: Verify files load from GitHub without blocking the UI

## Security Testing

1. **Token Storage**: Verify tokens are stored in localStorage (not cookies or sessionStorage)
2. **Token Transmission**: Verify tokens are sent over HTTPS only
3. **XSS Protection**: Verify user inputs are properly escaped
4. **CSRF Protection**: OAuth state parameter (not applicable for device flow, but verify no CSRF vulnerabilities)

## Reporting Issues

If you encounter any issues during testing:

1. Open browser Developer Tools (F12)
2. Check the Console tab for error messages
3. Note the exact steps to reproduce
4. Include browser version and operating system
5. Take screenshots if applicable
6. Report to: azzamunza@gmail.com

## Test Checklist

Before marking the feature as complete, verify:

- [ ] All 8 test scenarios pass
- [ ] Error scenarios are handled gracefully
- [ ] Feature works in all major browsers
- [ ] Performance is acceptable
- [ ] Security considerations are addressed
- [ ] Documentation is accurate and complete

## Automated Testing

While this feature is primarily UI-based, future improvements could include:

1. **Unit tests** for authentication logic
2. **Integration tests** using Playwright or Cypress
3. **Mock GitHub API** for testing without real authentication
4. **CI/CD pipeline** to run tests on every commit

For now, manual testing is sufficient given the nature of the feature.
