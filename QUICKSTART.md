# Quick Start Guide

🎉 **Your GitHub OAuth backend is ready!** This guide will get you up and running in 30 minutes.

## What You Have

✅ Complete backend OAuth server  
✅ Frontend integration code  
✅ Deployment configurations for 3 platforms  
✅ Comprehensive documentation  
✅ Security best practices  

## Quick Start (3 Steps)

### Step 1: Deploy Backend Server (15 minutes)

Choose ONE platform:

#### Option A: Vercel (Recommended - Easiest)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from repository root)
vercel

# Set environment variables in Vercel dashboard:
# - GITHUB_CLIENT_ID
# - GITHUB_CLIENT_SECRET
# - CALLBACK_URL (your Vercel URL + /api/auth/callback)
# - FRONTEND_URL (https://azzamunza.github.io)
# - SESSION_SECRET (random string)

# Deploy to production
vercel --prod
```

#### Option B: Heroku
```bash
# Create app
heroku create your-app-name

# Set environment variables
heroku config:set GITHUB_CLIENT_ID=your_id
heroku config:set GITHUB_CLIENT_SECRET=your_secret
heroku config:set CALLBACK_URL=https://your-app.herokuapp.com/api/auth/callback
heroku config:set FRONTEND_URL=https://azzamunza.github.io
heroku config:set SESSION_SECRET=$(openssl rand -base64 32)

# Deploy
git push heroku main
```

#### Option C: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard
```

### Step 2: Create GitHub OAuth App (5 minutes)

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Name**: Resume OAuth Server
   - **Homepage**: https://azzamunza.github.io/resume
   - **Callback**: https://your-backend-url.com/api/auth/callback
4. Copy **Client ID** and **Client Secret**
5. Add them to your backend's environment variables

### Step 3: Update Frontend (10 minutes)

Edit `resumes/index.html`:

1. Add at the top of the `<script>` section (around line 1010):
```javascript
// Backend OAuth Configuration
window.BACKEND_API_URL = 'https://your-backend-url.vercel.app'; // UPDATE THIS
```

2. Add before closing `</body>` tag:
```html
<script src="../js/github-oauth-backend.js"></script>
```

3. Deploy to GitHub Pages (commit and push)

## Test It!

1. Visit https://azzamunza.github.io/resume/resumes/index.html
2. Click "Login with GitHub"
3. Authorize on GitHub
4. You'll be redirected back - authenticated! ✅
5. Try editing and saving a file

## Need More Help?

📖 **Detailed Guides**:
- Deployment: `BACKEND_DEPLOYMENT.md`
- Integration: `FRONTEND_INTEGRATION.md`
- Architecture: `ARCHITECTURE.md`
- Security: `SECURITY.md`

🔧 **Troubleshooting**:
- CORS errors? Check `FRONTEND_URL` matches exactly
- Auth fails? Verify GitHub OAuth App callback URL
- Session issues? Check cookies are enabled

📧 **Support**: azzamunza@gmail.com

## That's It! 🚀

Your backend OAuth is now handling authentication securely with no CORS issues!

---

**Time to Complete**: ~30 minutes  
**Difficulty**: Easy  
**Status**: Production Ready ✅
