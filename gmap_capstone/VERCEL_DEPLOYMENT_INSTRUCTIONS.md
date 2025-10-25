# Vercel Deployment Instructions

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)

## Step-by-Step Deployment Guide

### 1. Push Code to Git Repository

If you haven't already, initialize git and push to your repository:

```bash
cd gmap_capstone
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

### 2. Connect to Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Select the `gmap_capstone` directory (if not root)

### 3. Configure Project Settings

Vercel should auto-detect the settings, but verify:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4. Add Environment Variables

⚠️ **CRITICAL STEP** - Add these environment variables in Vercel:

Go to **Project Settings → Environment Variables** and add:

```
VITE_SUPABASE_URL=https://vwuysllaspphcrfhgtqo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3dXlzbGxhc3BwaGNyZmhndHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTMwODIsImV4cCI6MjA3NTkyOTA4Mn0.w0D9XffDqb3OEVUqB1DM72AMJvE0HjvpIamlMADZ_7E
```

**Important:** Add these variables to:
- ✅ Production
- ✅ Preview (optional)
- ✅ Development (optional)

### 5. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (~2-3 minutes)
3. Vercel will provide you with a deployment URL

### 6. Verify Deployment

Once deployed, test the following:

1. **Homepage loads correctly** ✅
2. **Map page is accessible** ✅
3. **Authentication works** ✅
4. **Admin login works** ✅
5. **No console errors** ✅

### 7. Configure Custom Domain (Optional)

To add a custom domain:

1. Go to **Project Settings → Domains**
2. Add your domain
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate to be issued

---

## Troubleshooting

### Build Fails

**Problem:** Build fails with missing dependencies
**Solution:** Ensure all dependencies are in `package.json`, not just `devDependencies`

**Problem:** Environment variables not found
**Solution:** Double-check that `VITE_` prefix is used and variables are added in Vercel dashboard

### Runtime Errors

**Problem:** "Missing required environment variables" error
**Solution:** 
1. Go to Vercel Project Settings → Environment Variables
2. Ensure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Redeploy the project

**Problem:** Blank page or 404 errors
**Solution:** 
- Check that `vercel.json` has proper routing configuration
- Verify that `dist` folder is being generated correctly

### Supabase Connection Issues

**Problem:** Can't connect to Supabase
**Solution:**
1. Verify Supabase project is active
2. Check that the Supabase URL and key are correct
3. Verify Supabase RLS (Row Level Security) policies are set up correctly
4. Check Supabase logs for authentication errors

---

## Alternative Deployment Method (Vercel CLI)

If you prefer using the command line:

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
cd gmap_capstone
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- Project name? (press Enter to use default)
- In which directory is your code located? `.`

### 4. Add Environment Variables via CLI

```bash
vercel env add VITE_SUPABASE_URL
# Paste the value when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste the value when prompted
```

### 5. Deploy to Production

```bash
vercel --prod
```

---

## Post-Deployment Checklist

- ✅ Application loads without errors
- ✅ All pages are accessible
- ✅ Authentication works
- ✅ Admin dashboard is accessible with correct credentials
- ✅ Map functionality works
- ✅ Forms submit correctly
- ✅ No console errors in browser
- ✅ Mobile responsiveness verified
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Custom domain configured (if applicable)

---

## Continuous Deployment

Vercel automatically sets up continuous deployment:

- **Push to `main` branch** → Automatic production deployment
- **Push to other branches** → Automatic preview deployment
- **Pull requests** → Preview deployment with unique URL

---

## Important Notes

1. **Environment Variables:** Never commit `.env.local` to git. Always use Vercel's environment variable settings.

2. **Supabase Keys:** The anon key is safe to expose in the client, but ensure your Supabase RLS policies are properly configured.

3. **Build Time:** First deployment may take 3-5 minutes. Subsequent deployments are faster.

4. **Logs:** Access deployment logs in the Vercel dashboard under the Deployments tab.

5. **Rollback:** You can instantly rollback to any previous deployment from the Vercel dashboard.

---

## Support

If you encounter issues:

1. Check Vercel build logs in the dashboard
2. Review browser console for errors
3. Check Supabase logs for backend issues
4. Refer to `PROJECT_SCAN_REPORT.md` for known issues

---

## Current Deployment Status

**Project Status:** ✅ Ready for Deployment
**Build Status:** ✅ Passing
**Bundle Size:** 584 KB (152 KB gzipped)
**Environment:** Production Ready


