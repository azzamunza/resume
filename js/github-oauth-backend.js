/**
 * GitHub OAuth Backend Integration
 * Uses backend server for OAuth Web Application Flow
 * Replaces Device Flow implementation to resolve CORS issues
 */

// Configuration - UPDATE THIS with your deployed backend URL
const BACKEND_API_URL = window.BACKEND_API_URL || 'http://localhost:3000';
const GITHUB_REPO_OWNER = 'azzamunza';
const GITHUB_REPO_NAME = 'resume';
const GITHUB_BRANCH = 'main';

let currentUser = null;
let isAuthenticated = false;

/**
 * Initialize authentication on page load
 */
async function initAuth() {
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const error = urlParams.get('error');
    
    if (authStatus === 'success') {
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        showMessage('Successfully authenticated with GitHub!', 'success');
    } else if (error) {
        // Clean URL and show error
        window.history.replaceState({}, document.title, window.location.pathname);
        showMessage(`Authentication failed: ${error}`, 'error');
    }
    
    // Check current authentication status
    await checkAuthStatus();
}

/**
 * Check authentication status with backend
 */
async function checkAuthStatus() {
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/auth/status`, {
            credentials: 'include' // Important: include cookies
        });
        
        if (!response.ok) {
            throw new Error('Failed to check auth status');
        }
        
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            isAuthenticated = true;
            updateAuthUI(true);
        } else {
            currentUser = null;
            isAuthenticated = false;
            updateAuthUI(false);
        }
        
        return data.authenticated;
    } catch (error) {
        console.error('Error checking auth status:', error);
        isAuthenticated = false;
        updateAuthUI(false);
        return false;
    }
}

/**
 * Initiate GitHub OAuth login
 */
async function handleAuth() {
    try {
        // Get GitHub authorization URL from backend
        const response = await fetch(`${BACKEND_API_URL}/api/auth/github`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to initiate authentication');
        }
        
        const data = await response.json();
        
        // Redirect to GitHub OAuth authorization
        window.location.href = data.authUrl;
        
    } catch (error) {
        console.error('Authentication error:', error);
        showMessage('Failed to start authentication: ' + error.message, 'error');
    }
}

/**
 * Logout
 */
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
        showMessage('Failed to logout: ' + error.message, 'error');
    }
}

/**
 * Update authentication UI
 */
function updateAuthUI(authenticated) {
    const authStatus = document.getElementById('auth-status');
    const authButton = document.getElementById('auth-button');
    const logoutButton = document.getElementById('logout-button');
    const userInfoDiv = document.getElementById('user-info');
    const saveButtons = document.querySelectorAll('[id^="save-"]');
    
    if (authenticated && currentUser) {
        authStatus.textContent = 'Authenticated';
        authStatus.className = 'status-indicator status-authenticated';
        authButton.style.display = 'none';
        logoutButton.style.display = 'inline-block';
        userInfoDiv.innerHTML = `Logged in as: <strong>${currentUser.login}</strong>${currentUser.name ? ` (${currentUser.name})` : ''}`;
        
        // Enable save buttons
        saveButtons.forEach(btn => btn.disabled = false);
    } else {
        authStatus.textContent = 'Not Authenticated';
        authStatus.className = 'status-indicator status-not-authenticated';
        authButton.style.display = 'inline-block';
        logoutButton.style.display = 'none';
        userInfoDiv.innerHTML = '';
        
        // Disable save buttons
        saveButtons.forEach(btn => btn.disabled = true);
    }
}

/**
 * Load file contents from GitHub (public access, no auth needed)
 */
async function loadFileContents() {
    try {
        // Load SearchSites.md
        const searchSitesResponse = await fetch(
            `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/data/SearchSites.md`
        );
        if (searchSitesResponse.ok) {
            const searchSitesContent = await searchSitesResponse.text();
            document.getElementById('searchsites-editor').value = searchSitesContent;
        } else {
            document.getElementById('searchsites-editor').value = '# Error loading file\n\nCould not load SearchSites.md';
        }
        
        // Load JobRoles.md
        const jobRolesResponse = await fetch(
            `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/data/JobRoles.md`
        );
        if (jobRolesResponse.ok) {
            const jobRolesContent = await jobRolesResponse.text();
            document.getElementById('jobroles-editor').value = jobRolesContent;
        } else {
            document.getElementById('jobroles-editor').value = '# Error loading file\n\nCould not load JobRoles.md';
        }

        // Load work-history.md
        const workHistoryResponse = await fetch(
            `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/data/work-history.md`
        );
        if (workHistoryResponse.ok) {
            const workHistoryContent = await workHistoryResponse.text();
            document.getElementById('workhistory-editor').value = workHistoryContent;
        } else {
            document.getElementById('workhistory-editor').value = '# Error loading file\n\nCould not load work-history.md';
        }
    } catch (error) {
        console.error('Error loading files:', error);
        showMessage('Error loading files from GitHub', 'error');
    }
}

/**
 * Save file to GitHub via backend API
 */
async function saveFile(fileType) {
    if (!isAuthenticated) {
        showMessage('Please authenticate with GitHub first', 'error');
        return;
    }
    
    let fileName, filePath, editorId, statusId, saveButtonId;
    
    if (fileType === 'SearchSites') {
        fileName = 'SearchSites.md';
        filePath = 'data/SearchSites.md';
        editorId = 'searchsites-editor';
        statusId = 'searchsites-status';
        saveButtonId = 'save-searchsites';
    } else if (fileType === 'JobRoles') {
        fileName = 'JobRoles.md';
        filePath = 'data/JobRoles.md';
        editorId = 'jobroles-editor';
        statusId = 'jobroles-status';
        saveButtonId = 'save-jobroles';
    } else if (fileType === 'WorkHistory') {
        fileName = 'work-history.md';
        filePath = 'data/work-history.md';
        editorId = 'workhistory-editor';
        statusId = 'workhistory-status';
        saveButtonId = 'save-workhistory';
    } else {
        showMessage('Unknown file type', 'error');
        return;
    }
    
    const editor = document.getElementById(editorId);
    const statusSpan = document.getElementById(statusId);
    const saveButton = document.getElementById(saveButtonId);
    
    if (!editor) {
        showMessage('Editor not found', 'error');
        return;
    }
    
    const content = editor.value;
    
    // Update UI to show saving
    if (statusSpan) statusSpan.textContent = 'Saving...';
    if (saveButton) saveButton.disabled = true;
    
    try {
        // First, get the current file to get its SHA
        const getResponse = await fetch(
            `${BACKEND_API_URL}/api/github/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`,
            {
                credentials: 'include'
            }
        );
        
        if (!getResponse.ok) {
            throw new Error('Failed to get current file version');
        }
        
        const fileData = await getResponse.json();
        const currentSha = fileData.sha;
        
        // Now update the file
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
                    content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
                    sha: currentSha,
                    branch: GITHUB_BRANCH
                })
            }
        );
        
        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Failed to save file');
        }
        
        const result = await updateResponse.json();
        
        // Update UI to show success
        if (statusSpan) {
            statusSpan.textContent = 'Saved successfully!';
            setTimeout(() => {
                statusSpan.textContent = '';
            }, 3000);
        }
        
        showMessage(`${fileName} saved successfully!`, 'success');
        
    } catch (error) {
        console.error('Error saving file:', error);
        
        if (statusSpan) {
            statusSpan.textContent = 'Save failed';
            setTimeout(() => {
                statusSpan.textContent = '';
            }, 3000);
        }
        
        showMessage(`Failed to save ${fileName}: ${error.message}`, 'error');
    } finally {
        // Re-enable save button
        if (saveButton) saveButton.disabled = false;
    }
}

/**
 * Show message to user
 */
function showMessage(message, type = 'info') {
    // Try to use existing message system if available
    if (typeof window.showMessage === 'function') {
        window.showMessage(message, type);
        return;
    }
    
    // Fallback: Create a simple alert
    const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : 'ℹ️ ';
    alert(prefix + message);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

// Also load file contents on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFileContents);
} else {
    loadFileContents();
}
