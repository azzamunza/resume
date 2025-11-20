# GitHub OAuth Backend Server

This is the backend server for handling GitHub OAuth Web Application Flow and proxying GitHub API requests. It resolves CORS issues and securely manages OAuth tokens.

## Features

- **GitHub OAuth Web Application Flow**: Secure OAuth implementation with server-side token exchange
- **Session Management**: Secure session-based authentication
- **GitHub API Proxy**: Proxies requests to GitHub API with proper authentication
- **CORS Support**: Configured to work with GitHub Pages frontend
- **Security**: Client secret never exposed to frontend

## Prerequisites

- Node.js >= 14.0.0
- GitHub OAuth App (create at https://github.com/settings/developers)

## Setup

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Resume OAuth Server (or your choice)
   - **Homepage URL**: `https://azzamunza.github.io/resume`
   - **Authorization callback URL**: 
     - For local dev: `http://localhost:3000/api/auth/callback`
     - For production: `https://your-server-domain.com/api/auth/callback`
4. Click "Register application"
5. Note the **Client ID** and generate a **Client Secret**

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
CALLBACK_URL=http://localhost:3000/api/auth/callback
FRONTEND_URL=http://localhost:8000
SESSION_SECRET=generate_a_random_string_here
PORT=3000
NODE_ENV=development
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Locally

```bash
npm start
```

The server will start on `http://localhost:3000`.

To test with the frontend:
1. Serve the frontend on another port (e.g., using `python -m http.server 8000` from the repo root)
2. Update `FRONTEND_URL` in `.env` to match
3. Update the frontend code to use `http://localhost:3000` as the API base URL

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add environment variables from `.env.example`
   - Update `CALLBACK_URL` and `FRONTEND_URL` with production URLs

5. Update GitHub OAuth App callback URL with your Vercel URL

### Deploy to Heroku

1. Install Heroku CLI and login:
   ```bash
   heroku login
   ```

2. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

3. Set environment variables:
   ```bash
   heroku config:set GITHUB_CLIENT_ID=your_client_id
   heroku config:set GITHUB_CLIENT_SECRET=your_client_secret
   heroku config:set CALLBACK_URL=https://your-app-name.herokuapp.com/api/auth/callback
   heroku config:set FRONTEND_URL=https://azzamunza.github.io
   heroku config:set SESSION_SECRET=your_random_secret
   heroku config:set NODE_ENV=production
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

5. Update GitHub OAuth App callback URL with your Heroku URL

### Deploy to Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and initialize:
   ```bash
   railway login
   railway init
   ```

3. Add environment variables in Railway dashboard

4. Deploy:
   ```bash
   railway up
   ```

## API Endpoints

### Authentication

- `GET /api/auth/github` - Initiate GitHub OAuth flow
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/status` - Check authentication status
- `POST /api/auth/logout` - Logout and destroy session

### GitHub API Proxy

All endpoints require authentication (session must be established).

- `GET /api/github/user` - Get authenticated user info
- `GET /api/github/repos/:owner/:repo` - Get repository info
- `GET /api/github/repos/:owner/:repo/contents/:path` - Get file contents
- `PUT /api/github/repos/:owner/:repo/contents/:path` - Update file contents

### Health Check

- `GET /health` - Server health check

## Security Considerations

1. **Never commit `.env` file** - It contains secrets
2. **Use strong SESSION_SECRET** - Generate random strings for production
3. **Enable HTTPS in production** - Set `NODE_ENV=production` for secure cookies
4. **Rotate secrets regularly** - Update client secret and session secret periodically
5. **Monitor logs** - Check for unauthorized access attempts
6. **Rate limiting** - Consider adding rate limiting for production

## Troubleshooting

### CORS Errors

- Ensure `FRONTEND_URL` matches your GitHub Pages URL exactly
- Check browser console for specific CORS errors
- Verify Vercel/Heroku deployment settings

### Authentication Fails

- Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- Check GitHub OAuth App callback URL matches `CALLBACK_URL`
- Ensure cookies are enabled in browser
- Check browser console for specific errors

### Session Issues

- Sessions expire after 24 hours
- In development, secure cookies may not work without HTTPS
- Set `NODE_ENV=development` for local testing

## Development

### Project Structure

```
server/
├── index.js           # Main server file
├── package.json       # Dependencies
├── .env.example       # Environment variables template
├── .env              # Environment variables (not in git)
└── README.md         # This file
```

### Adding New Endpoints

To add new GitHub API proxy endpoints:

1. Add route in `index.js`
2. Use `requireAuth` middleware
3. Proxy to GitHub API with `req.session.accessToken`
4. Handle errors appropriately

Example:
```javascript
app.get('/api/github/repos/:owner/:repo/issues', requireAuth, async (req, res) => {
    const { owner, repo } = req.params;
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/issues`,
            {
                headers: {
                    'Authorization': `Bearer ${req.session.accessToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch issues' });
    }
});
```

## License

MIT License - See repository LICENSE file
