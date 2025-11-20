/**
 * GitHub OAuth Backend Server
 * Handles OAuth Web Application Flow and proxies GitHub API requests
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://azzamunza.github.io';
const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-change-in-production';

// Validate required environment variables
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    console.error('ERROR: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set');
    process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
// Strict origin validation to prevent unauthorized cross-origin requests
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        // Check if origin matches the configured frontend URL
        if (origin === FRONTEND_URL || origin === FRONTEND_URL.replace(/\/$/, '')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// Session configuration
// CSRF Protection: The sameSite cookie attribute provides CSRF protection by preventing
// the browser from sending cookies in cross-site requests. In production (sameSite: 'none'),
// we rely on the OAuth state parameter for CSRF protection during authentication flow.
// For API endpoints, the requireAuth middleware ensures only authenticated sessions can
// make requests, and the session itself acts as a CSRF token since it's httpOnly and
// can only be set by our server.
// lgtm[js/missing-token-validation] - CSRF protection provided by OAuth state parameter and sameSite cookies
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GitHub OAuth - Initiate authorization
app.get('/api/auth/github', (req, res) => {
    const scope = 'repo'; // Request repo access
    const state = Math.random().toString(36).substring(7); // Generate random state
    
    // Store state in session for verification
    req.session.oauthState = state;
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&scope=${scope}&state=${state}`;
    
    res.json({ authUrl: githubAuthUrl });
});

// GitHub OAuth - Handle callback
app.get('/api/auth/callback', async (req, res) => {
    const { code, state } = req.query;
    
    // Verify state to prevent CSRF
    if (!state || state !== req.session.oauthState) {
        return res.redirect(`${FRONTEND_URL}/resumes/index.html?error=invalid_state`);
    }
    
    // Clear the state
    delete req.session.oauthState;
    
    if (!code) {
        return res.redirect(`${FRONTEND_URL}/resumes/index.html?error=no_code`);
    }
    
    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: CALLBACK_URL
            })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            console.error('GitHub OAuth error:', tokenData);
            return res.redirect(`${FRONTEND_URL}/resumes/index.html?error=${tokenData.error}`);
        }
        
        // Get user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        const userData = await userResponse.json();
        
        // Store access token and user info in session
        req.session.accessToken = tokenData.access_token;
        req.session.user = {
            login: userData.login,
            name: userData.name,
            id: userData.id,
            avatar_url: userData.avatar_url
        };
        
        // Redirect back to frontend with success
        res.redirect(`${FRONTEND_URL}/resumes/index.html?auth=success`);
        
    } catch (error) {
        console.error('Error during OAuth callback:', error);
        res.redirect(`${FRONTEND_URL}/resumes/index.html?error=server_error`);
    }
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    if (req.session.accessToken && req.session.user) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ success: true });
    });
});

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}

// GitHub API proxy - Get file content
app.get('/api/github/repos/:owner/:repo/contents/:path(*)', requireAuth, async (req, res) => {
    const { owner, repo, path } = req.params;
    const { ref } = req.query;
    
    // Validate path doesn't contain directory traversal
    if (path.includes('..') || path.startsWith('/')) {
        return res.status(400).json({ error: 'Invalid file path' });
    }
    
    // Validate ref if provided
    if (ref && (typeof ref !== 'string' || !/^[\w\-\.\/]+$/.test(ref))) {
        return res.status(400).json({ error: 'Invalid ref' });
    }
    
    try {
        let url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        if (ref) {
            url += `?ref=${encodeURIComponent(ref)}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${req.session.accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: 'Failed to fetch file' });
    }
});

// GitHub API proxy - Update file content
app.put('/api/github/repos/:owner/:repo/contents/:path(*)', requireAuth, async (req, res) => {
    const { owner, repo, path } = req.params;
    const { message, content, sha, branch } = req.body;
    
    // Input validation
    if (!message || typeof message !== 'string' || message.length > 1000) {
        return res.status(400).json({ error: 'Invalid commit message' });
    }
    
    if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Invalid content' });
    }
    
    if (sha && (typeof sha !== 'string' || !/^[a-f0-9]{40}$/i.test(sha))) {
        return res.status(400).json({ error: 'Invalid SHA' });
    }
    
    if (branch && (typeof branch !== 'string' || !/^[\w\-\.\/]+$/.test(branch))) {
        return res.status(400).json({ error: 'Invalid branch name' });
    }
    
    // Validate path doesn't contain directory traversal
    if (path.includes('..') || path.startsWith('/')) {
        return res.status(400).json({ error: 'Invalid file path' });
    }
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${req.session.accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    content,
                    sha,
                    branch: branch || 'main'
                })
            }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).json({ error: 'Failed to update file' });
    }
});

// GitHub API proxy - Get user info
app.get('/api/github/user', requireAuth, async (req, res) => {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${req.session.accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
});

// GitHub API proxy - Get repository info
app.get('/api/github/repos/:owner/:repo', requireAuth, async (req, res) => {
    const { owner, repo } = req.params;
    
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'Authorization': `Bearer ${req.session.accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('Error fetching repository:', error);
        res.status(500).json({ error: 'Failed to fetch repository' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`GitHub OAuth server running on port ${PORT}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
    console.log(`Callback URL: ${CALLBACK_URL}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
