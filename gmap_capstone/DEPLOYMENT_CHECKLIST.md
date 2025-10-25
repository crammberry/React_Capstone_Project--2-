# 🚀 Vercel Deployment Checklist

## Before Deployment

### 1. Database Setup ✅
- [ ] Run `database/auto-confirm-all-users.sql` in Supabase SQL Editor
- [ ] Verify trigger is working (check with test user)
- [ ] Confirm all tables exist:
  - [ ] `profiles`
  - [ ] `plots`
  - [ ] `verification_codes`
  - [ ] `exhumation_requests`

### 2. Test Locally ✅
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Test these features:
- [ ] User registration (with email verification)
- [ ] User login
- [ ] Session persistence (refresh page, still logged in)
- [ ] Navigate to map page (still logged in)
- [ ] Logout (from both home and map page)
- [ ] Multiple user accounts

### 3. Prepare Files ✅
- [ ] `vercel.json` exists in project root
- [ ] Environment variables documented in `ENV_TEMPLATE.md`
- [ ] `.gitignore` includes `.env` files

---

## Deployment Steps

### Step 1: Push to Git
```bash
git add .
git commit -m "Production-ready deployment"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to: https://vercel.com/new
2. Import your Git repository
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `React_Capstone_Project/gmap_capstone`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL = https://vwuysllaspphcrfhgtqo.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY = re_your_resend_api_key
```

Select: **Production**, **Preview**, **Development**

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (2-3 minutes)
- [ ] Note your Vercel URL: `https://your-project.vercel.app`

---

## Post-Deployment Configuration

### Step 1: Update Supabase Settings
1. Go to: **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Update **Site URL**:
   ```
   https://your-project.vercel.app
   ```

3. Add **Redirect URLs**:
   ```
   https://your-project.vercel.app
   https://your-project.vercel.app/**
   http://localhost:5173
   ```

### Step 2: Update CORS (if needed)
1. Go to: **Supabase Dashboard** → **Settings** → **API**
2. Add allowed origins:
   ```
   https://your-project.vercel.app
   ```

### Step 3: Update Edge Function (if using custom domain)
1. Go to: **Supabase Dashboard** → **Edge Functions** → `send-verification-code`
2. Update CORS headers:
   ```typescript
   'Access-Control-Allow-Origin': 'https://your-project.vercel.app'
   ```

---

## Testing Production

### Authentication Flow
- [ ] Go to: `https://your-project.vercel.app`
- [ ] Click "Login / Register"
- [ ] Register new user
- [ ] Verify email with 6-digit code
- [ ] Complete registration
- [ ] Login with new account
- [ ] Navigate to map page (should stay logged in)
- [ ] Refresh browser (should stay logged in)
- [ ] Logout
- [ ] Login again

### Cross-Page Navigation
- [ ] Login from home page
- [ ] Navigate to map page → Profile shows ✅
- [ ] Navigate to about page → Profile shows ✅
- [ ] Navigate back to home → Profile shows ✅
- [ ] Logout from map page → Logged out everywhere ✅

### Session Persistence
- [ ] Login
- [ ] Close browser tab
- [ ] Reopen: `https://your-project.vercel.app`
- [ ] Should still be logged in ✅

### Mobile Testing
- [ ] Open on smartphone
- [ ] Test registration
- [ ] Test login
- [ ] Test navigation
- [ ] Test logout

---

## Common Issues & Fixes

### Issue: "CORS Error"
**Fix**: 
1. Add Vercel URL to Supabase allowed origins
2. Update Edge Function CORS headers
3. Redeploy

### Issue: "Session not persisting"
**Fix**:
1. Check `vercel.json` has proper rewrites
2. Verify `persistSession: true` in `config.js`
3. Clear browser cache and test again

### Issue: "404 on page refresh"
**Fix**: Already handled by `vercel.json` rewrites

### Issue: "Environment variables not working"
**Fix**:
1. Verify variable names start with `VITE_`
2. Redeploy after adding variables
3. Check for typos in variable names

### Issue: "Email not sending in production"
**Fix**:
1. Verify Resend API key is correct
2. Check Edge Function is deployed
3. Verify domain in Resend dashboard

---

## Performance Optimization

### After First Deployment
- [ ] Check Vercel Analytics (speed insights)
- [ ] Test on slow 3G connection
- [ ] Check mobile performance
- [ ] Monitor build time

### Optimize if needed:
- [ ] Enable image optimization
- [ ] Review bundle size
- [ ] Lazy load heavy components
- [ ] Add code splitting

---

## Monitoring

### Daily (First Week)
- [ ] Check Vercel build logs
- [ ] Check Supabase auth logs
- [ ] Monitor user registrations
- [ ] Check for errors

### Weekly
- [ ] Review Vercel Analytics
- [ ] Check database growth
- [ ] Review user feedback
- [ ] Plan updates

---

## Custom Domain (Optional)

### If you have a custom domain:
1. Go to: **Vercel** → **Settings** → **Domains**
2. Add your domain: `yourdomain.com`
3. Add DNS records (Vercel provides instructions)
4. Update Supabase allowed URLs
5. Wait for DNS propagation (up to 48 hours)

---

## Rollback Plan

### If something goes wrong:
1. Go to: **Vercel Dashboard** → **Deployments**
2. Find last working deployment
3. Click **...** menu → **Promote to Production**
4. System reverts immediately

---

## Success Criteria ✅

Your deployment is successful when:
- ✅ Users can register with email verification
- ✅ Users can login and stay logged in across pages
- ✅ Session persists after browser refresh
- ✅ Logout works from any page
- ✅ Multiple users can use the system
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Fast load times (<3 seconds)

---

## Final Notes

📝 **Document Your Deployment**:
- Save Vercel URL
- Save custom domain (if applicable)
- Note deployment date
- Keep track of environment variables

🔐 **Security**:
- Never commit API keys to Git
- Use different keys for dev/production
- Enable Vercel password protection (optional)
- Monitor suspicious activity

📊 **Analytics**:
- Enable Vercel Analytics (free)
- Monitor user growth
- Track popular pages
- Review performance metrics

---

**You're ready to deploy!** 🚀✨

Follow this checklist step-by-step for a smooth deployment to Vercel.



