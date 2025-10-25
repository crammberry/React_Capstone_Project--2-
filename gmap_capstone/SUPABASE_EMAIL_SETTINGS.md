# Supabase Email Configuration Fix

## Problem
Users can't log in after registration because Supabase requires email confirmation by default.

## Solution
You need to disable email confirmation in your Supabase project settings:

### Steps:
1. Go to your Supabase Dashboard
2. Navigate to: **Authentication** → **Settings**
3. Find **"Email confirmation"** section
4. **Disable** "Enable email confirmations"
5. Save the settings

### Alternative: Enable Email Confirmation
If you want to keep email confirmation enabled:
1. Keep "Enable email confirmations" **enabled**
2. Users will receive a confirmation email after registration
3. They must click the confirmation link before they can log in
4. The system will show "Email not confirmed" error until they confirm

## Current System Behavior
- Registration creates user but requires email confirmation
- Login fails with "email not confirmed" error
- User must check email and click confirmation link
- After confirmation, login will work

## Recommended Fix
**Disable email confirmation** for now to match your custom verification system.




