# System Flowchart - Cemetery Management System

## Overview
This flowchart shows the complete user journey for both guest users and administrators in the Cemetery Management System. It illustrates the decision points, authentication flows, and key interactions with the interactive map and plot management features.

## Legend
- 🟦 **Process**: System actions or operations
- 🔵 **Decision**: User choices or system validation points
- 🟢 **Start/End**: Entry and exit points
- 🔴 **External**: External entities or systems

## System Flowchart

```mermaid
flowchart TD
    Start([🟢 User Visits Website]) --> Home{User Type?}
    
    %% Guest User Flow
    Home -->|Guest User| HomePage[🟦 Home Page<br/>- View Hero Section<br/>- View Features<br/>- Access Map]
    HomePage --> MapAccess[🟦 Navigate to Map]
    MapAccess --> MapPage[🟦 Map Page<br/>- Search Cemetery<br/>- View Interactive Map]
    
    MapPage --> SearchDecision{Search for Loved One?}
    SearchDecision -->|Yes| SearchInput[🟦 Enter Search Terms<br/>- Name<br/>- Plot Number<br/>- Section]
    SearchDecision -->|No| MapView[🟦 View Interactive Map]
    
    SearchInput --> SearchProcess[🟦 Search Process<br/>- Filter cemetery data<br/>- Display results]
    SearchProcess --> SearchResults{Results Found?}
    SearchResults -->|Yes| ViewResults[🟦 View Search Results<br/>- Plot details<br/>- Location info]
    SearchResults -->|No| NoResults[🟦 No Results Message<br/>- Search suggestions]
    
    MapView --> SectionClick[🟦 Click Cemetery Section]
    SectionClick --> SectionView[🟦 View Section Details<br/>- Plot grid<br/>- Status legend<br/>- Level selector]
    SectionView --> PlotClick{Click Plot?}
    PlotClick -->|Yes| PlotDetails[🟦 View Plot Details<br/>- Occupant info<br/>- Status<br/>- Notes]
    PlotClick -->|No| SectionView
    
    PlotDetails --> ExhumationDecision{Request Exhumation?}
    ExhumationDecision -->|Yes| ExhumationModal[🟦 Exhumation Request Modal<br/>- Fill form<br/>- Submit request]
    ExhumationDecision -->|No| SectionView
    
    ExhumationModal --> ExhumationSubmit[🟦 Submit Request<br/>- Store in context<br/>- Show confirmation]
    ExhumationSubmit --> EndGuest([🟢 Guest Session Complete])
    
    %% Admin User Flow
    Home -->|Admin User| AdminLogin[🟦 Admin Login<br/>- Username: admin<br/>- Password: admin123]
    AdminLogin --> AuthCheck{Valid Credentials?}
    AuthCheck -->|No| LoginError[🟦 Login Error<br/>- Invalid credentials message]
    AuthCheck -->|Yes| AuthSuccess[🟦 Authentication Success<br/>- Set isAdmin: true<br/>- Store in localStorage]
    
    LoginError --> AdminLogin
    AuthSuccess --> AdminDashboard[🟦 Admin Dashboard<br/>- View statistics<br/>- Manage plots<br/>- Review exhumations]
    
    AdminDashboard --> AdminAction{Admin Action?}
    AdminAction -->|Manage Plots| PlotManagement[🟦 Plot Management<br/>- Add new plots<br/>- Edit existing plots<br/>- Delete plots<br/>- Update plot status]
    AdminAction -->|Review Exhumations| ExhumationManagement[🟦 Exhumation Management<br/>- View pending requests<br/>- Approve/reject requests<br/>- Update status<br/>- Add notes]
    AdminAction -->|View Map| AdminMapView[🟦 Admin Map View<br/>- Interactive map<br/>- Click to edit plots]
    
    PlotManagement --> PlotAction{Plot Action?}
    PlotAction -->|Add Plot| AddPlotModal[🟦 Add Plot Modal<br/>- Select section/level<br/>- Enter plot details<br/>- Save to database]
    PlotAction -->|Edit Plot| EditPlotModal[🟦 Edit Plot Modal<br/>- Update occupant info<br/>- Change status<br/>- Save changes]
    PlotAction -->|Delete Plot| DeleteConfirm{Confirm Deletion?}
    
    AddPlotModal --> SupabaseCreate[🟦 Create Plot in Supabase<br/>- Insert new record<br/>- Update local state]
    EditPlotModal --> SupabaseUpdate[🟦 Update Plot in Supabase<br/>- Modify existing record<br/>- Update local state]
    DeleteConfirm -->|Yes| SupabaseDelete[🟦 Delete Plot from Supabase<br/>- Remove record<br/>- Update local state]
    DeleteConfirm -->|No| PlotManagement
    
    SupabaseCreate --> PlotManagement
    SupabaseUpdate --> PlotManagement
    SupabaseDelete --> PlotManagement
    
    ExhumationManagement --> ExhumationAction{Exhumation Action?}
    ExhumationAction -->|Approve| ApproveRequest[🟦 Approve Request<br/>- Change status to approved<br/>- Set exhumation date<br/>- Assign team]
    ExhumationAction -->|Reject| RejectRequest[🟦 Reject Request<br/>- Change status to rejected<br/>- Add rejection notes]
    ExhumationAction -->|Complete| CompleteExhumation[🟦 Mark Complete<br/>- Change status to completed<br/>- Update plot status]
    
    ApproveRequest --> UpdateExhumationStatus[🟦 Update Exhumation Status<br/>- Modify context state<br/>- Update display]
    RejectRequest --> UpdateExhumationStatus
    CompleteExhumation --> UpdateExhumationStatus
    UpdateExhumationStatus --> ExhumationManagement
    
    AdminMapView --> AdminSectionClick[🟦 Click Section (Admin)]
    AdminSectionClick --> AdminSectionView[🟦 Admin Section View<br/>- Edit plot capabilities<br/>- Status management]
    AdminSectionView --> AdminPlotClick{Click Plot (Admin)?}
    AdminPlotClick -->|Yes| AdminPlotEdit[🟦 Edit Plot Details<br/>- Open edit modal<br/>- Modify plot data]
    AdminPlotClick -->|No| AdminSectionView
    
    AdminPlotEdit --> PlotAction
    
    %% Logout Flow
    AdminDashboard --> LogoutDecision{Logout?}
    LogoutDecision -->|Yes| LogoutProcess[🟦 Logout Process<br/>- Clear localStorage<br/>- Reset isAdmin: false<br/>- Redirect to home]
    LogoutDecision -->|No| AdminAction
    
    LogoutProcess --> EndAdmin([🟢 Admin Session Complete])
    
    %% Common End Points
    NoResults --> MapView
    ViewResults --> MapView
    
    %% Styling
    classDef processBox fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef decisionBox fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    classDef startEndBox fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef externalBox fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    
    class HomePage,MapPage,SearchInput,SearchProcess,SectionClick,SectionView,PlotDetails,ExhumationModal,ExhumationSubmit,AdminLogin,AuthSuccess,AdminDashboard,PlotManagement,ExhumationManagement,AdminMapView,AddPlotModal,EditPlotModal,SupabaseCreate,SupabaseUpdate,SupabaseDelete,ApproveRequest,RejectRequest,CompleteExhumation,UpdateExhumationStatus,AdminSectionClick,AdminSectionView,AdminPlotEdit,LogoutProcess processBox
    
    class Home,SearchDecision,SearchResults,PlotClick,ExhumationDecision,AuthCheck,AdminAction,PlotAction,DeleteConfirm,ExhumationAction,AdminPlotClick,LogoutDecision decisionBox
    
    class Start,EndGuest,EndAdmin startEndBox
    
    class LoginError,NoResults,ViewResults externalBox
```

## Key Features Documented

### Guest User Journey
1. **Home Page Access**: View cemetery information and features
2. **Search Functionality**: Find loved ones by name, plot, or section
3. **Interactive Map**: Navigate cemetery sections and view plot details
4. **Exhumation Requests**: Submit requests for occupied plots

### Admin User Journey
1. **Authentication**: Secure admin login with credentials
2. **Dashboard Management**: View statistics and manage system
3. **Plot CRUD Operations**: Create, read, update, delete cemetery plots
4. **Exhumation Management**: Review and process exhumation requests
5. **Real-time Updates**: Synchronize with Supabase database

### System Integration Points
- **Supabase Database**: All plot data persistence
- **LocalStorage**: Admin authentication state
- **React Context**: Exhumation request management
- **SVG Map**: Interactive cemetery visualization



