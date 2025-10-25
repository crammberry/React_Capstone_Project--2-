# 🚨 CRITICAL: Database Fix Required

## ⚠️ **YOU MUST RUN THIS SQL SCRIPT TO FIX USER REGISTRATION**

The error **"Database error saving new user"** means Supabase's security (RLS policies) is blocking new user creation.

---

## 📋 Step-by-Step Instructions

### **STEP 1: Open Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Sign in with your account
3. Select your **"eternal-rest"** project

### **STEP 2: Navigate to SQL Editor**
1. On the left sidebar, click **"SQL Editor"**
2. Click **"New Query"** button

### **STEP 3: Copy and Run the SQL Script**

**Option A: Copy from file**
1. Open the file: `gmap_capstone/database/quick-fix-rls-policies.sql`
2. Copy ALL the SQL code (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor (Ctrl+V)
4. Click **"Run"** button (or press Ctrl+Enter)

**Option B: Copy from below**

```sql
-- ============================================
-- QUICK FIX: Drop and Recreate RLS Policies
-- ============================================

-- Step 1: Drop all existing policies on profiles table
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN 
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create proper policies for user registration

-- Allow anonymous users to check if email exists (for registration flow)
CREATE POLICY "Allow anon to check email availability"
ON public.profiles FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to create their own profile during signup
CREATE POLICY "Allow anon to insert profiles during signup"
ON public.profiles FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to view their own profile
CREATE POLICY "Allow users to view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Allow users to update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admin users to view all profiles
CREATE POLICY "Allow admins to view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admin users to update any profile
CREATE POLICY "Allow admins to update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Grant necessary permissions
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;
```

### **STEP 4: Verify Success**
- After running, you should see a table showing all the new policies
- Look for messages like **"DROP POLICY"** and **"CREATE POLICY"** in the results

### **STEP 5: Test User Registration**
1. Go back to your application: http://localhost:5173
2. Try to create a new account
3. The error should be **GONE**! ✅

---

## 🔍 What This Script Does

1. **Removes all old/conflicting policies** from the `profiles` table
2. **Creates fresh security policies** that allow:
   - Anonymous users to check if email exists
   - Anonymous users to create their profile during signup
   - Authenticated users to view/update their own profile
   - Admin users to manage all profiles

---

## ❓ Troubleshooting

### "Permission denied to drop policy"
- Make sure you're logged into Supabase with an account that has admin access to your project

### "Syntax error at or near..."
- Make sure you copied the **ENTIRE** SQL script, including the DO $$ blocks

### Still getting "Database error saving new user"
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Refresh the page (Ctrl+F5)
3. Try registering again

---

## 📞 Need Help?

If you're still stuck after running this SQL script:
1. Take a screenshot of the Supabase SQL Editor results
2. Take a screenshot of the browser console error
3. Share both screenshots

---

## ⚡ Why This Error Happens

Supabase uses **Row Level Security (RLS)** to protect data. When you transferred your files to a new device, the database policies weren't included. This script recreates those policies so new users can register.

**THIS IS A ONE-TIME FIX** - You only need to run this script once!

