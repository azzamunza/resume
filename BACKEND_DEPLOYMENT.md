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
const GITHUB_CLIENT_ID = 'Ov23liDEPGpyLygXjFwY';
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

For detailed API documentation, see `server/README.md`.
