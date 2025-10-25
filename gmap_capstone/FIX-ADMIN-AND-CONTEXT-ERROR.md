# 🔧 Fix Admin Account & Context Error

## 🎯 **Two Problems Detected:**

### **Problem #1:** React Context Error ❌
```
Error: useAuth must be used within an AuthProvider
```
**Cause:** Hot-reload issue after code changes

### **Problem #2:** Admin account stuck in "pending" ❌
**Cause:** Database `profiles` table has `is_verified=false` or `role='user'`

---

## ✅ **SOLUTION: 3 Simple Steps**

---

### **STEP 1: Fix Database (Admin Account)**

#### **In Supabase SQL Editor:**

1. Open: https://app.supabase.com
2. Click: **SQL Editor** (left sidebar)
3. Click: **"+ New Query"**
4. Open file in VS Code: `database/FIX-ADMIN-ACCOUNT.sql`
5. **Copy ALL text** (Ctrl+A, Ctrl+C)
6. Paste into Supabase SQL Editor (Ctrl+V)
7. Click: **"Run"** (or Ctrl+Enter)

**Expected Output:**
```
✅✅✅ ADMIN ACCOUNT FIXED! ✅✅✅

📧 Email: amoromonste@gmail.com
👑 Role: admin
✅ Verified: true
```

---

### **STEP 2: Clear Browser & Reload**

1. **Open your browser** (where the app is running)
2. **Open DevTools** (Press F12)
3. **Go to Application tab** (or Storage tab)
4. **Clear ALL site data:**
   - Click "Clear site data" button
   - OR manually delete:
     - Local Storage → eternal-rest-auth
     - Session Storage → all items
     - Cookies → all cookies
5. **Close DevTools** (Press F12)
6. **Hard Refresh** (Press Ctrl + Shift + R or Ctrl + F5)

---

### **STEP 3: Login Again**

1. **Logout** if you see a logout button
2. **Login** with: `amoromonste@gmail.com`
3. **Check Header** - Should now say **"Admin Mode"** (not "pending")
4. **Click "Admin Mode"** or **"Dashboard"** button
5. **Verify:**
   - ✅ You can access Admin Dashboard
   - ✅ You see all the tabs (Overview, Manage Plots, etc.)
   - ✅ No more React Context errors in console

---

## 🔍 **Verify It's Fixed:**

### **Check 1: Console (F12)**
Should **NOT** see:
```
❌ Error: useAuth must be used within an AuthProvider
```

Should see:
```
✅ Auth state change SESSION: amoromonste@gmail.com
✅ Profile loaded successfully from database
👑 Role: admin
```

### **Check 2: Header**
Should see:
```
[Your Name] | Admin Mode | Dashboard | Logout
```

**NOT:**
```
[Your Name] | pending | Logout
```

### **Check 3: Admin Dashboard**
- ✅ Can access `/admin-dashboard`
- ✅ Can see all tabs
- ✅ Can see "🏺 Exhumation Management" tab
- ✅ Can see "🏷️ Plot Reservations" tab
- ✅ Exhumation Management shows data (not zeros)

---

## 🐛 **If Problems Persist:**

### **Problem: Still says "pending"**
**Solution:**
1. Make sure you ran the SQL script successfully
2. Logout completely from the app
3. Close the browser tab
4. Open a new tab
5. Go to http://localhost:5173
6. Login again

### **Problem: Still getting Context errors**
**Solution:**
1. Stop the dev server (close terminal or Ctrl+C)
2. Delete `node_modules` folder
3. Run: `npm install`
4. Run: `npm run dev`
5. Hard refresh browser (Ctrl + F5)

### **Problem: Can't run SQL script**
**Solution:**
Run these commands **manually** in Supabase SQL Editor:

```sql
-- Command 1: Check current state
SELECT email, role, is_verified 
FROM profiles 
WHERE email = 'amoromonste@gmail.com';

-- Command 2: Fix the account
UPDATE profiles
SET role = 'admin', is_verified = true
WHERE email = 'amoromonste@gmail.com';

-- Command 3: Verify it worked
SELECT email, role, is_verified 
FROM profiles 
WHERE email = 'amoromonste@gmail.com';
```

Expected result:
```
email: amoromonste@gmail.com
role: admin
is_verified: true
```

---

## 📊 **What Was Wrong:**

### **Database Issue:**
```
BEFORE:
email: amoromonste@gmail.com
role: user          ❌ (should be 'admin')
is_verified: false  ❌ (should be true)

AFTER:
email: amoromonste@gmail.com
role: admin         ✅
is_verified: true   ✅
```

### **React Context Issue:**
- Hot-reload caused `AuthProvider` to unmount
- `Header` component tried to use `useAuth` without provider
- Clearing browser data and restarting fixes it

---

## ✅ **Success Checklist:**

- [ ] SQL script ran successfully
- [ ] Browser data cleared
- [ ] Hard refresh done (Ctrl + F5)
- [ ] Logged out and back in
- [ ] Header shows "Admin Mode" (not "pending")
- [ ] Can access Admin Dashboard
- [ ] No console errors about "useAuth"
- [ ] Exhumation Management tab works
- [ ] Plot Reservations tab visible

---

## 🎉 **After All 3 Steps:**

You should be able to:
- ✅ Login as admin
- ✅ See "Admin Mode" in header
- ✅ Access Admin Dashboard
- ✅ View/manage exhumation requests
- ✅ View/manage plot reservations
- ✅ No more React errors

---

## 💡 **Pro Tip:**

If you ever get stuck in "pending" again:
1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Click "profiles" table
4. Find your email row
5. Edit: Set `role = 'admin'` and `is_verified = true`
6. Save
7. Logout and login again

---

**That's it! All fixed!** 🚀

