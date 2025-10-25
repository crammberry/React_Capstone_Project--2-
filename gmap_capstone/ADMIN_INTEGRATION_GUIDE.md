# 🔐 Admin Function Integration Guide

## Current Admin Features (Already Implemented)

### ✅ Existing Features:
1. **Admin Dashboard** (`/admin` route)
   - Protected route (requires admin role)
   - Overview statistics
   - Plot management
   - Cemetery map view
   - Exhumation management

2. **Tabs Available:**
   - **Overview** - Statistics and overview
   - **Manage Plots** - CRUD operations for plots
   - **Cemetery Map** - Visual map view
   - **Exhumation** - Manage exhumation requests

3. **Plot Management:**
   - Create new plots
   - Update plot status
   - Delete plots
   - Search plots
   - Filter plots

4. **Statistics:**
   - Total plots
   - Occupied plots
   - Available plots
   - Reserved plots
   - Exhumed plots

---

## 🚀 What Needs to be Integrated:

### 1. Create Admin Account
First, you need an admin account in the database.

### 2. Connect Admin Functions to Database
Ensure all admin functions work with Supabase.

### 3. Add Missing Admin Features
- User management
- Reports and analytics
- Audit logs
- Settings

---

## Step 1: Create Admin Account

### SQL Script to Create Admin:

```sql
-- Create an admin account
-- First, register normally through the UI, then run this to upgrade to admin

-- Find your user ID
SELECT id, email, role FROM profiles ORDER BY created_at DESC;

-- Upgrade a user to admin (replace with your email)
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@eternalmemorial.com';

-- Verify
SELECT id, email, role, is_verified FROM profiles WHERE role = 'admin';
```

---

## Step 2: Test Admin Access

### Current Flow:
```
1. User logs in with admin credentials
   ↓
2. AdminLogin function checks role
   ↓
3. If role = 'admin', allow access
   ↓
4. Navigate to /admin
   ↓
5. AdminDashboard loads
```

### Testing Checklist:
- [ ] Register a new account
- [ ] Upgrade to admin in database
- [ ] Logout and login again
- [ ] Should redirect to `/admin`
- [ ] Should see Admin Dashboard

---

## Step 3: Admin Functions Overview

### A. Overview Tab
**What it shows:**
- Total plots: `{realisticStats.total}`
- Occupied plots: `{realisticStats.occupied}`
- Available plots: `{realisticStats.available}`
- Reserved plots: `{realisticStats.reserved}`
- Exhumed plots: `{realisticStats.exhumed}`

**What it does:**
- Display cemetery statistics
- Quick overview of plot status
- Real-time data from database

**Integration needed:**
✅ Already integrated with `DataService.getPlotStats()`

---

### B. Manage Plots Tab
**What it shows:**
- List of all plots
- Search functionality
- Plot details (occupant, status, section, level)

**What it does:**
- **Create Plot**: `handleCreatePlot(plotData)`
- **Update Plot**: `handleUpdatePlot(plotId, updateData)`
- **Delete Plot**: `handleDeletePlot(plotId)`
- **Search Plots**: Filter by name, plot ID, section

**Integration needed:**
✅ Already integrated with `DataService` methods

---

### C. Cemetery Map Tab
**What it shows:**
- Visual representation of cemetery
- All sections and plots
- Interactive map

**What it does:**
- Click on plots to view details
- Visual plot management
- 3D view toggle

**Integration needed:**
✅ Uses `HardcodedCemeteryMap` component

---

### D. Exhumation Management Tab
**What it shows:**
- Exhumation requests
- Request status
- Approval/rejection interface

**What it does:**
- View exhumation requests
- Approve/reject requests
- Track exhumation history

**Integration needed:**
✅ Uses `ExhumationManagement` component

---

## Step 4: Additional Admin Features to Add

### 1. User Management (NEW)
**Purpose**: Manage registered users

**Features:**
- View all users
- Enable/disable accounts
- Reset passwords
- View user activity

**SQL for Users Table:**
```sql
-- View all users
SELECT 
  p.id,
  p.email,
  p.role,
  p.first_name,
  p.last_name,
  p.is_verified,
  p.created_at,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Count users by role
SELECT role, COUNT(*) as count
FROM profiles
GROUP BY role;
```

---

### 2. Reports & Analytics (NEW)
**Purpose**: Generate reports and analytics

**Features:**
- Plot occupancy trends
- Revenue reports
- Burial statistics
- Export to PDF/Excel

**Metrics to track:**
- Monthly burials
- Plot utilization rate
- Revenue per month
- Peak burial months

---

### 3. Audit Logs (NEW)
**Purpose**: Track admin actions

**Features:**
- Log all admin actions
- View action history
- Filter by admin user
- Filter by action type

**SQL for Audit Logs:**
```sql
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

### 4. Settings (NEW)
**Purpose**: Configure system settings

**Features:**
- Cemetery information
- Pricing configuration
- Email templates
- System preferences

---

## Step 5: Quick Start Integration

### Test Admin Login Now:

1. **Register an account** (if you haven't):
   - Use email: `admin@eternalmemorial.com`
   - Use a strong password

2. **Run this SQL** in Supabase:
```sql
-- Upgrade your account to admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'amoromonste@gmail.com';

-- Verify
SELECT * FROM profiles WHERE email = 'amoromonste@gmail.com';
```

3. **Clear browser cache:**
```javascript
localStorage.clear();
location.reload();
```

4. **Login again**

5. **You should see:**
   - Admin Dashboard at `/admin`
   - All admin tabs working
   - Statistics loading from database

---

## Step 6: Testing Admin Functions

### Test Checklist:

#### Overview Tab:
- [ ] Statistics load correctly
- [ ] Numbers match database
- [ ] Real-time updates

#### Manage Plots Tab:
- [ ] Can create new plot
- [ ] Can update plot status
- [ ] Can delete plot
- [ ] Search works
- [ ] Filter works

#### Cemetery Map Tab:
- [ ] Map loads
- [ ] Can click on plots
- [ ] Plot details show
- [ ] 3D view works

#### Exhumation Tab:
- [ ] Requests load
- [ ] Can approve request
- [ ] Can reject request
- [ ] Status updates

---

## Step 7: Database Schema for Admin Functions

### Required Tables:

1. ✅ **profiles** - User accounts (already exists)
2. ✅ **plots** - Cemetery plots (already exists)
3. ✅ **exhumation_requests** - Exhumation requests (already exists)
4. ❌ **audit_logs** - Admin action logs (needs creation)
5. ❌ **system_settings** - System configuration (needs creation)

### Create Missing Tables:

```sql
-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage settings" ON system_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## Step 8: Production Deployment Checklist

### Before Deploying Admin Functions:

- [ ] Create admin account
- [ ] Test all admin functions locally
- [ ] Verify database policies (RLS)
- [ ] Test on different browsers
- [ ] Test mobile responsiveness
- [ ] Create admin user guide
- [ ] Set up error monitoring
- [ ] Configure backup admin account

### Security Checklist:

- [ ] Admin routes protected
- [ ] Role-based access control working
- [ ] Audit logging enabled
- [ ] Strong admin passwords enforced
- [ ] 2FA for admin accounts (optional)
- [ ] IP whitelist for admin (optional)
- [ ] Session timeout configured

---

## Next Steps:

1. **Test Current Admin Functions:**
   - Upgrade your account to admin
   - Test all existing features
   - Verify database integration

2. **Add Missing Features** (if needed):
   - User management
   - Audit logs
   - Reports
   - Settings

3. **Deploy to Production:**
   - Follow `VERCEL_DEPLOYMENT_GUIDE.md`
   - Test admin functions in production
   - Monitor for errors

---

## Quick Command Reference:

### Create Admin:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### View Admin Users:
```sql
SELECT * FROM profiles WHERE role = 'admin';
```

### View All Plots:
```sql
SELECT * FROM plots ORDER BY created_at DESC;
```

### View Exhumation Requests:
```sql
SELECT * FROM exhumation_requests ORDER BY created_at DESC;
```

---

**Your admin system is ready to use!** 🎉

Just upgrade your account to admin and start managing the cemetery!



