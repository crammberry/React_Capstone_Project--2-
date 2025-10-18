# Database Diagram - Cemetery Management System

## Overview
This Entity-Relationship Diagram (ERD) shows the database schema for the Cemetery Management System, following the traditional ERD notation with clear table structures and relationships.

## Database Technology
- **Database**: PostgreSQL (via Supabase)
- **Extensions**: UUID-OSSP for UUID generation
- **Indexing**: Optimized for common query patterns
- **Constraints**: Data integrity and validation rules

---

## Database Schema Diagram

```mermaid
erDiagram
    PLOTS {
        uuid id PK "Primary Key, Auto-generated UUID"
        varchar plot_id UK "Unique plot identifier"
        varchar section "Section name (left-side-pasilyo, etc.)"
        int level "Vertical level (1, 2, 3)"
        varchar plot_number "Plot number (A1, A2, T1, R1)"
        varchar status "available, occupied, reserved, exhumed"
        varchar occupant_name "Name of deceased person"
        int age "Age at death"
        varchar cause_of_death "Cause of death"
        varchar religion "Religious affiliation"
        varchar family_name "Family surname"
        varchar next_of_kin "Next of kin name"
        varchar contact_number "Contact phone number"
        date date_of_interment "Date of burial"
        text notes "Additional notes"
        timestamptz created_at "Record creation timestamp"
        timestamptz updated_at "Record last update timestamp"
    }
    
    EXHUMATION_REQUESTS {
        int id PK "Primary Key, Auto-increment"
        varchar plot_id FK "References plots.plot_id"
        varchar deceased_name "Name of deceased person"
        varchar next_of_kin "Next of kin name"
        varchar contact_number "Contact phone number"
        varchar relationship "Relationship to deceased"
        varchar reason "Reason for exhumation"
        text alternative_location "New burial location"
        text special_instructions "Special handling instructions"
        timestamp request_date "Date request was made"
        varchar status "pending, approved, rejected, completed"
        text admin_notes "Administrator notes"
        date exhumation_date "Scheduled exhumation date"
        varchar exhumation_team "Assigned team name"
        text_array documents "Array of document filenames"
        timestamp created_at "Record creation timestamp"
        timestamp updated_at "Record last update timestamp"
    }
    
    PLOT_SECTIONS {
        varchar section_name PK "Primary Key, Section identifier"
        varchar section_type "pasilyo, block, apartment, fetus-crematorium"
        int max_levels "Maximum levels in section"
        int plots_per_level "Plots per level in section"
        text description "Section description"
        varchar status "active, inactive, maintenance"
        timestamptz created_at "Record creation timestamp"
        timestamptz updated_at "Record last update timestamp"
    }
    
    ADMIN_USERS {
        int id PK "Primary Key, Auto-increment"
        varchar username UK "Unique username"
        varchar password_hash "Hashed password"
        varchar full_name "Administrator full name"
        varchar email UK "Unique email address"
        varchar role "admin, super_admin, manager"
        varchar status "active, inactive, suspended"
        timestamp last_login "Last login timestamp"
        timestamptz created_at "Account creation timestamp"
        timestamptz updated_at "Account last update timestamp"
    }
    
    PLOT_STATISTICS {
        int id PK "Primary Key, Auto-increment"
        varchar section_name FK "References plot_sections.section_name"
        int total_plots "Total number of plots"
        int available_plots "Count of available plots"
        int occupied_plots "Count of occupied plots"
        int reserved_plots "Count of reserved plots"
        int exhumed_plots "Count of exhumed plots"
        date statistics_date "Date of statistics"
        timestamptz updated_at "Statistics last update timestamp"
    }
    
    %% Relationships
    PLOTS ||--o{ EXHUMATION_REQUESTS : "plot_id"
    PLOT_SECTIONS ||--o{ PLOTS : "section"
    PLOT_SECTIONS ||--o{ PLOT_STATISTICS : "section_name"
    ADMIN_USERS ||--o{ EXHUMATION_REQUESTS : "processed_by"
    
    %% Styling
    classDef tableBox fill:#f8f9fa,stroke:#343a40,stroke-width:2px,color:#000
    classDef primaryKey fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    classDef foreignKey fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    
    class PLOTS,EXHUMATION_REQUESTS,PLOT_SECTIONS,ADMIN_USERS,PLOT_STATISTICS tableBox
```

---

## Table Descriptions

### PLOTS Table
The main table storing all cemetery plot information:
- **Primary Key**: `id` (UUID)
- **Unique Key**: `plot_id` (custom plot identifier)
- **Status Values**: available, occupied, reserved, exhumed
- **Indexes**: section, level, status, section+level
- **Triggers**: Auto-update `updated_at` timestamp

### EXHUMATION_REQUESTS Table
Stores exhumation requests and their processing status:
- **Primary Key**: `id` (auto-increment integer)
- **Foreign Key**: `plot_id` references `plots.plot_id`
- **Status Values**: pending, approved, rejected, completed
- **Indexes**: plot_id, status, request_date
- **Features**: Document storage array, team assignment

### PLOT_SECTIONS Table
Defines cemetery sections and their properties:
- **Primary Key**: `section_name`
- **Section Types**: pasilyo, block, apartment, fetus-crematorium
- **Properties**: max_levels, plots_per_level, description

### ADMIN_USERS Table
Stores administrator account information:
- **Primary Key**: `id` (auto-increment integer)
- **Unique Keys**: username, email
- **Roles**: admin, super_admin, manager
- **Security**: Hashed passwords, login tracking

### PLOT_STATISTICS Table
Maintains statistical data for each section:
- **Primary Key**: `id` (auto-increment integer)
- **Foreign Key**: `section_name` references `plot_sections.section_name`
- **Metrics**: Total, available, occupied, reserved, exhumed counts
- **Features**: Date-based statistics tracking

---

## Relationships

1. **PLOTS ↔ EXHUMATION_REQUESTS**: One-to-Many
   - A plot can have multiple exhumation requests over time
   - Each request is linked to a specific plot via `plot_id`

2. **PLOT_SECTIONS ↔ PLOTS**: One-to-Many
   - Each section contains multiple plots
   - Plots are organized by section name

3. **PLOT_SECTIONS ↔ PLOT_STATISTICS**: One-to-Many
   - Each section can have multiple statistical records
   - Statistics are tracked over time

4. **ADMIN_USERS ↔ EXHUMATION_REQUESTS**: One-to-Many
   - Administrators can process multiple exhumation requests
   - Tracks who processed each request

---

## Key Features

### Data Integrity
- **Foreign Key Constraints**: Maintain referential integrity
- **Check Constraints**: Validate status values and data ranges
- **Unique Constraints**: Prevent duplicate plot IDs and usernames
- **NOT NULL Constraints**: Ensure required fields are populated

### Performance Optimization
- **Indexes**: Optimized for common query patterns
- **Composite Indexes**: Multi-column indexes for complex queries
- **UUID Primary Keys**: Distributed system compatibility
- **Timestamp Tracking**: Audit trail for all records

### Security Features
- **Password Hashing**: Secure password storage
- **Role-Based Access**: Different admin permission levels
- **Audit Logging**: Track all data modifications
- **Session Management**: Secure authentication handling

---

## How to Use This Diagram

1. Copy the Mermaid code above
2. Go to https://mermaid.live
3. Paste the code into the editor
4. The diagram will render automatically
5. You can export as PNG, SVG, or PDF

This diagram follows the traditional ERD notation with:
- **Tables**: Represented as rectangles with table names
- **Primary Keys**: Marked with "PK"
- **Foreign Keys**: Marked with "FK"
- **Unique Keys**: Marked with "UK"
- **Data Types**: Specified for each column
- **Relationships**: Connected with lines showing cardinality


