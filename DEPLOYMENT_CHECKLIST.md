# Deployment Checklist

Use this checklist to deploy the GitHub OAuth backend server and integrate it with your frontend.

## Pre-Deployment

- [ ] Review `QUICKSTART.md` for overview
- [ ] Review `BACKEND_DEPLOYMENT.md` for detailed instructions
- [ ] Choose deployment platform (Vercel/Heroku/Railway)
- [ ] Have GitHub account ready for OAuth App creation

## Step 1: Create GitHub OAuth App

- [ ] Go to https://github.com/settings/developers
- [ ] Click "New OAuth App"
- [ ] Fill in application details:
  - [ ] Application name: `Resume OAuth Server` (or your choice)
  - [ ] Homepage URL: `https://azzamunza.github.io/resume`
  - [ ] Authorization callback URL: `https://your-backend-url.com/api/auth/callback` (temporary, will update after deployment)
- [ ] Click "Register application"
- [ ] Copy **Client ID** and **Client Secret** (keep secret safe!)

## Step 2: Deploy Backend Server

### Option A: Vercel (Recommended)

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login: `vercel login`
- [ ] Deploy: Run `vercel` from repository root
- [ ] Note the deployment URL
- [ ] Go to Vercel dashboard → Project Settings → Environment Variables
- [ ] Add environment variables:
  - [ ] `GITHUB_CLIENT_ID` = (from Step 1)
  - [ ] `GITHUB_CLIENT_SECRET` = (from Step 1)
  - [ ] `CALLBACK_URL` = `https://your-vercel-url.vercel.app/api/auth/callback`
  - [ ] `FRONTEND_URL` = `https://azzamunza.github.io`
  - [ ] `SESSION_SECRET` = (generate random string: `openssl rand -base64 32`)
  - [ ] `NODE_ENV` = `production`
- [ ] Redeploy: `vercel --prod`
- [ ] Test health endpoint: `curl https://your-vercel-url.vercel.app/health`
- [ ] Should see: `{"status":"ok","timestamp":"..."}`

### Option B: Heroku

- [ ] Install Heroku CLI
- [ ] Login: `heroku login`
- [ ] Create app: `heroku create your-app-name`
- [ ] Note the app URL
- [ ] Set environment variables:
  - [ ] `heroku config:set GITHUB_CLIENT_ID=...`
  - [ ] `heroku config:set GITHUB_CLIENT_SECRET=...`
  - [ ] `heroku config:set CALLBACK_URL=https://your-app.herokuapp.com/api/auth/callback`
  - [ ] `heroku config:set FRONTEND_URL=https://azzamunza.github.io`
  - [ ] `heroku config:set SESSION_SECRET=$(openssl rand -base64 32)`
  - [ ] `heroku config:set NODE_ENV=production`
- [ ] Deploy: `git push heroku main`
- [ ] Test: `heroku open /health`

### Option C: Railway

- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Initialize: `railway init`
- [ ] Deploy: `railway up`
- [ ] Get URL: `railway domain`
- [ ] Add environment variables in Railway dashboard
- [ ] Test health endpoint

## Step 3: Update GitHub OAuth App

- [ ] Go back to GitHub OAuth App settings
- [ ] Update **Authorization callback URL** to match your deployed backend:
  - Vercel: `https://your-vercel-url.vercel.app/api/auth/callback`
  - Heroku: `https://your-app.herokuapp.com/api/auth/callback`
  - Railway: `https://your-railway-url.railway.app/api/auth/callback`
- [ ] Save changes

## Step 4: Update Frontend

- [ ] Open `resumes/index.html` in editor
- [ ] Find the `<script>` section (around line 1010)
- [ ] Add at the top of script section:
  ```javascript
  // Backend OAuth Configuration
  window.BACKEND_API_URL = 'https://your-backend-url.vercel.app'; // UPDATE THIS
  ```
- [ ] Find closing `</body>` tag
- [ ] Add before it:
  ```html
  <script src="../js/github-oauth-backend.js"></script>
  ```
- [ ] Save file
- [ ] Commit changes: `git add resumes/index.html`
- [ ] Commit: `git commit -m "Integrate backend OAuth"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Wait for GitHub Pages to deploy (~1-2 minutes)

## Step 5: Test Integration

- [ ] Visit https://azzamunza.github.io/resume/resumes/index.html
- [ ] Look for authentication section
- [ ] Click "Login with GitHub"
- [ ] Should redirect to GitHub authorization page
- [ ] Click "Authorize" on GitHub
- [ ] Should redirect back to your site
- [ ] URL should show `?auth=success`
- [ ] Authentication status should show "Authenticated"
- [ ] Your username should be displayed
- [ ] Save buttons should be enabled

## Step 6: Test File Operations

- [ ] Click on "Job Search Config" tab
- [ ] File content should load automatically
- [ ] Make a small edit to the file
- [ ] Click "Save to GitHub"
- [ ] Should see "Saved successfully!" message
- [ ] Go to GitHub repository
- [ ] Check recent commits
- [ ] Should see your edit committed

## Step 7: Verify Security

- [ ] Open browser console (F12)
- [ ] Check for errors:
  - [ ] No CORS errors
  - [ ] No authentication errors
- [ ] Check cookies (Application/Storage → Cookies):
  - [ ] Should see session cookie
  - [ ] Should be marked as `HttpOnly`
  - [ ] Should be marked as `Secure` (in production)
- [ ] Try accessing backend directly:
  - [ ] `GET /api/auth/status` - should work
  - [ ] `GET /api/github/user` - should require auth

## Step 8: Monitor and Maintain

- [ ] Set up monitoring (optional):
  - [ ] UptimeRobot to ping /health endpoint
  - [ ] Error tracking (e.g., Sentry)
- [ ] Document deployment date
- [ ] Schedule regular maintenance:
  - [ ] Monthly: Check for dependency updates
  - [ ] Quarterly: Review security settings
  - [ ] Annually: Rotate secrets

## Troubleshooting

### CORS Errors
- [ ] Check `FRONTEND_URL` environment variable matches GitHub Pages URL exactly
- [ ] Verify backend is deployed and running
- [ ] Check browser console for specific CORS error message

### Authentication Fails
- [ ] Verify GitHub OAuth App callback URL matches backend URL
- [ ] Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- [ ] Ensure environment variables are set in deployment platform
- [ ] Check browser console for error messages

### Session Not Persisting
- [ ] Verify cookies are enabled in browser
- [ ] Check that `credentials: 'include'` is in frontend API calls
- [ ] In production, verify HTTPS is being used
- [ ] Check `SESSION_SECRET` is set

### Backend Not Responding
- [ ] Check deployment logs
- [ ] Verify backend service is running
- [ ] Test health endpoint: `curl https://your-backend-url/health`
- [ ] Check environment variables are set correctly

## Rollback Plan

If something goes wrong:

1. **Quick Rollback**:
   - [ ] Remove backend OAuth script from `resumes/index.html`
   - [ ] Revert to previous version
   - [ ] Commit and push

2. **Full Rollback**:
   - [ ] Revert all changes in Git
   - [ ] Stop backend server (or delete deployment)
   - [ ] Site will continue working with Device Flow

## Success Criteria

✅ All checkboxes above are checked  
✅ Authentication works without CORS errors  
✅ File operations (save) work correctly  
✅ Session persists across page refreshes  
✅ No security warnings in browser console  

## Post-Deployment

- [ ] Document backend URL for future reference
- [ ] Share deployment with team/stakeholders
- [ ] Monitor for any issues in first 24 hours
- [ ] Celebrate! 🎉

## Support

Need help? See:
- `QUICKSTART.md` - Quick overview
- `BACKEND_DEPLOYMENT.md` - Detailed deployment guide
- `FRONTEND_INTEGRATION.md` - Integration details
- `SECURITY.md` - Security information
- Email: azzamunza@gmail.com

---

**Estimated Time**: 30-45 minutes  
**Difficulty**: Moderate  
**Prerequisites**: GitHub account, Node.js knowledge helpful  
**Result**: CORS-free OAuth authentication! 🚀
