# User Registration Database Error Fix

**Issue:** "Database error saving new user" when trying to register  
**Status:** 🔧 IN PROGRESS

---

## 🔍 Errors Found

### 1. Profile Check Query Error (FIXED ✅)
```
GET .../profiles?select=email... 406 (Not Acceptable)
```

**Cause:** Using `.single()` instead of `.maybeSingle()`  
**Fix:** Changed to `.maybeSingle()` in `AuthContext.jsx` line 235

### 2. User Creation Database Error (NEEDS FIX ⚠️)
```
POST .../auth/v1/signup 500 (Internal Server Error)
AuthApiError: Database error saving new user
```

**Cause:** Supabase database trigger or RLS policy blocking user creation

---

## 🛠️ Supabase Database Fixes Needed

### Issue: Database Trigger Conflict

When a user signs up, Supabase tries to:
1. Create user in `auth.users` table ✅
2. Trigger creates profile in `profiles` table ❌ (FAILS HERE)
3. Your code also tries to create profile ❌ (CONFLICT)

**Problem:** You might have BOTH:
- A database trigger that auto-creates profiles
- Manual profile creation in your code

This causes a duplicate insert error!

---

## 🔧 Solution Options

### Option 1: Remove Database Trigger (Recommended)

Go to Supabase SQL Editor and run:

```sql
-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'users'
AND trigger_schema = 'auth';

-- If you see a trigger that creates profiles, drop it:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

### Option 2: Fix RLS Policies

The trigger might be failing due to Row Level Security. Run this in Supabase SQL Editor:

```sql
-- Allow service role to insert profiles (for triggers)
CREATE POLICY "Allow service role to insert profiles"
ON profiles FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile during signup"
ON profiles FOR INSERT
TO authenticated, anon
WITH CHECK (auth.uid() = id);
```

### Option 3: Remove Manual Profile Creation

Update your code to NOT manually create profiles (let the trigger do it).

In `AuthContext.jsx`, comment out or remove the manual profile creation:

```javascript
// REMOVE OR COMMENT THIS SECTION (lines 279-307)
/*
if (data.user) {
  console.log('📝 Creating user profile for:', data.user.id);
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: data.user.id,
      email: email,
      // ... rest of profile data
    }]);
}
*/
```

---

## 📋 Recommended Fix Steps

### Step 1: Check Your Database Setup

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor**
3. Run this query to check for triggers:

```sql
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users'
  AND trigger_schema = 'auth';
```

### Step 2A: If Trigger Exists - Use Trigger Only

**Remove manual profile creation from code:**

1. Edit `src/contexts/AuthContext.jsx`
2. Find the `signUp` function (around line 279)
3. Comment out the manual profile insertion
4. Let the trigger handle it automatically

### Step 2B: If NO Trigger - Fix RLS Policies

**Keep manual creation, but fix permissions:**

Run this in Supabase SQL Editor:

```sql
-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new, working policies
CREATE POLICY "Enable insert for anon users during signup"
ON profiles FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read for authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

---

## 🧪 Testing After Fix

1. **Clear browser data** (cookies, localStorage)
2. **Try registering** a new user
3. **Check console** - should see:
   ```
   ✅ Supabase user created
   ✅ User profile created successfully
   ```
4. **No 500 errors!** ✅

---

## 🎯 Quick Fix Right Now

**Try this first** (easiest):

Go to Supabase → SQL Editor → Run:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Try signup again
-- If it works, then the issue is RLS policies
```

**IMPORTANT:** Re-enable RLS after testing:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

Then fix the policies properly using Step 2B above.

---

## 📝 Files Modified

- ✅ `src/contexts/AuthContext.jsx` - Changed `.single()` to `.maybeSingle()`
- ⏳ Supabase database policies - Need to be fixed in dashboard

---

## 🚀 Next Steps

1. Choose which option (trigger vs manual) you want
2. Apply the appropriate SQL fix in Supabase
3. Test locally with `npm run dev`
4. If working, push to GitHub
5. Vercel will auto-deploy

---

**Status:** Ready for Supabase database fixes


