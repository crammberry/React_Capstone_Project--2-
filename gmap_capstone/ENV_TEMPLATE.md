# Environment Variables Template

## For Local Development (.env file)

Create a `.env` file in the root directory with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://vwuysllaspphcrfhgtqo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3dXlzbGxhc3BwaGNyZmhndHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTMwODIsImV4cCI6MjA3NTkyOTA4Mn0.w0D9XffDqb3OEVUqB1DM72AMJvE0HjvpIamlMADZ_7E

# Resend API Key (for email verification)
RESEND_API_KEY=your_resend_api_key_here
```

## For Vercel Production

Add these environment variables in Vercel Dashboard:

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

2. Add each variable:

### VITE_SUPABASE_URL
```
https://vwuysllaspphcrfhgtqo.supabase.co
```
- **Environments**: Production, Preview, Development

### VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3dXlzbGxhc3BwaGNyZmhndHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTMwODIsImV4cCI6MjA3NTkyOTA4Mn0.w0D9XffDqb3OEVUqB1DM72AMJvE0HjvpIamlMADZ_7E
```
- **Environments**: Production, Preview, Development

### RESEND_API_KEY
```
re_your_resend_api_key_here
```
- **Environments**: Production, Preview, Development
- **Get from**: https://resend.com/api-keys

## Important Notes

⚠️ **Security**:
- Never commit `.env` files to Git
- `.env` is already in `.gitignore`
- Use different API keys for development and production (recommended)

✅ **Variable Naming**:
- All client-side variables MUST start with `VITE_`
- Server-side variables (Edge Functions) don't need `VITE_` prefix

✅ **Vercel Deployment**:
- Environment variables are automatically injected during build
- Changes to environment variables require redeployment
- You can update variables without code changes

## How to Get API Keys

### Supabase URL and Anon Key:
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings** → **API**
4. Copy **Project URL** and **anon/public** key

### Resend API Key:
1. Go to: https://resend.com/api-keys
2. Create a new API key
3. Copy the key (you can only see it once!)
4. Add to Supabase Edge Function environment

## Verifying Environment Variables

### Local Development:
```bash
npm run dev
# Check browser console for Supabase connection logs
```

### Production (Vercel):
1. Check Vercel build logs
2. Look for "Environment Variables" section
3. Verify all variables are loaded (values will be hidden)

## Troubleshooting

### Issue: "Supabase URL is undefined"
- **Solution**: Verify variable name starts with `VITE_`
- **Solution**: Restart dev server after adding variables

### Issue: "Environment variables not working in production"
- **Solution**: Redeploy after adding/changing variables in Vercel
- **Solution**: Check variable names match exactly (case-sensitive)

### Issue: "CORS error in production"
- **Solution**: Add Vercel domain to Supabase allowed URLs
- **Solution**: Update Edge Function CORS headers



