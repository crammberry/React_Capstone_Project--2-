# Supabase Setup Guide - Cemetery Management System

## 🎯 **What We've Built**

Your cemetery system now uses Supabase with the **exact same structure** as your working system:

- **Sections**: left-side-pasilyo, right-side-pasilyo, left-block, right-block, apartment, fetus-crematorium
- **Levels**: Each section has multiple levels (1, 2, 3, etc.)
- **Plots**: Each level has plots (A1-A8, A1-A25, T1-T13, R1-R12)

## 📋 **Setup Steps**

### Step 1: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and login
2. Go to your project dashboard
3. Click **Settings** → **API**
4. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Public Key**: `your-anon-key`

### Step 2: Update Configuration

Edit `src/supabase/config.js`:

```javascript
const supabaseUrl = 'https://YOUR-PROJECT-ID.supabase.co'  // Replace with your Project URL
const supabaseKey = 'YOUR-ANON-KEY'  // Replace with your Public Key
```

### Step 3: Create Database Schema

1. Go to your Supabase project dashboard
2. Click **SQL Editor**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** to create the database structure

### Step 4: Test the System

```bash
npm run dev
```

Visit `localhost:5173` and test:
- ✅ Home page loads
- ✅ Map page loads with clickable sections
- ✅ Admin dashboard loads with database data
- ✅ Plot editing works with real data

## 🏗️ **Database Structure**

### Plots Table
```sql
plots (
  id UUID PRIMARY KEY,
  plot_id VARCHAR(100) UNIQUE,     -- e.g., "left-side-pasilyo-8-level1-A1"
  section VARCHAR(50),             -- e.g., "left-side-pasilyo"
  level INTEGER,                   -- e.g., 1, 2, 3
  plot_number VARCHAR(20),         -- e.g., "A1", "A2", "T1", "R1"
  status VARCHAR(20),              -- available, occupied, reserved, exhumed
  occupant_name VARCHAR(255),      -- Name of deceased
  date_of_interment DATE,          -- When buried
  notes TEXT,                      -- Additional notes
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Sample Data Included
The schema includes sample plots for:
- **Left Side Pasilyo**: A1-A8 (level 1)
- **Right Side Pasilyo**: A1-A8 (level 1)  
- **Left Block**: A1-A8 (level 1)
- **Right Block**: A1-A8 (level 1)
- **Apartments**: A1-A25 (level 1)
- **Fetus-Crematorium**: T1-T13, R1-R12

## 🔧 **Features**

### Admin Dashboard
- View all plots with real-time data from Supabase
- Search plots by name, plot number, or section
- Edit plot information (occupant name, status, notes)
- Real-time statistics (total, available, occupied, reserved)

### Interactive Map
- Click any section to see plots for that section
- View plots by level (for multi-level sections)
- Edit individual plots by clicking them (admin only)
- Real-time status updates with color coding

### Plot Management
- **Available** (Green): Ready for new occupants
- **Occupied** (Red): Currently occupied
- **Reserved** (Yellow): Reserved for future use
- **Exhumed** (Gray): Previously occupied, now exhumed

## 🚨 **If Something Goes Wrong**

### Quick Restore to Working State
```bash
# Stop the server (Ctrl+C)
cp backup/AdminDashboard_WORKING.jsx src/pages/AdminDashboard.jsx
cp backup/HierarchicalCemeteryMap_WORKING.jsx src/components/HierarchicalCemeteryMap.jsx
cp backup/AuthContext_WORKING.jsx src/contexts/AuthContext.jsx
cp backup/package.json_WORKING package.json
npm install
npm run dev
```

### Common Issues
1. **Blank Screen**: Check Supabase credentials in `config.js`
2. **Database Error**: Make sure you ran the SQL schema
3. **Connection Issues**: Check your internet connection and Supabase project status

## 📊 **Data Migration**

Your existing plot structure is preserved:
- **Section Names**: Exactly as they were
- **Plot Numbers**: A1-A8, A1-A25, T1-T13, R1-R12
- **Levels**: Multi-level support maintained
- **Status**: Available, Occupied, Reserved, Exhumed

## 🎉 **Success Indicators**

When everything works:
- Admin dashboard shows real plot counts from database
- Map sections are clickable and show real plot data
- Plot editing saves to database and updates immediately
- System status shows "Connected to Supabase database"

---

**Your cemetery system is now database-powered while maintaining the exact same functionality!**



