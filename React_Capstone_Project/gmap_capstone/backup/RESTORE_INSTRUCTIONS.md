# RESTORE INSTRUCTIONS - CEMETERY SYSTEM

## Quick Restore (When System Fails)

### Step 1: Stop the Development Server
```bash
# Press Ctrl+C in terminal to stop npm run dev
```

### Step 2: Restore Key Files
```bash
# Copy working files back to their original locations
cp backup/AdminDashboard_WORKING.jsx src/pages/AdminDashboard.jsx
cp backup/HierarchicalCemeteryMap_WORKING.jsx src/components/HierarchicalCemeteryMap.jsx
cp backup/AuthContext_WORKING.jsx src/contexts/AuthContext.jsx
cp backup/package.json_WORKING package.json
```

### Step 3: Remove Database Files (If Any)
```bash
# Remove any database-related files that might have been added
rm -rf src/firebase/
rm -rf src/supabase/
rm -rf src/database/
rm -f src/hooks/usePlots.js
rm -f src/hooks/useSupabasePlots.js
rm -f src/hooks/useCemeteryDB.js
rm -f src/components/SupabaseTest.jsx
rm -f src/components/FirebaseTest.jsx
rm -f supabase-schema.sql
rm -f SUPABASE_SETUP.md
```

### Step 4: Reinstall Dependencies
```bash
npm install
```

### Step 5: Start Development Server
```bash
npm run dev
```

## What Gets Restored

✅ **AdminDashboard.jsx** - Local Filipino data, no database calls
✅ **HierarchicalCemeteryMap.jsx** - Local data, all sections clickable
✅ **AuthContext.jsx** - Simple admin login, no isLoading state
✅ **package.json** - Only React dependencies, no database packages

## Verification Checklist

After restore, verify:
- [ ] Home page loads at localhost:5173
- [ ] Map page loads with interactive cemetery map
- [ ] All sections are clickable (left-pasilyo, right-pasilyo, left-block, right-block, apartment, fetus-crematorium)
- [ ] Admin dashboard loads with Filipino data (Maria Santos, Jose dela Cruz, Pedro Gonzales, Carmen Villanueva)
- [ ] Plot editing modal works
- [ ] No blank screens
- [ ] No console errors
- [ ] Admin login works (admin/admin123)

## Data Structure (DO NOT CHANGE)

```javascript
const plots = [
  {
    id: 1,
    name: "Maria Santos",
    plot: "LSP-8-2", 
    section: "Left Side Pasilyo",
    dateOfInterment: "2023-01-15",
    status: "occupied",
    notes: "Family plot"
  },
  // ... more plots with same structure
];
```

## Critical Success Factors

1. **NO database imports** in any component
2. **NO useSupabasePlots, useFirebasePlots, or any database hooks**
3. **Local data arrays** with original field names (name, plot, section, dateOfInterment, status, notes)
4. **Simple authentication** without loading states
5. **All property names match** between components

---

**REMEMBER:** This system works perfectly. When database integration fails, revert to this exact state using these instructions.



