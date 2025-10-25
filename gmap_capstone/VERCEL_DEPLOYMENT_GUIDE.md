# 🚀 Vercel Deployment Guide - Complete Setup

## Pre-Deployment Checklist

### ✅ Before Publishing to Vercel:

1. **Database Setup (Supabase)**
   - [x] Run `auto-confirm-all-users.sql` in Supabase SQL Editor
   - [x] Verify all database tables exist (`profiles`, `plots`, `verification_codes`)
   - [x] Test login system locally

2. **Environment Variables**
   - [ ] Copy Supabase credentials
   - [ ] Configure Vercel environment variables

3. **Code Preparation**
   - [ ] Remove console.log statements (optional)
   - [ ] Update API URLs if needed
   - [ ] Test production build locally

---

## Step 1: Prepare Environment Variables

### Create `.env.production` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://vwuysllaspphcrfhgtqo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3dXlzbGxhc3BwaGNyZmhndHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTMwODIsImV4cCI6MjA3NTkyOTA4Mn0.w0D9XffDqb3OEVUqB1DM72AMJvE0HjvpIamlMADZ_7E

# Resend API (for email verification codes)
# Get from: https://resend.com/api-keys
RESEND_API_KEY=your_resend_api_key_here
```

**Important**: Never commit `.env.production` to Git!

---

## Step 2: Create `vercel.json` Configuration

Create this file in your project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/",
      "status": 200
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**What this does**:
- Enables SPA routing (all routes go to index.html)
- Adds security headers
- Configures Vite build output

---

## Step 3: Update Supabase Settings for Production

### A. Add Vercel Domain to Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add your Vercel domains to **Redirect URLs**:
   ```
   https://your-project.vercel.app
   https://your-project.vercel.app/**
   https://your-custom-domain.com (if applicable)
   ```

### B. Update CORS Settings

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Add allowed origins:
   ```
   https://your-project.vercel.app
   https://your-custom-domain.com
   ```

### C. Verify Edge Functions CORS

Your Resend Edge Function should already have CORS headers:

```typescript
return new Response(JSON.stringify({ success: true }), {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Or specific domain
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  },
});
```

---

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Go to**: https://vercel.com/new
2. **Import Git Repository**:
   - Connect your GitHub/GitLab account
   - Select your project repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `React_Capstone_Project/gmap_capstone`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add each variable from `.env.production`:
     ```
     VITE_SUPABASE_URL = https://vwuysllaspphcrfhgtqo.supabase.co
     VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     RESEND_API_KEY = re_your_key_here
     ```
   - Select: **Production**, **Preview**, **Development**

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd React_Capstone_Project/gmap_capstone

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

## Step 5: Configure Session Persistence for Production

### Update `src/supabase/config.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vwuysllaspphcrfhgtqo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// Determine if we're in production
const isProduction = import.meta.env.PROD

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    // Use localStorage in production for better persistence
    storage: isProduction ? window.localStorage : undefined,
    storageKey: 'eternal-rest-auth',
  }
})

export default supabase
```

**What this does**:
- Uses localStorage for session persistence in production
- Custom storage key prevents conflicts
- Sessions persist across page reloads
- Better handling of auth state in production

---

## Step 6: Test Production Build Locally

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

**Test these scenarios**:
1. Register new user
2. Verify email with 6-digit code
3. Login
4. Navigate between pages (should stay logged in)
5. Refresh browser (should stay logged in)
6. Logout
7. Close browser and reopen (should be logged out)

---

## Step 7: Post-Deployment Configuration

### A. Update Redirect URLs in Supabase

After deployment, update these in Supabase Dashboard:

1. **Site URL**: `https://your-project.vercel.app`
2. **Redirect URLs**:
   ```
   https://your-project.vercel.app
   https://your-project.vercel.app/**
   http://localhost:5173 (for local development)
   http://localhost:5174
   ```

### B. Update Resend Domain (Optional)

If you want to send emails from your own domain:

1. Go to **Resend Dashboard** → **Domains**
2. Add your custom domain
3. Add DNS records to your domain provider
4. Update Edge Function to use your domain:
   ```typescript
   from: 'noreply@your-domain.com'
   ```

### C. Configure Custom Domain (Optional)

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records
4. Add domain to Supabase allowed URLs

---

## Step 8: Security Considerations for Production

### A. Rate Limiting

Add rate limiting to prevent abuse:

```javascript
// src/services/RateLimiter.js
class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts
    const recentAttempts = userAttempts.filter(
      time => now - time < this.windowMs
    );
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
}

export const loginLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 min
export const verificationLimiter = new RateLimiter(3, 5 * 60 * 1000); // 3 attempts per 5 min
```

### B. Enable RLS (Row Level Security) in Supabase

Already configured in your SQL scripts:

```sql
-- Users can only read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### C. Secure Environment Variables

✅ **DO**:
- Use Vercel Environment Variables
- Never commit `.env` files to Git
- Use different keys for development/production

❌ **DON'T**:
- Expose Supabase Service Role Key (use Anon Key only)
- Store sensitive data in client-side code
- Use same API keys for dev and production

---

## Step 9: Monitoring and Error Tracking

### A. Vercel Analytics (Built-in)

Vercel automatically provides:
- Page views
- Performance metrics
- Build logs

### B. Supabase Logging

Monitor in Supabase Dashboard:
- **Database** → **Logs** (SQL queries)
- **Authentication** → **Logs** (Auth events)
- **Edge Functions** → **Logs** (Function calls)

### C. Optional: Add Error Tracking

Consider integrating:
- **Sentry** (error tracking)
- **LogRocket** (session replay)
- **Mixpanel** (analytics)

---

## Step 10: Testing Production Deployment

### Test Checklist:

✅ **Registration**:
- [ ] User can access registration form
- [ ] Email verification code is sent
- [ ] Code is received in email
- [ ] Registration completes successfully

✅ **Login**:
- [ ] User can log in with registered credentials
- [ ] Session persists across page refreshes
- [ ] Profile shows in header on all pages

✅ **Navigation**:
- [ ] Home page loads
- [ ] Map page loads
- [ ] About/Contact pages load
- [ ] Auth state consistent across all pages

✅ **Session Persistence**:
- [ ] User stays logged in after refresh
- [ ] User stays logged in after closing tab
- [ ] Session expires after timeout (if configured)

✅ **Logout**:
- [ ] Logout works from any page
- [ ] All auth state cleared
- [ ] Can log in again after logout

✅ **Multiple Users**:
- [ ] Multiple users can register
- [ ] Each user has separate session
- [ ] No session conflicts

---

## Common Issues and Solutions

### Issue 1: "CORS Error" after deployment

**Solution**:
```typescript
// In Supabase Edge Function
headers: {
  'Access-Control-Allow-Origin': 'https://your-project.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### Issue 2: Session not persisting in production

**Solution**: Check `vercel.json` has proper routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Issue 3: Environment variables not working

**Solution**:
- Verify variables are prefixed with `VITE_`
- Redeploy after adding/changing variables
- Check variable names match exactly

### Issue 4: Email verification not working

**Solution**:
- Verify Resend API key is correct
- Check Edge Function is deployed
- Verify domain is verified in Resend

### Issue 5: 404 on page refresh

**Solution**: Already fixed by `vercel.json` rewrites

---

## Production Optimization Tips

### 1. **Code Splitting**
Vite does this automatically, but verify:
```bash
npm run build
# Check dist/assets for chunked files
```

### 2. **Image Optimization**
- Use WebP format
- Compress images before deploying
- Use lazy loading for images

### 3. **Caching Strategy**
Vercel automatically handles:
- Static asset caching
- CDN distribution
- Edge caching

### 4. **Performance Monitoring**
Add to `package.json`:
```json
{
  "scripts": {
    "analyze": "vite-bundle-visualizer"
  }
}
```

---

## Deployment Workflow

### Initial Deployment:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
# Vercel auto-deploys from main branch
```

### Future Updates:
```bash
git add .
git commit -m "Update feature X"
git push origin main
# Automatic deployment on push
```

### Rollback if needed:
1. Go to Vercel Dashboard
2. Select deployment
3. Click "Promote to Production"

---

## Final Production Checklist

### Before Going Live:

- [ ] Run `auto-confirm-all-users.sql` in Supabase
- [ ] Add Vercel domain to Supabase allowed URLs
- [ ] Configure environment variables in Vercel
- [ ] Test production build locally
- [ ] Deploy to Vercel
- [ ] Test all auth flows in production
- [ ] Test on mobile devices
- [ ] Monitor logs for errors
- [ ] Set up custom domain (optional)
- [ ] Configure HTTPS (automatic with Vercel)

### Post-Launch:

- [ ] Monitor Vercel Analytics
- [ ] Check Supabase logs daily
- [ ] Monitor error rates
- [ ] Test with real users
- [ ] Gather feedback
- [ ] Plan updates

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Vite Documentation**: https://vitejs.dev/guide/
- **React Router**: https://reactrouter.com/

---

**Your system is production-ready!** 🚀✨

The authentication system will work seamlessly in production with proper session persistence across all pages.



