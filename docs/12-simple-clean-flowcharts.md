# Simple Clean Flowcharts - Cemetery Management System

## Description
Simple, clean flowcharts following the style of the examples provided. Each flowchart focuses on one specific process with clear steps and minimal complexity.

## How to Use
1. Copy the Mermaid code below each flowchart
2. Go to https://mermaid.live
3. Paste the code into the editor
4. The diagram will render automatically
5. You can export as PNG, SVG, or PDF

---

## 1. 🗺️ USER MAP NAVIGATION FLOWCHART

### Description
This flowchart shows how users navigate the cemetery map to find specific plots.

### Mermaid Code

```mermaid
flowchart TD
    Start([START]) --> ViewMap[VIEW CEMETERY MAP]
    ViewMap --> ChooseSection{CHOOSE SECTION}
    
    ChooseSection -->|LEFT BLOCK| LeftBlock[VIEW LEFT BLOCK]
    ChooseSection -->|RIGHT BLOCK| RightBlock[VIEW RIGHT BLOCK]
    ChooseSection -->|APARTMENT 1| Apartment1[VIEW APARTMENT 1]
    ChooseSection -->|APARTMENT 2ND LEVEL| Apartment2[VIEW APARTMENT 2ND LEVEL]
    ChooseSection -->|APARTMENT 5| Apartment5[VIEW APARTMENT 5]
    ChooseSection -->|VETERANS| Veterans[VIEW VETERANS SECTION]
    
    LeftBlock --> SelectLevel{SELECT LEVEL}
    RightBlock --> SelectLevel
    Apartment1 --> SelectLevel
    Apartment2 --> SelectLevel
    Apartment5 --> SelectLevel
    Veterans --> SelectLevel
    
    SelectLevel -->|LEVEL 1| Level1[SHOW LEVEL 1 PLOTS]
    SelectLevel -->|LEVEL 2| Level2[SHOW LEVEL 2 PLOTS]
    SelectLevel -->|LEVEL 3| Level3[SHOW LEVEL 3 PLOTS]
    
    Level1 --> ClickPlot[CLICK ON PLOT]
    Level2 --> ClickPlot
    Level3 --> ClickPlot
    
    ClickPlot --> ViewDetails[VIEW PLOT DETAILS]
    ViewDetails --> End([END])
    
    classDef processBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef decisionBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef startEndBox fill:#ffffff,stroke:#000000,stroke-width:2px
    
    class ViewMap,LeftBlock,RightBlock,Apartment1,Apartment2,Apartment5,Veterans,Level1,Level2,Level3,ClickPlot,ViewDetails processBox
    class ChooseSection,SelectLevel decisionBox
    class Start,End startEndBox
```

---

## 2. 🔍 SEARCH PROCESS FLOWCHART

### Description
This flowchart shows how users search for loved ones in the cemetery.

### Mermaid Code

```mermaid
flowchart TD
    Start([START]) --> ViewSearch[VIEW SEARCH PAGE]
    ViewSearch --> EnterSearch[ENTER SEARCH TERM]
    EnterSearch --> SearchDatabase[SEARCH DATABASE]
    SearchDatabase --> Found{RESULTS FOUND?}
    
    Found -->|YES| ShowResults[SHOW SEARCH RESULTS]
    Found -->|NO| NoResults[SHOW NO RESULTS MESSAGE]
    
    ShowResults --> ClickResult[CLICK ON RESULT]
    ClickResult --> ViewPlot[VIEW PLOT DETAILS]
    ViewPlot --> End([END])
    
    NoResults --> End
    
    classDef processBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef decisionBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef startEndBox fill:#ffffff,stroke:#000000,stroke-width:2px
    
    class ViewSearch,EnterSearch,SearchDatabase,ShowResults,ClickResult,ViewPlot,NoResults processBox
    class Found decisionBox
    class Start,End startEndBox
```

---

## 3. 🔐 ADMIN LOGIN FLOWCHART

### Description
This flowchart shows the admin authentication process.

### Mermaid Code

```mermaid
flowchart TD
    Start([START]) --> ViewLogin[VIEW LOGIN PAGE]
    ViewLogin --> EnterCredentials[ENTER USERNAME: ADMIN<br/>ENTER PASSWORD: ADMIN123]
    EnterCredentials --> ValidateLogin[VALIDATE CREDENTIALS]
    ValidateLogin --> Valid{VALID CREDENTIALS?}
    
    Valid -->|YES| LoginSuccess[LOGIN SUCCESSFUL<br/>SET ISADMIN: TRUE<br/>STORE IN LOCALSTORAGE]
    Valid -->|NO| LoginFailed[LOGIN FAILED<br/>INVALID CREDENTIALS]
    
    LoginSuccess --> AdminDashboard[ADMIN DASHBOARD<br/>FULL SYSTEM ACCESS]
    LoginFailed --> ViewLogin
    
    AdminDashboard --> End([END])
    
    classDef processBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef decisionBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef startEndBox fill:#ffffff,stroke:#000000,stroke-width:2px
    
    class ViewLogin,EnterCredentials,ValidateLogin,LoginSuccess,LoginFailed,AdminDashboard processBox
    class Valid decisionBox
    class Start,End startEndBox
```

---

## 4. 📝 EXHUMATION REQUEST FLOWCHART

### Description
This flowchart shows how users submit exhumation requests.

### Mermaid Code

```mermaid
flowchart TD
    Start([START]) --> ViewPlot[VIEW PLOT DETAILS<br/>OCCUPANT INFORMATION<br/>PLOT STATUS<br/>BURIAL DETAILS]
    ViewPlot --> RequestExhumation{REQUEST EXHUMATION?}
    
    RequestExhumation -->|YES| FillForm[FILL EXHUMATION FORM<br/>DECEASED NAME<br/>NEXT OF KIN<br/>CONTACT NUMBER<br/>REASON FOR REQUEST]
    RequestExhumation -->|NO| End([END])
    
    FillForm --> SubmitForm[SUBMIT REQUEST<br/>STORE IN EXHUMATIONCONTEXT<br/>SET STATUS: PENDING]
    SubmitForm --> ShowConfirmation[SHOW CONFIRMATION MESSAGE<br/>REQUEST ID PROVIDED<br/>ADMIN NOTIFICATION]
    ShowConfirmation --> End
    
    classDef processBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef decisionBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef startEndBox fill:#ffffff,stroke:#000000,stroke-width:2px
    
    class ViewPlot,FillForm,SubmitForm,ShowConfirmation processBox
    class RequestExhumation decisionBox
    class Start,End startEndBox
```

---

## 5. 📋 ADMIN EXHUMATION APPROVAL FLOWCHART

### Description
This flowchart shows how admin approves exhumation requests.

### Mermaid Code

```mermaid
flowchart TD
    Start([START]) --> ViewRequests[VIEW EXHUMATION REQUESTS<br/>PENDING REQUESTS<br/>STATUS FILTERS]
    ViewRequests --> SelectRequest[SELECT REQUEST TO REVIEW<br/>VIEW REQUEST DETAILS<br/>CHECK PLOT INFORMATION]
    SelectRequest --> ReviewDetails[REVIEW REQUEST DETAILS<br/>CHECK FEASIBILITY<br/>ASSESS DOCUMENTATION]
    ReviewDetails --> Decision{APPROVE OR REJECT?}
    
    Decision -->|APPROVE| ApproveRequest[APPROVE REQUEST<br/>CHANGE STATUS: APPROVED<br/>SET EXHUMATION DATE<br/>ASSIGN TEAM]
    Decision -->|REJECT| RejectRequest[REJECT REQUEST<br/>CHANGE STATUS: REJECTED<br/>ADD REJECTION REASON<br/>PROVIDE FEEDBACK]
    
    ApproveRequest --> UpdateStatus[UPDATE STATUS TO APPROVED<br/>ADD ADMIN NOTES<br/>SET TIMELINE<br/>SEND NOTIFICATIONS]
    RejectRequest --> UpdateStatus2[UPDATE STATUS TO REJECTED<br/>REASON DOCUMENTED<br/>REQUESTER NOTIFIED<br/>REQUEST CLOSED]
    
    UpdateStatus --> NotifyUser[NOTIFY USER OF APPROVAL<br/>SCHEDULE EXHUMATION<br/>UPDATE DASHBOARD]
    UpdateStatus2 --> NotifyUser2[NOTIFY USER OF REJECTION<br/>EXPLAIN REASONS<br/>CLOSE REQUEST]
    
    NotifyUser --> End([END])
    NotifyUser2 --> End
    
    classDef processBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef decisionBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef startEndBox fill:#ffffff,stroke:#000000,stroke-width:2px
    
    class ViewRequests,SelectRequest,ReviewDetails,ApproveRequest,RejectRequest,UpdateStatus,UpdateStatus2,NotifyUser,NotifyUser2 processBox
    class Decision decisionBox
    class Start,End startEndBox
```

---

## 6. 🏗️ ADMIN PLOT MANAGEMENT FLOWCHART

### Description
This flowchart shows how admin manages cemetery plots.

### Mermaid Code

```mermaid
flowchart TD
    Start([START]) --> ViewPlots[VIEW ALL PLOTS<br/>PLOT STATISTICS<br/>STATUS OVERVIEW]
    ViewPlots --> Action{WHAT ACTION?}
    
    Action -->|ADD PLOT| AddPlot[ADD NEW PLOT<br/>SELECT SECTION/LEVEL<br/>ENTER PLOT DETAILS]
    Action -->|EDIT PLOT| EditPlot[EDIT EXISTING PLOT<br/>UPDATE OCCUPANT INFO<br/>CHANGE STATUS]
    Action -->|DELETE PLOT| DeletePlot[DELETE PLOT<br/>CHECK DEPENDENCIES<br/>VERIFY DELETION]
    
    AddPlot --> FillForm[FILL PLOT FORM<br/>PLOT ID<br/>SECTION<br/>LEVEL<br/>STATUS<br/>OCCUPANT NAME]
    EditPlot --> UpdateForm[UPDATE PLOT FORM<br/>MODIFY DETAILS<br/>CHANGE STATUS<br/>UPDATE NOTES]
    DeletePlot --> ConfirmDelete{CONFIRM DELETE?}
    
    FillForm --> SavePlot[SAVE TO DATABASE<br/>CREATE PLOT RECORD<br/>UPDATE STATISTICS]
    UpdateForm --> SavePlot
    ConfirmDelete -->|YES| DeleteFromDB[DELETE FROM DATABASE<br/>REMOVE PLOT RECORD<br/>UPDATE STATISTICS]
    ConfirmDelete -->|NO| ViewPlots
    
    SavePlot --> UpdateDisplay[UPDATE DISPLAY<br/>REFRESH MAP<br/>UPDATE STATISTICS]
    DeleteFromDB --> UpdateDisplay
    
    UpdateDisplay --> End([END])
    
    classDef processBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef decisionBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef startEndBox fill:#ffffff,stroke:#000000,stroke-width:2px
    
    class ViewPlots,AddPlot,EditPlot,DeletePlot,FillForm,UpdateForm,SavePlot,DeleteFromDB,UpdateDisplay processBox
    class Action,ConfirmDelete decisionBox
    class Start,End startEndBox
```

---

## 7. 🔄 EXHUMATION REQUEST STATUS FLOWCHART

### Description
This flowchart shows the lifecycle of an exhumation request.

### Mermaid Code

```mermaid
flowchart TD
    Start([START]) --> SubmitRequest[SUBMIT EXHUMATION REQUEST<br/>FILL FORM<br/>STORE IN CONTEXT]
    SubmitRequest --> PendingStatus[STATUS: PENDING<br/>ADMIN NOTIFICATION<br/>DASHBOARD UPDATE]
    PendingStatus --> AdminReview[ADMIN REVIEWS REQUEST<br/>CHECK DETAILS<br/>ASSESS FEASIBILITY]
    AdminReview --> Decision{APPROVE OR REJECT?}
    
    Decision -->|APPROVE| ApprovedStatus[STATUS: APPROVED<br/>SET EXHUMATION DATE<br/>ASSIGN TEAM<br/>PLOT TRANSFER]
    Decision -->|REJECT| RejectedStatus[STATUS: REJECTED<br/>ADD REJECTION REASON<br/>PROVIDE FEEDBACK]
    
    ApprovedStatus --> NotifyUser[NOTIFY USER OF APPROVAL<br/>SCHEDULE EXHUMATION<br/>UPDATE STATUS]
    RejectedStatus --> NotifyUser2[NOTIFY USER OF REJECTION<br/>EXPLAIN REASONS<br/>CLOSE REQUEST]
    
    NotifyUser --> End([END])
    NotifyUser2 --> End
    
    classDef processBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef decisionBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef startEndBox fill:#ffffff,stroke:#000000,stroke-width:2px
    
    class SubmitRequest,PendingStatus,AdminReview,ApprovedStatus,RejectedStatus,NotifyUser,NotifyUser2 processBox
    class Decision decisionBox
    class Start,End startEndBox
```

---

## 8. 🗃️ DATABASE OPERATIONS FLOWCHART

### Description
This flowchart shows how the system interacts with the database.

### Mermaid Code

```mermaid
flowchart TD
    Start([START]) --> UserAction[USER ACTION<br/>SEARCH/ADD/UPDATE/DELETE]
    UserAction --> CheckAction{WHAT ACTION?}
    
    CheckAction -->|SEARCH| SearchDB[SEARCH DATABASE<br/>QUERY PLOTS TABLE<br/>SEARCH MULTIPLE FIELDS<br/>RETURN RESULTS]
    CheckAction -->|ADD PLOT| AddToDB[ADD TO DATABASE<br/>CREATE PLOT RECORD<br/>INSERT INTO PLOTS<br/>UPDATE STATISTICS]
    CheckAction -->|UPDATE PLOT| UpdateDB[UPDATE DATABASE<br/>MODIFY PLOT RECORD<br/>UPDATE PLOTS TABLE<br/>REFRESH DATA]
    CheckAction -->|DELETE PLOT| DeleteFromDB[DELETE FROM DATABASE<br/>REMOVE PLOT RECORD<br/>UPDATE STATISTICS<br/>CLEAN UP DATA]
    
    SearchDB --> ReturnResults[RETURN SEARCH RESULTS<br/>FORMAT DATA<br/>DISPLAY RESULTS<br/>ENABLE NAVIGATION]
    AddToDB --> ConfirmAdd[CONFIRM ADDITION<br/>SHOW SUCCESS MESSAGE<br/>UPDATE DISPLAY<br/>REFRESH MAP]
    UpdateDB --> ConfirmUpdate[CONFIRM UPDATE<br/>SHOW SUCCESS MESSAGE<br/>UPDATE DISPLAY<br/>REFRESH MAP]
    DeleteFromDB --> ConfirmDelete[CONFIRM DELETION<br/>SHOW SUCCESS MESSAGE<br/>UPDATE DISPLAY<br/>REFRESH MAP]
    
    ReturnResults --> End([END])
    ConfirmAdd --> End
    ConfirmUpdate --> End
    ConfirmDelete --> End
    
    classDef processBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef decisionBox fill:#ffffff,stroke:#000000,stroke-width:2px
    classDef startEndBox fill:#ffffff,stroke:#000000,stroke-width:2px
    
    class UserAction,SearchDB,AddToDB,UpdateDB,DeleteFromDB,ReturnResults,ConfirmAdd,ConfirmUpdate,ConfirmDelete processBox
    class CheckAction decisionBox
    class Start,End startEndBox
```

---

## Summary

### 🎯 **Simple Clean Flowcharts Created:**

1. **🗺️ User Map Navigation** - How users browse cemetery sections
2. **🔍 Search Process** - How users search for loved ones
3. **🔐 Admin Login** - Simple authentication flow
4. **📝 Exhumation Request** - How users submit requests
5. **📋 Admin Exhumation Approval** - How admin reviews requests
6. **🏗️ Admin Plot Management** - How admin manages plots
7. **🔄 Exhumation Request Status** - Request lifecycle
8. **🗃️ Database Operations** - System-database interactions

### ✨ **Key Features:**
- **Simple Steps** - Only essential actions shown
- **Clear Decisions** - Easy to follow choices
- **Clean Design** - Minimal visual clutter
- **Standard Symbols** - Ovals for start/end, rectangles for processes, diamonds for decisions
- **Ready to Use** - Copy and paste into Mermaid Live Editor

Each flowchart follows the same clean, simple style as the examples provided, focusing on one specific process with clear, easy-to-follow steps.


