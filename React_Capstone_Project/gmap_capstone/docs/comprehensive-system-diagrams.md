# Cemetery Management System - Comprehensive Visual Diagrams

## Overview
This document contains three comprehensive visual diagrams that document the complete Cemetery Management System architecture, data flows, and database structure.

---

## 1. System Flowchart - User Journey & Process Flow

This flowchart shows the complete user experience for both guest users and administrators, including all decision points and system processes.

```mermaid
flowchart TD
    Start([🏠 User Visits Website]) --> UserType{User Type?}
    
    %% Guest User Flow
    UserType -->|Guest User| HomePage[🏠 Home Page<br/>• View Hero Section<br/>• View Features<br/>• Access Map]
    HomePage --> MapAccess[🗺️ Navigate to Map]
    MapAccess --> MapPage[🗺️ Map Page<br/>• Search Cemetery<br/>• View Interactive Map<br/>• Plot Status Legend]
    
    MapPage --> SearchChoice{Search for Loved One?}
    SearchChoice -->|Yes| SearchInput[🔍 Enter Search Terms<br/>• Name<br/>• Plot Number<br/>• Section]
    SearchChoice -->|No| MapView[🗺️ View Interactive Map]
    
    SearchInput --> SearchProcess[🔍 Search Process<br/>• Filter cemetery data<br/>• Display results<br/>• Show plot details]
    SearchProcess --> SearchResults{Results Found?}
    SearchResults -->|Yes| ViewResults[📋 View Search Results<br/>• Plot details<br/>• Location info<br/>• Status badges]
    SearchResults -->|No| NoResults[❌ No Results Message<br/>• Search suggestions<br/>• Alternative options]
    
    MapView --> SectionClick[🖱️ Click Cemetery Section]
    SectionClick --> SectionView[🏗️ View Section Details<br/>• Plot grid display<br/>• Status legend<br/>• Level selector]
    SectionView --> PlotClick{Click Plot?}
    PlotClick -->|Yes| PlotDetails[📊 View Plot Details<br/>• Occupant info<br/>• Status<br/>• Notes<br/>• Date of interment]
    PlotClick -->|No| SectionView
    
    PlotDetails --> ExhumationDecision{Request Exhumation?}
    ExhumationDecision -->|Yes| ExhumationModal[📝 Exhumation Request Modal<br/>• Fill form<br/>• Deceased info<br/>• Next of kin<br/>• Contact details<br/>• Reason for request]
    ExhumationDecision -->|No| SectionView
    
    ExhumationModal --> ExhumationSubmit[✅ Submit Request<br/>• Store in context<br/>• Show confirmation<br/>• Send notification]
    ExhumationSubmit --> EndGuest([✅ Guest Session Complete])
    
    %% Admin User Flow
    UserType -->|Admin User| AdminLogin[🔐 Admin Login<br/>• Username: admin<br/>• Password: admin123]
    AdminLogin --> AuthCheck{Valid Credentials?}
    AuthCheck -->|No| LoginError[❌ Login Error<br/>• Invalid credentials<br/>• Retry option]
    AuthCheck -->|Yes| AuthSuccess[✅ Authentication Success<br/>• Set isAdmin: true<br/>• Store in localStorage<br/>• Grant admin access]
    
    LoginError --> AdminLogin
    AuthSuccess --> AdminDashboard[🏢 Admin Dashboard<br/>• View statistics<br/>• Manage plots<br/>• Review exhumations<br/>• System overview]
    
    AdminDashboard --> AdminAction{Admin Action?}
    AdminAction -->|Manage Plots| PlotManagement[🏗️ Plot Management<br/>• Add new plots<br/>• Edit existing plots<br/>• Delete plots<br/>• Update plot status<br/>• CRUD operations]
    AdminAction -->|Review Exhumations| ExhumationManagement[📋 Exhumation Management<br/>• View pending requests<br/>• Approve/reject requests<br/>• Update status<br/>• Add notes<br/>• Schedule exhumations]
    AdminAction -->|View Map| AdminMapView[🗺️ Admin Map View<br/>• Interactive map<br/>• Click to edit plots<br/>• Real-time updates]
    
    PlotManagement --> PlotAction{Plot Action?}
    PlotAction -->|Add Plot| AddPlotModal[➕ Add Plot Modal<br/>• Select section/level<br/>• Enter plot details<br/>• Set initial status<br/>• Save to database]
    PlotAction -->|Edit Plot| EditPlotModal[✏️ Edit Plot Modal<br/>• Update occupant info<br/>• Change status<br/>• Modify notes<br/>• Save changes]
    PlotAction -->|Delete Plot| DeleteConfirm{Confirm Deletion?}
    
    AddPlotModal --> SupabaseCreate[💾 Create Plot in Supabase<br/>• Insert new record<br/>• Update local state<br/>• Sync with database]
    EditPlotModal --> SupabaseUpdate[💾 Update Plot in Supabase<br/>• Modify existing record<br/>• Update local state<br/>• Real-time sync]
    DeleteConfirm -->|Yes| SupabaseDelete[🗑️ Delete Plot from Supabase<br/>• Remove record<br/>• Update local state<br/>• Clean up references]
    DeleteConfirm -->|No| PlotManagement
    
    SupabaseCreate --> PlotManagement
    SupabaseUpdate --> PlotManagement
    SupabaseDelete --> PlotManagement
    
    ExhumationManagement --> ExhumationAction{Exhumation Action?}
    ExhumationAction -->|Approve| ApproveRequest[✅ Approve Request<br/>• Change status to approved<br/>• Set exhumation date<br/>• Assign team<br/>• Send notification]
    ExhumationAction -->|Reject| RejectRequest[❌ Reject Request<br/>• Change status to rejected<br/>• Add rejection notes<br/>• Notify requester]
    ExhumationAction -->|Complete| CompleteExhumation[🏁 Mark Complete<br/>• Change status to completed<br/>• Update plot status<br/>• Finalize process]
    
    ApproveRequest --> UpdateExhumationStatus[🔄 Update Exhumation Status<br/>• Modify context state<br/>• Update display<br/>• Sync changes]
    RejectRequest --> UpdateExhumationStatus
    CompleteExhumation --> UpdateExhumationStatus
    UpdateExhumationStatus --> ExhumationManagement
    
    AdminMapView --> AdminSectionClick[🖱️ Click Section (Admin)]
    AdminSectionClick --> AdminSectionView[🏗️ Admin Section View<br/>• Edit plot capabilities<br/>• Status management<br/>• Quick actions]
    AdminSectionView --> AdminPlotClick{Click Plot (Admin)?}
    AdminPlotClick -->|Yes| AdminPlotEdit[✏️ Edit Plot Details<br/>• Open edit modal<br/>• Modify plot data<br/>• Save changes]
    AdminPlotClick -->|No| AdminSectionView
    
    AdminPlotEdit --> PlotAction
    
    %% Logout Flow
    AdminDashboard --> LogoutDecision{Logout?}
    LogoutDecision -->|Yes| LogoutProcess[🚪 Logout Process<br/>• Clear localStorage<br/>• Reset isAdmin: false<br/>• Redirect to home<br/>• End session]
    LogoutDecision -->|No| AdminAction
    
    LogoutProcess --> EndAdmin([✅ Admin Session Complete])
    
    %% Common End Points
    NoResults --> MapView
    ViewResults --> MapView
    
    %% Styling
    classDef processBox fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000,font-weight:bold
    classDef decisionBox fill:#fff3e0,stroke:#f57c00,stroke-width:3px,color:#000,font-weight:bold
    classDef startEndBox fill:#e8f5e8,stroke:#388e3c,stroke-width:3px,color:#000,font-weight:bold
    classDef errorBox fill:#ffebee,stroke:#d32f2f,stroke-width:3px,color:#000,font-weight:bold
    classDef databaseBox fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000,font-weight:bold
    
    class HomePage,MapAccess,MapPage,SearchInput,SearchProcess,SectionClick,SectionView,PlotDetails,ExhumationModal,ExhumationSubmit,AdminLogin,AuthSuccess,AdminDashboard,PlotManagement,ExhumationManagement,AdminMapView,AddPlotModal,EditPlotModal,SupabaseCreate,SupabaseUpdate,SupabaseDelete,ApproveRequest,RejectRequest,CompleteExhumation,UpdateExhumationStatus,AdminSectionClick,AdminSectionView,AdminPlotEdit,LogoutProcess processBox
    
    class UserType,SearchChoice,SearchResults,PlotClick,ExhumationDecision,AuthCheck,AdminAction,PlotAction,DeleteConfirm,ExhumationAction,AdminPlotClick,LogoutDecision decisionBox
    
    class Start,EndGuest,EndAdmin startEndBox
    
    class LoginError,NoResults,ViewResults errorBox
    
    class SupabaseCreate,SupabaseUpdate,SupabaseDelete databaseBox
```

---

## 2. Data Flow Diagram - System Architecture & Data Movement

This Level 1 Data Flow Diagram shows how data moves through the Cemetery Management System between processes, data stores, and external entities.

```mermaid
flowchart TD
    %% External Entities
    GuestUser([👤 Guest User<br/>• Search for loved ones<br/>• View cemetery map<br/>• Request exhumations])
    AdminUser([👤 Admin User<br/>• Manage plots<br/>• Review exhumations<br/>• System administration])
    SupabaseDB([🗃️ Supabase Database<br/>• PostgreSQL backend<br/>• Real-time sync<br/>• Data persistence])
    
    %% Main Processes
    AuthProcess[🟦 1.0 Authentication Process<br/>• Validate credentials<br/>• Manage session state<br/>• Handle login/logout]
    PlotManagement[🟦 2.0 Plot Management Process<br/>• CRUD operations<br/>• Status updates<br/>• Data validation]
    SearchProcess[🟦 3.0 Search & Discovery Process<br/>• Filter plot data<br/>• Generate results<br/>• Optimize queries]
    ExhumationProcess[🟦 4.0 Exhumation Request Process<br/>• Handle requests<br/>• Status management<br/>• Notifications]
    MapRendering[🟦 5.0 Map Rendering Process<br/>• Generate map data<br/>• Plot visualization<br/>• Interactive features]
    
    %% Data Stores
    AuthStore[(🗃️ D1: Auth Context<br/>• isAdmin boolean<br/>• login status<br/>• session data)]
    ExhumationStore[(🗃️ D2: Exhumation Context<br/>• request data<br/>• status updates<br/>• plot associations)]
    PlotStore[(🗃️ D3: Plots Table<br/>• plot_id<br/>• section, level<br/>• status, occupant<br/>• timestamps)]
    LocalStorage[(🗃️ D4: Local Storage<br/>• persistent auth<br/>• user preferences<br/>• session data)]
    
    %% Guest User Data Flows
    GuestUser -->|"search_query<br/>(name, plot, section)"| SearchProcess
    GuestUser -->|"view_request<br/>(plot details)"| MapRendering
    GuestUser -->|"exhumation_request<br/>(deceased info, contact, reason)"| ExhumationProcess
    
    SearchProcess -->|"search_results<br/>(matching plots, details)"| GuestUser
    MapRendering -->|"map_data<br/>(sections, plots, status)"| GuestUser
    ExhumationProcess -->|"confirmation<br/>(request submitted)"| GuestUser
    
    %% Admin User Data Flows
    AdminUser -->|"login_credentials<br/>(username, password)"| AuthProcess
    AdminUser -->|"plot_operations<br/>(create, update, delete)"| PlotManagement
    AdminUser -->|"exhumation_review<br/>(approve, reject, complete)"| ExhumationProcess
    AdminUser -->|"admin_map_access<br/>(edit plots)"| MapRendering
    
    AuthProcess -->|"auth_result<br/>(success/failure)"| AdminUser
    PlotManagement -->|"plot_data<br/>(updated plot info)"| AdminUser
    ExhumationProcess -->|"review_results<br/>(status updates)"| AdminUser
    MapRendering -->|"admin_map_data<br/>(editable plots)"| AdminUser
    
    %% Authentication Data Flows
    AuthProcess <-->|"auth_state<br/>(isAdmin: boolean)"| AuthStore
    AuthProcess <-->|"persistent_auth<br/>(localStorage data)"| LocalStorage
    
    %% Plot Management Data Flows
    PlotManagement <-->|"plot_operations<br/>(CRUD operations)"| PlotStore
    PlotStore <-->|"plot_data<br/>(all plot records)"| SupabaseDB
    PlotManagement <-->|"plot_state<br/>(local plot data)"| ExhumationStore
    
    %% Search Process Data Flows
    SearchProcess <-->|"search_data<br/>(filtered plots)"| PlotStore
    SearchProcess <-->|"section_data<br/>(plot groupings)"| PlotStore
    
    %% Exhumation Process Data Flows
    ExhumationProcess <-->|"exhumation_data<br/>(requests, status)"| ExhumationStore
    ExhumationProcess <-->|"plot_association<br/>(plot_id references)"| PlotStore
    
    %% Map Rendering Data Flows
    MapRendering <-->|"map_plot_data<br/>(section plots)"| PlotStore
    MapRendering <-->|"plot_status<br/>(available, occupied, etc.)"| PlotStore
    MapRendering <-->|"section_info<br/>(plot layouts)"| PlotStore
    
    %% External Database Connections
    PlotStore -.->|"real_time_sync<br/>(plot updates)"| SupabaseDB
    SupabaseDB -.->|"data_changes<br/>(insert, update, delete)"| PlotStore
    
    %% Styling
    classDef processBox fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000,font-weight:bold
    classDef dataStoreBox fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000,font-weight:bold
    classDef externalBox fill:#e8f5e8,stroke:#388e3c,stroke-width:3px,color:#000,font-weight:bold
    classDef databaseBox fill:#fff3e0,stroke:#f57c00,stroke-width:3px,color:#000,font-weight:bold
    
    class AuthProcess,PlotManagement,SearchProcess,ExhumationProcess,MapRendering processBox
    class AuthStore,ExhumationStore,PlotStore,LocalStorage dataStoreBox
    class GuestUser,AdminUser externalBox
    class SupabaseDB databaseBox
```

---

## 3. Database Diagram - Entity Relationship & Schema

This Entity-Relationship Diagram shows the complete database schema including the main plots table, supporting structures, and relationships.

```mermaid
erDiagram
    PLOTS {
        uuid id PK "Primary Key, Auto-generated UUID"
        varchar plot_id UK "Unique plot identifier"
        varchar section "Section name (left-pasilyo, right-block, etc.)"
        integer level "Vertical level (1-5)"
        varchar plot_number "Plot number (A1-A25, T1-T13, R1-R12)"
        varchar status "available, occupied, reserved, exhumed"
        varchar occupant_name "Name of deceased person"
        date date_of_interment "Date of burial"
        text notes "Additional notes or comments"
        timestamptz created_at "Record creation timestamp"
        timestamptz updated_at "Record last update timestamp"
    }
    
    PLOT_STATISTICS {
        bigint total_plots "Total number of plots"
        bigint available_plots "Count of available plots"
        bigint occupied_plots "Count of occupied plots"
        bigint reserved_plots "Count of reserved plots"
        bigint exhumed_plots "Count of exhumed plots"
    }
    
    PLOT_SECTIONS {
        varchar section_name "Section identifier"
        varchar section_type "pasilyo, block, apartment, fetus-crematorium"
        integer max_levels "Maximum levels in section"
        integer plots_per_level "Plots per level in section"
        varchar plot_numbering "Numbering scheme (A1-H3, A1-A25, T1-T13)"
    }
    
    INDEXES {
        varchar index_name "Index identifier"
        varchar table_name "Table name"
        varchar column_names "Indexed columns"
        varchar index_type "Index type (btree, hash)"
        varchar purpose "Performance optimization purpose"
    }
    
    CONSTRAINTS {
        varchar constraint_name "Constraint identifier"
        varchar table_name "Table name"
        varchar constraint_type "CHECK, UNIQUE, NOT NULL, FOREIGN KEY"
        varchar constraint_definition "Constraint definition"
        varchar purpose "Data integrity purpose"
    }
    
    %% Relationships
    PLOTS ||--o{ PLOT_STATISTICS : "generates"
    PLOTS }o--|| PLOT_SECTIONS : "belongs_to"
    PLOTS ||--o{ INDEXES : "optimized_by"
    PLOTS ||--o{ CONSTRAINTS : "constrained_by"
    
    %% Section Types and Examples
    PLOT_SECTIONS ||--o{ PLOTS : "contains"
```

---

## 4. System Architecture Overview

This diagram shows the high-level system architecture and technology stack.

```mermaid
graph TB
    %% Frontend Layer
    subgraph "Frontend Layer"
        React[⚛️ React Application<br/>• Components<br/>• Context API<br/>• Hooks]
        Components[🧩 React Components<br/>• MapPage<br/>• AdminDashboard<br/>• HierarchicalCemeteryMap<br/>• Modal Components]
        State[📊 State Management<br/>• AuthContext<br/>• ExhumationContext<br/>• Local Storage]
    end
    
    %% Service Layer
    subgraph "Service Layer"
        Hooks[🎣 Custom Hooks<br/>• useSupabasePlots<br/>• Plot management<br/>• Real-time updates]
        Services[⚙️ Service Functions<br/>• plotService<br/>• reservationService<br/>• sectionService]
        Utils[🛠️ Utility Functions<br/>• Data formatting<br/>• Validation<br/>• Helpers]
    end
    
    %% Backend Layer
    subgraph "Backend Layer"
        Supabase[🗃️ Supabase Backend<br/>• PostgreSQL Database<br/>• Real-time subscriptions<br/>• Authentication<br/>• API generation]
        Database[💾 Database<br/>• Plots table<br/>• Indexes<br/>• Constraints<br/>• Functions & Triggers]
    end
    
    %% External Layer
    subgraph "External Systems"
        Browser[🌐 Browser<br/>• Local Storage<br/>• Session Management<br/>• SVG Rendering]
        Users[👥 Users<br/>• Guest Users<br/>• Admin Users<br/>• Mobile/Desktop]
    end
    
    %% Connections
    Users --> React
    React --> Components
    Components --> State
    Components --> Hooks
    Hooks --> Services
    Services --> Supabase
    Supabase --> Database
    State --> Browser
    Components --> Browser
    
    %% Styling
    classDef frontendBox fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    classDef serviceBox fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    classDef backendBox fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000
    classDef externalBox fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    
    class React,Components,State frontendBox
    class Hooks,Services,Utils serviceBox
    class Supabase,Database backendBox
    class Browser,Users externalBox
```

---

## 5. Cemetery Section Structure

This diagram illustrates the hierarchical organization of the cemetery sections and plots.

    

## Legend & Symbols

### Process Types
- 🟦 **Main Process**: Core system functionality
- 🗃️ **Data Store**: Persistent data storage
- 👤 **External Entity**: Users or external systems
- ➡️ **Data Flow**: Data movement direction

### Status Indicators
- 🟢 **Available**: Plot is open for new burials
- 🔴 **Occupied**: Plot contains remains
- 🟡 **Reserved**: Plot is reserved for future use
- 🟣 **Exhumed**: Plot was occupied but remains were removed

### User Types
- 👤 **Guest User**: Public access, search and view only
- 👨‍💼 **Admin User**: Full system access, CRUD operations

### Technology Stack
- ⚛️ **React**: Frontend framework
- 🗃️ **Supabase**: Backend as a Service
- 💾 **PostgreSQL**: Database engine
- 🌐 **Browser**: Client environment

---

## Summary

These comprehensive diagrams provide a complete visual documentation of the Cemetery Management System:

1. **System Flowchart**: Shows complete user journeys and decision points
2. **Data Flow Diagram**: Illustrates system architecture and data movement
3. **Database Diagram**: Details the database schema and relationships
4. **System Architecture**: High-level technology stack overview
5. **Cemetery Structure**: Hierarchical organization of sections and plots

Each diagram uses professional symbols, clear labeling, and comprehensive coverage of the system components to provide complete visual documentation of the Cemetery Management System.



