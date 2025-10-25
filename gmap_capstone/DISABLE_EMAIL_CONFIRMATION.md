# How to Disable Email Confirmation in Supabase

## Step-by-Step Guide:

### 1. Go to Supabase Dashboard
- URL: https://supabase.com/dashboard
- Log in to your account
- Select your project: `vwuysllaspphcrfhgtqo`

### 2. Navigate to Authentication Settings
**Left Sidebar** → Click **"Authentication"**
↓
**Top Navigation** → Click **"Providers"** or **"Settings"**

### 3. Find Email Provider Settings
Look for one of these sections:
- **"Email"** provider
- **"Auth Providers"**
- **"Email Auth"**

### 4. Disable Email Confirmation
Look for these options (exact naming may vary):
- ✅ **"Confirm email"** - DISABLE/UNCHECK this
- ✅ **"Enable email confirmations"** - DISABLE/UNCHECK this
- ✅ **"Require email confirmation"** - DISABLE/UNCHECK this

### 5. Alternative: Check URL Settings
Try these direct URLs (replace with your project ID):
- `https://supabase.com/dashboard/project/vwuysllaspphcrfhgtqo/auth/providers`
- `https://supabase.com/dashboard/project/vwuysllaspphcrfhgtqo/settings/auth`

## Current Supabase Dashboard Layout (2024-2025):

### New Layout Path:
1. **Left Sidebar** → **Authentication**
2. **Top Tabs** → Click **"Providers"**
3. **Email Provider** → Click to expand
4. **Toggle OFF** "Confirm email"

### Alternative Path:
1. **Left Sidebar** → **Project Settings** (gear icon)
2. **Authentication** section
3. **Email Auth** settings
4. **Toggle OFF** email confirmation

## If You Still Can't Find It:

### Option A: Use SQL to Disable Email Confirmation
Run this in your Supabase SQL Editor:

```sql
-- This won't work directly, but you can manually confirm users
-- Run this for each user that needs to be confirmed:
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'amoromonste@gmail.com';
```

### Option B: Manually Confirm Your Account
1. Go to **Authentication** → **Users**
2. Find your user account
3. Click the **three dots (...)** menu
4. Look for **"Confirm email"** or **"Verify email"**
5. Click it to manually confirm

### Option C: Check Email Templates
1. **Authentication** → **Email Templates**
2. This might show email confirmation settings

## Still Having Issues?

Try this temporary fix - Manually confirm the user via SQL:

```sql
-- Confirm the specific user account
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email = 'amoromonste@gmail.com';
```

After running this, try logging in again!



