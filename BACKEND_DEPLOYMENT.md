# Backend Server Deployment Guide

This guide explains how to deploy the OAuth backend server that handles GitHub authentication and resolves CORS issues.

## Overview

The backend server is required to:
- Handle GitHub OAuth Web Application Flow securely
- Store access tokens server-side (never exposed to frontend)
- Proxy GitHub API requests to avoid CORS issues
- Manage user sessions securely

## Prerequisites

1. **GitHub OAuth App** - Create one at https://github.com/settings/developers
2. **Node.js** >= 14.0.0
3. **Hosting Platform** - Choose one:
   - Vercel (recommended for quick setup)
   - Heroku
   - Railway
   - Any Node.js hosting service

## Step 1: Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `Resume OAuth Server` (or your choice)
   - **Homepage URL**: `https://azzamunza.github.io/resume`
   - **Authorization callback URL**: 
     - You'll update this after deploying the server
     - Format: `https://your-server-url.com/api/auth/callback`
4. Click "Register application"
5. **Save the Client ID and generate a Client Secret** (you'll need these)

⚠️ **IMPORTANT**: Keep the Client Secret confidential - never commit it to GitHub!

## Step 2: Deploy Backend Server

### Option A: Vercel (Recommended)

**Why Vercel?**
- Free tier available
- Easy deployment from GitHub
- Automatic HTTPS
- Great for serverless Node.js

**Steps:**

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project root**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked for project settings, accept the detected settings
   - Vercel will give you a deployment URL (e.g., `https://resume-abc123.vercel.app`)

4. **Set Environment Variables in Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add these variables:
     ```
     GITHUB_CLIENT_ID=your_github_oauth_client_id
     GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
     CALLBACK_URL=https://your-vercel-url.vercel.app/api/auth/callback
     FRONTEND_URL=https://azzamunza.github.io
     SESSION_SECRET=generate_random_string_32_chars
     NODE_ENV=production
     ```

5. **Redeploy after setting environment variables**:
   ```bash
   vercel --prod
   ```

6. **Update GitHub OAuth App**:
   - Go back to your GitHub OAuth App settings
   - Update **Authorization callback URL** to: `https://your-vercel-url.vercel.app/api/auth/callback`

### Option B: Heroku

**Why Heroku?**
- Simple deployment process
- Free tier available (with credit card)
- Good for persistent servers

**Steps:**

1. **Install Heroku CLI**:
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create a new Heroku app**:
   ```bash
   heroku create your-resume-oauth-server
   ```
   - This creates an app at `https://your-resume-oauth-server.herokuapp.com`

4. **Set environment variables**:
   ```bash
   heroku config:set GITHUB_CLIENT_ID=your_github_client_id
   heroku config:set GITHUB_CLIENT_SECRET=your_github_client_secret
   heroku config:set CALLBACK_URL=https://your-resume-oauth-server.herokuapp.com/api/auth/callback
   heroku config:set FRONTEND_URL=https://azzamunza.github.io
   heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

6. **Verify deployment**:
   ```bash
   heroku open /health
   ```
   - Should show: `{"status":"ok","timestamp":"..."}`

7. **Update GitHub OAuth App**:
   - Go back to your GitHub OAuth App settings
   - Update **Authorization callback URL** to: `https://your-resume-oauth-server.herokuapp.com/api/auth/callback`

### Option C: Railway

**Why Railway?**
- Modern platform with great DX
- Free tier with generous limits
- Easy GitHub integration

**Steps:**

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and create project**:
   ```bash
   railway login
   railway init
   ```

3. **Set environment variables** (in Railway dashboard):
   - Go to https://railway.app
   - Select your project
   - Go to Variables tab
   - Add all environment variables from `.env.example`

4. **Deploy**:
   ```bash
   railway up
   ```

5. **Get deployment URL**:
   ```bash
   railway domain
   ```

6. **Update GitHub OAuth App** with Railway URL

## Step 3: Update Frontend

After deploying the backend, update the frontend to use the backend API.

### Update `resumes/index.html`

Find the constants at the top of the script section and update:

```javascript
// Old (Device Flow)
const GITHUB_CLIENT_ID = 'your_github_client_id';
const GITHUB_REPO_OWNER = 'azzamunza';
const GITHUB_REPO_NAME = 'resume';
const GITHUB_BRANCH = 'main';

// New (Backend API)
const BACKEND_API_URL = 'https://your-server-url.vercel.app'; // Your deployed backend URL
const GITHUB_REPO_OWNER = 'azzamunza';
const GITHUB_REPO_NAME = 'resume';
const GITHUB_BRANCH = 'main';
```

The frontend code will need to be updated to use backend endpoints. This is covered in the main implementation.

## Step 4: Test the Integration

1. **Test server health**:
   ```bash
   curl https://your-server-url.vercel.app/health
   ```
   Expected: `{"status":"ok","timestamp":"..."}`

2. **Test OAuth flow**:
   - Visit your GitHub Pages site: `https://azzamunza.github.io/resume/resumes/index.html`
   - Click "Login with GitHub"
   - Should redirect to GitHub
   - Authorize the application
   - Should redirect back to your site with success

3. **Test file operations**:
   - After authentication, try editing and saving a file
   - Changes should be committed to the repository

## Troubleshooting

### CORS Errors

**Symptom**: Browser console shows CORS errors

**Solutions**:
1. Verify `FRONTEND_URL` environment variable matches your GitHub Pages URL exactly
2. Ensure browser is sending credentials (cookies) with requests
3. Check that server CORS settings include `credentials: true`

### Authentication Fails

**Symptom**: OAuth redirect fails or returns error

**Solutions**:
1. Verify GitHub OAuth App callback URL matches `CALLBACK_URL` environment variable
2. Check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
3. Look at server logs for specific error messages
4. Ensure GitHub OAuth App is not suspended

### Session Issues

**Symptom**: User gets logged out immediately or session not persisting

**Solutions**:
1. Ensure cookies are enabled in browser
2. Verify `SESSION_SECRET` is set
3. In production, ensure `NODE_ENV=production` is set
4. Check that HTTPS is being used (required for secure cookies in production)

### Vercel Deployment Issues

**Symptom**: Deployment fails or server doesn't start

**Solutions**:
1. Verify `vercel.json` is in the repository root
2. Check build logs in Vercel dashboard
3. Ensure all dependencies are in `server/package.json`
4. Try redeploying with `vercel --prod`

### Heroku Deployment Issues

**Symptom**: App crashes or doesn't start

**Solutions**:
1. Check logs: `heroku logs --tail`
2. Verify `Procfile` is in the repository root
3. Ensure environment variables are set: `heroku config`
4. Check that port binding is correct (Heroku sets PORT automatically)

## Security Best Practices

1. **Use HTTPS**: Always use HTTPS in production
2. **Strong SESSION_SECRET**: Generate random 32+ character strings
3. **Environment Variables**: Never commit `.env` file to Git
4. **Rotate Secrets**: Periodically regenerate GitHub Client Secret
5. **Monitor Access**: Check server logs for unauthorized access attempts
6. **Rate Limiting**: Consider adding rate limiting for production
7. **Input Validation**: Server validates all inputs
8. **CSRF Protection**: State parameter prevents CSRF attacks

## Monitoring and Maintenance

### Logs

**Vercel**:
```bash
vercel logs
```

**Heroku**:
```bash
heroku logs --tail
```

**Railway**:
```bash
railway logs
```

### Health Checks

Set up monitoring to ping `/health` endpoint:
- Use UptimeRobot (free)
- Use Pingdom
- Use your hosting platform's monitoring

### Updates

To update the backend:

1. Make changes to `server/index.js`
2. Commit changes
3. Deploy:
   - **Vercel**: `vercel --prod`
   - **Heroku**: `git push heroku main`
   - **Railway**: `railway up`

## Cost Estimates

### Free Tier Limits

**Vercel**:
- Unlimited deployments
- 100GB bandwidth/month
- Serverless function invocations included

**Heroku**:
- 550-1000 dyno hours/month (free)
- Must provide credit card
- Sleeps after 30 min inactivity

**Railway**:
- $5 free credit/month
- Pay for what you use after credit

### Typical Usage

For personal resume site with occasional edits:
- **All platforms**: Should stay within free tier
- **Bandwidth**: Minimal (API calls only)
- **Compute**: Low (OAuth + file operations)

## Alternative: Serverless Functions

If you prefer not to run a persistent server, you can deploy as serverless functions:

### Vercel Serverless

Already configured! The `vercel.json` file sets up serverless deployment automatically.

### Netlify Functions

Create `netlify/functions/` directory and split server code into function files.

### AWS Lambda

Package server code for Lambda and use API Gateway.

## Support

If you encounter issues:

1. Check this documentation
2. Review server logs
3. Check GitHub OAuth App settings
4. Verify environment variables
5. Test with curl commands
6. Open an issue in the repository

## Next Steps

After successful deployment:

1. ✅ Backend server is running
2. ✅ GitHub OAuth App is configured
3. ✅ Environment variables are set
4. → Update frontend to use backend API (see main implementation)
5. → Test full authentication flow
6. → Deploy frontend changes to GitHub Pages

---

## Environment Variable Validation

Before going to production, validate your environment variables are correctly set:

### Validation Script

Create a test script to verify your deployment:

```bash
#!/bin/bash
# test-backend.sh - Validate backend deployment

BACKEND_URL="${1:-https://your-backend-url.vercel.app}"

echo "Testing backend at: $BACKEND_URL"
echo ""

# Test 1: Health Check
echo "1. Testing /health endpoint..."
HEALTH=$(curl -s "$BACKEND_URL/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo "   ✅ Health check passed"
else
    echo "   ❌ Health check failed"
    echo "   Response: $HEALTH"
fi
echo ""

# Test 2: Auth Endpoint
echo "2. Testing /api/auth/github endpoint..."
AUTH=$(curl -s "$BACKEND_URL/api/auth/github")
if echo "$AUTH" | grep -q "authUrl"; then
    echo "   ✅ Auth endpoint responding"
else
    echo "   ❌ Auth endpoint failed"
    echo "   Response: $AUTH"
fi
echo ""

# Test 3: CORS Headers
echo "3. Testing CORS configuration..."
CORS=$(curl -s -I -X OPTIONS \
  -H "Origin: https://azzamunza.github.io" \
  -H "Access-Control-Request-Method: GET" \
  "$BACKEND_URL/api/auth/status")
if echo "$CORS" | grep -q "access-control-allow-origin"; then
    echo "   ✅ CORS headers present"
else
    echo "   ⚠️  CORS headers not found (may need authentication)"
fi
echo ""

echo "Validation complete!"
```

### Manual Validation Checklist

Verify each environment variable is set correctly:

```bash
# For Vercel
vercel env ls

# For Heroku
heroku config

# For Railway
railway variables
```

**Required Variables Checklist:**
- [ ] `GITHUB_CLIENT_ID` - Should start with `Ov23` or similar
- [ ] `GITHUB_CLIENT_SECRET` - Should be 40 characters
- [ ] `CALLBACK_URL` - Should match your backend URL + `/api/auth/callback`
- [ ] `FRONTEND_URL` - Should match `https://azzamunza.github.io` exactly
- [ ] `SESSION_SECRET` - Should be at least 32 characters
- [ ] `NODE_ENV` - Should be `production`

## Practical Examples

### Example 1: Testing OAuth Flow with curl

```bash
# Step 1: Get authorization URL
curl https://your-backend-url.vercel.app/api/auth/github

# Response:
# {"authUrl":"https://github.com/login/oauth/authorize?client_id=..."}

# Step 2: Visit the authUrl in browser, authorize, and you'll be redirected

# Step 3: After authorization, check auth status
curl -b cookies.txt -c cookies.txt \
  https://your-backend-url.vercel.app/api/auth/status

# Response if authenticated:
# {"authenticated":true,"user":{"login":"username",...}}
```

### Example 2: Environment Variable Templates

#### Development (.env.development)
```env
GITHUB_CLIENT_ID=Ov23li...
GITHUB_CLIENT_SECRET=your_dev_secret
CALLBACK_URL=http://localhost:3000/api/auth/callback
FRONTEND_URL=http://localhost:8000
SESSION_SECRET=dev-secret-at-least-32-characters-long
PORT=3000
NODE_ENV=development
```

#### Production (.env.production - DO NOT COMMIT)
```env
GITHUB_CLIENT_ID=Ov23li...
GITHUB_CLIENT_SECRET=your_prod_secret
CALLBACK_URL=https://your-app.vercel.app/api/auth/callback
FRONTEND_URL=https://azzamunza.github.io
SESSION_SECRET=strong-random-production-secret-at-least-32-chars
NODE_ENV=production
```

### Example 3: Testing GitHub API Proxy

```bash
# After authentication with cookies saved
curl -b cookies.txt \
  https://your-backend-url.vercel.app/api/github/user

# Expected response:
# {"login":"username","name":"Your Name",...}

# Get repository info
curl -b cookies.txt \
  https://your-backend-url.vercel.app/api/github/repos/azzamunza/resume

# Get file contents
curl -b cookies.txt \
  "https://your-backend-url.vercel.app/api/github/repos/azzamunza/resume/contents/data/SearchSites.md"
```

## CI/CD Integration

### Automated Deployment with GitHub Actions

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'server/**'
      - 'vercel.json'
      - 'Procfile'

jobs:
  deploy-vercel:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-heroku:
    runs-on: ubuntu-latest
    if: false  # Enable if using Heroku
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.14
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

### Required GitHub Secrets

For Vercel deployment, add these secrets to your GitHub repository:
- `VERCEL_TOKEN` - Get from Vercel account settings
- `VERCEL_ORG_ID` - Found in Vercel project settings
- `VERCEL_PROJECT_ID` - Found in Vercel project settings

For Heroku deployment:
- `HEROKU_API_KEY` - From Heroku account settings
- `HEROKU_APP_NAME` - Your Heroku app name
- `HEROKU_EMAIL` - Your Heroku account email

## Performance Optimization

### 1. Enable Compression

To enable compression for better performance, add this to your `server/index.js`:

```javascript
// Add compression middleware
const compression = require('compression');
app.use(compression());

// Then install the package:
// npm install compression
```

### 2. Session Store Optimization

For production with high traffic, use a persistent session store:

```bash
npm install connect-redis redis
```

```javascript
// server/index.js - Add Redis session store
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
```

### 3. Rate Limiting

Protect your API from abuse:

```bash
npm install express-rate-limit
```

```javascript
// server/index.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Caching Strategy

Add caching headers for static responses:

```javascript
// Cache health check for 1 minute
app.get('/health', (req, res) => {
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### 5. Connection Pooling

For high-traffic applications, configure connection pooling:

```javascript
// Use node-fetch with keep-alive
const fetch = require('node-fetch');
const http = require('http');
const https = require('https');

const httpAgent = new http.Agent({
    keepAlive: true,
    maxSockets: 50
});

const httpsAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 50
});

// Use in GitHub API calls
const response = await fetch(githubApiUrl, {
    agent: githubApiUrl.startsWith('https') ? httpsAgent : httpAgent
});
```

## Scaling Considerations

### Horizontal Scaling

**Vercel**: Automatically scales with serverless functions
- No configuration needed
- Handles traffic spikes automatically
- Each request gets its own isolated execution

**Heroku**: Add more dynos for horizontal scaling
```bash
heroku ps:scale web=2
```

**Railway**: Auto-scales based on traffic
- Configure in Railway dashboard
- Set minimum and maximum instances

### Vertical Scaling

**Heroku**: Upgrade dyno type
```bash
heroku ps:type web=standard-2x
```

**Railway**: Adjust resources in dashboard
- Increase memory allocation
- Increase CPU allocation

### Load Balancing

For high-availability deployments:

1. **Multi-region deployment**
   - Deploy to multiple regions
   - Use DNS-based routing (e.g., Cloudflare)

2. **CDN integration**
   - Use Vercel's built-in CDN
   - Or add Cloudflare in front of Heroku/Railway

3. **Health check endpoints**
   - Ensure `/health` endpoint is fast
   - Return appropriate HTTP status codes
   - Monitor response times

## Backup and Disaster Recovery

### Session Data Backup

If using Redis for sessions:

```bash
# Backup Redis data
redis-cli --rdb /backup/dump.rdb

# Restore Redis data
# Copy the dump.rdb file to Redis data directory, then restart Redis
cp /backup/dump.rdb /var/lib/redis/dump.rdb
# Or restore with redis-cli
redis-cli < /backup/redis-backup.aof
```

### Configuration Backup

**Backup environment variables:**

```bash
# Vercel
vercel env pull .env.backup

# Heroku
heroku config -s > .env.backup

# Railway
railway variables > .env.backup
```

⚠️ **IMPORTANT**: Store these backups securely, they contain secrets!

### Disaster Recovery Plan

1. **Backend Server Down**
   - Frontend falls back to Device Flow (if still configured)
   - Users can still view content
   - Edit functionality temporarily unavailable

2. **Database/Session Store Down**
   - Users need to re-authenticate
   - No data loss (stateless authentication)
   - Session tokens can be regenerated

3. **GitHub OAuth App Issues**
   - Create new OAuth App
   - Update environment variables
   - Redeploy backend
   - Users need to re-authorize

4. **Complete Service Failure**
   - Deploy to alternative platform
   - Update DNS/frontend configuration
   - Restore environment variables from backup
   - Test thoroughly before directing traffic

### Rollback Strategy

**Quick Rollback (Vercel)**:
```bash
vercel rollback
```

**Quick Rollback (Heroku)**:
```bash
heroku releases:rollback v123
```

**Manual Rollback**:
```bash
git revert HEAD
git push origin main
# Trigger redeployment
```

## Quick Reference Cheat Sheet

### Essential Commands

```bash
# Vercel
vercel                     # Deploy to preview
vercel --prod             # Deploy to production
vercel logs               # View logs
vercel env ls             # List environment variables
vercel rollback           # Rollback deployment

# Heroku
heroku logs --tail        # Stream logs
heroku restart            # Restart server
heroku ps                 # Check status
heroku config             # View environment variables
heroku releases           # View deployment history

# Railway
railway logs              # View logs
railway up                # Deploy
railway status            # Check status
railway variables         # List environment variables
```

### Testing Endpoints

```bash
# Health check
curl https://your-backend/health

# Auth status (requires authentication)
curl -b cookies.txt https://your-backend/api/auth/status

# Get user info (requires authentication)
curl -b cookies.txt https://your-backend/api/github/user

# Logout
curl -X POST -b cookies.txt https://your-backend/api/auth/logout
```

### Environment Variables Quick Setup

```bash
# Generate session secret
openssl rand -base64 32

# Set all variables at once (Heroku)
# Filter out comments and empty lines
heroku config:set $(cat .env | grep -v '^#' | grep -v '^$' | xargs)

# Test specific variable
echo $GITHUB_CLIENT_ID
```

## Frequently Asked Questions

### Q: Can I use a different OAuth provider?

A: The current implementation is GitHub-specific, but the architecture can be adapted for other OAuth providers (GitLab, Bitbucket, etc.) by modifying the OAuth endpoints in `server/index.js`.

### Q: How long do sessions last?

A: Sessions expire after 24 hours by default. Users need to re-authenticate after that period. You can adjust this in the session configuration.

### Q: Can I deploy to multiple environments?

A: Yes! Deploy separate instances for development, staging, and production. Use different GitHub OAuth Apps for each environment.

### Q: What happens if my backend is down?

A: The frontend won't be able to authenticate or save files. Consider implementing a fallback to Device Flow or showing a maintenance message.

### Q: How much does it cost to run?

A: For personal use, free tiers are usually sufficient:
- Vercel: Free with generous limits
- Heroku: Free tier available (with credit card)
- Railway: $5 free credit/month

### Q: Can I use a custom domain?

A: Yes! All platforms support custom domains:
- Vercel: Add domain in dashboard, update DNS
- Heroku: `heroku domains:add your-domain.com`
- Railway: Add custom domain in project settings

### Q: How do I rotate secrets?

A: 
1. Generate new CLIENT_SECRET in GitHub OAuth App
2. Update environment variable in your platform
3. Redeploy (or restart if no code changes needed)
4. Old sessions will be invalidated

### Q: Can I see who's authenticated?

A: Check your server logs. Each authentication logs the user's GitHub username. For more detailed analytics, integrate a logging service.

### Q: What about GDPR/privacy compliance?

A: The backend stores minimal data (session IDs and OAuth tokens). Sessions expire after 24 hours. No personal data is permanently stored. Review your specific requirements and add appropriate privacy policy.

### Q: Can I use this with a private repository?

A: Yes! The OAuth App requests `repo` scope which includes private repository access. Just ensure the authenticating user has access to the private repository.

### Q: How do I update the backend code?

A:
1. Make changes to `server/index.js`
2. Test locally
3. Commit changes
4. Deploy: `vercel --prod` or `git push heroku main`
5. Monitor logs for any issues

### Q: Can I add more API endpoints?

A: Absolutely! Add new routes in `server/index.js`. Use the `requireAuth` middleware for protected endpoints. See examples in the server README.

### Q: What about webhooks?

A: You can add webhook endpoints to your backend. See GitHub Webhooks documentation and add routes like:
```javascript
app.post('/api/webhooks/github', (req, res) => {
    // Handle webhook
});
```

## Additional Resources

### Documentation
- [Express.js Documentation](https://expressjs.com/)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Vercel Documentation](https://vercel.com/docs)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Railway Documentation](https://docs.railway.app/)

### Security
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)

### Monitoring Tools
- [UptimeRobot](https://uptimerobot.com/) - Free uptime monitoring
- [Sentry](https://sentry.io/) - Error tracking
- [LogRocket](https://logrocket.com/) - Session replay and monitoring
- [Datadog](https://www.datadoghq.com/) - Application performance monitoring

### Community
- [GitHub Discussions](https://github.com/azzamunza/resume/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/github-oauth)

---

For detailed API documentation, see `server/README.md`.

**Document Version**: 2.0  
**Last Updated**: December 2024  
**Maintained By**: Aaron Munro (azzamunza@gmail.com)
