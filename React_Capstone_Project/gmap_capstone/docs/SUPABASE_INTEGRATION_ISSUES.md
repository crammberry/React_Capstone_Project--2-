# SUPABASE INTEGRATION ISSUES - LESSONS LEARNED

## Problems Encountered

### 1. **Section Name Mismatch**
- **Issue**: SVG element IDs didn't match database section names
- **Example**: SVG had `left-pasilyo-2` but database expected `left-pasilyo-2`
- **Solution**: Need proper mapping function between SVG IDs and database sections

### 2. **Event Listener Loss**
- **Issue**: After clicking sections and returning to map, event listeners were lost
- **Cause**: Event listeners were not re-setup when returning to overview
- **Solution**: Add useEffect to re-setup event listeners when `currentView === 'overview'`

### 3. **Data Structure Mismatch**
- **Issue**: React components expected different field names than database
- **Example**: Component used `name`, `plot`, `section` but database used `occupant_name`, `plot_number`, `section`
- **Solution**: Need consistent field mapping or data transformation layer

### 4. **Complex State Management**
- **Issue**: Adding Supabase hooks created complex state dependencies
- **Problem**: `useEffect` dependencies became complex with `[selectedSection, currentLevel, plots]`
- **Solution**: Keep data loading simple and separate from UI state

### 5. **Performance Issues**
- **Issue**: Multiple database calls and complex filtering
- **Problem**: Every section click triggered database queries
- **Solution**: Cache data locally and only refresh when needed

## Working Solution (Current State)

### ✅ **What Works**
- Local data with Filipino names (Maria Santos, Jose dela Cruz, etc.)
- All sections clickable (left-pasilyo, right-pasilyo, left-block, right-block, apartment, fetus-crematorium)
- Proper scroll functions for apartments and alleys
- Plot editing modal works
- Admin authentication works
- No blank screens
- No console errors

### 🔧 **Key Components**
- `HierarchicalCemeteryMap.jsx` - Main map component with local data
- `AdminDashboard.jsx` - Admin interface with local data
- `AuthContext.jsx` - Simple admin login
- Local data arrays with consistent field names

## Future Supabase Integration Plan

### Phase 1: Data Layer
1. Create data transformation layer to map database fields to component fields
2. Implement caching to avoid repeated database calls
3. Add proper error handling for database failures

### Phase 2: Gradual Migration
1. Start with read-only data (plots display)
2. Add write operations (plot editing)
3. Add real-time updates
4. Add advanced features (search, filtering)

### Phase 3: Testing
1. Test each feature individually
2. Ensure fallback to local data if database fails
3. Maintain working backup at each step

## Critical Success Factors

1. **NEVER break the working local data system**
2. **Always maintain backup files**
3. **Test each change incrementally**
4. **Keep data structures consistent**
5. **Add proper error handling and fallbacks**

## Database Schema Requirements

```sql
-- Ensure these field names match component expectations
CREATE TABLE plots (
    id UUID PRIMARY KEY,
    plot_id VARCHAR(100) UNIQUE NOT NULL,
    section VARCHAR(50) NOT NULL,           -- Must match SVG element IDs
    level INTEGER NOT NULL,
    plot_number VARCHAR(20) NOT NULL,       -- A1, A2, etc.
    status VARCHAR(20) DEFAULT 'available',
    occupant_name VARCHAR(255) DEFAULT '',  -- Maps to 'name' in component
    date_of_interment DATE DEFAULT NULL,    -- Maps to 'dateOfInterment'
    notes TEXT DEFAULT '',                  -- Maps to 'notes'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Section Name Mapping

```javascript
// SVG ID -> Database Section Name
const sectionMapping = {
  'left-pasilyo-1': 'left-pasilyo-1',
  'left-pasilyo-2': 'left-pasilyo-2',
  'right-pasilyo-1': 'right-pasilyo-1',
  'left-block-1': 'left-block-1',
  'right-block-1': 'right-block-1',
  'apartment-1': 'apartment-1',
  'fetus-crematorium': 'fetus-crematorium',
  'alley-1': 'alley-1'
};
```

---

**REMEMBER**: The current system works perfectly. When integrating Supabase, do it gradually and always maintain the working backup!



