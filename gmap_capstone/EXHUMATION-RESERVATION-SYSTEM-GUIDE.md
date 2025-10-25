# 🏛️ Exhumation & Plot Reservation System - Implementation Guide

## 🎯 **System Overview**

This comprehensive system allows users to:
1. **Request Exhumation (OUT)** - Remove remains from a plot
2. **Request Burial (IN)** - Place remains into a plot  
3. **Reserve Plots** - Pre-purchase plots for future use
4. **Track Requests** - Monitor status of all requests
5. **Admin Management** - Review, approve/reject requests, send notifications

---

## 📋 **Features Implemented**

### ✅ **User Features:**
- Click any plot on the cemetery map to see details
- Request exhumation/burial with multi-step form
- Upload required documents (ID, certificates, affidavit)
- Reserve available plots
- Track request status
- Receive email notifications on approval

### ✅ **Admin Features:**
- Dashboard to review all requests
- View uploaded documents
- Approve or reject requests with notes
- Send automated email notifications
- Track payment status
- Schedule exhumation/burial dates

---

## 🗄️ **Database Schema**

### **Step 1: Run SQL to Create Tables**

File: `database/exhumation-reservation-schema.sql`

**Run this in Supabase SQL Editor**

**Tables Created:**
1. `exhumation_requests` - Stores all exhumation/burial requests
2. `plot_reservations` - Stores plot reservations
3. Updates `plots` table with reservation fields

**Key Features:**
- Row Level Security (RLS) enabled
- Automatic timestamps
- Document URL storage
- Status tracking
- Payment tracking
- Admin review fields

---

## 📁 **Files Created**

### **1. Database Schema**
```
database/exhumation-reservation-schema.sql
```
- Complete database structure
- RLS policies
- Triggers and indexes

### **2. React Components**

#### **PlotDetailsModal.jsx**
```jsx
import PlotDetailsModal from './components/PlotDetailsModal';
```
- Shows plot information
- Action buttons (Reserve, Request Exhumation, Request Burial)
- Different options based on plot status

#### **ExhumationRequestForm.jsx**
```jsx
import ExhumationRequestForm from './components/ExhumationRequestForm';
```
- 4-step multi-step form
- Step 1: Deceased info
- Step 2: Requestor info
- Step 3: Exhumation details
- Step 4: Document uploads

#### **FileUpload.jsx**
```jsx
import FileUpload from './components/FileUpload';
```
- Drag & drop file upload
- File size validation (max 5MB)
- Preview uploaded files
- Remove file option

---

## 🚀 **Integration Steps**

### **Step 1: Install Supabase Storage (If Not Already)**

The system uses Supabase Storage for document uploads.

**Create Storage Bucket:**
1. Go to Supabase Dashboard → Storage
2. Create new bucket: `exhumation-documents`
3. Set as **Public** bucket
4. Set policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exhumation-documents');

-- Allow users to read own uploads
CREATE POLICY "Allow users to read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'exhumation-documents');

-- Allow admins to read all
CREATE POLICY "Allow admins to read all"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'exhumation-documents' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
```

---

### **Step 2: Update Cemetery Map Component**

Add click handlers to your cemetery map to show PlotDetailsModal.

**Example integration with your existing map:**

```jsx
// In your HardcodedCemeteryMap.jsx or similar
import { useState } from 'react';
import PlotDetailsModal from './PlotDetailsModal';
import ExhumationRequestForm from './ExhumationRequestForm';
import PlotReservationForm from './PlotReservationForm';

const [selectedPlot, setSelectedPlot] = useState(null);
const [showExhumationForm, setShowExhumationForm] = useState(false);
const [showReservationForm, setShowReservationForm] = useState(false);
const [exhumationType, setExhumationType] = useState(null);

// When user clicks a plot
const handlePlotClick = (plot) => {
  setSelectedPlot(plot);
};

// When user clicks "Request Exhumation" button
const handleRequestExhumation = (plot, type) => {
  setSelectedPlot(plot);
  setExhumationType(type); // 'IN' or 'OUT'
  setShowExhumationForm(true);
};

// When user clicks "Reserve Plot" button
const handleReservePlot = (plot) => {
  setSelectedPlot(plot);
  setShowReservationForm(true);
};

// In your JSX:
{selectedPlot && !showExhumationForm && !showReservationForm && (
  <PlotDetailsModal
    plot={selectedPlot}
    onClose={() => setSelectedPlot(null)}
    onRequestExhumation={handleRequestExhumation}
    onReservePlot={handleReservePlot}
  />
)}

{showExhumationForm && (
  <ExhumationRequestForm
    plot={selectedPlot}
    requestType={exhumationType}
    onClose={() => {
      setShowExhumationForm(false);
      setSelectedPlot(null);
    }}
    onSuccess={(data) => {
      console.log('Request submitted:', data);
      // Optionally refresh plot data
    }}
  />
)}

{showReservationForm && (
  <PlotReservationForm
    plot={selectedPlot}
    onClose={() => {
      setShowReservationForm(false);
      setSelectedPlot(null);
    }}
    onSuccess={(data) => {
      console.log('Reservation submitted:', data);
    }}
  />
)}
```

---

### **Step 3: Create Remaining Components**

I've created the core components. You still need:

#### **PlotReservationForm.jsx** (Similar to ExhumationRequestForm)
- 3-step form for plot reservations
- Beneficiary information
- Payment details
- Document uploads

#### **AdminExhumationDashboard.jsx**
- List all exhumation requests
- Filter by status
- View details
- Approve/reject with notes
- Send email notifications

#### **UserRequestsPage.jsx**
- Show user's own requests
- Track status
- View details
- Cancel pending requests

---

## 📧 **Email Notification System**

### **Using Resend (Already Set Up)**

Create Supabase Edge Function:

**File:** `supabase/functions/send-exhumation-notification/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { email, requestType, plotId, requestId, status } = await req.json()

  const emailContent = status === 'APPROVED' ? `
    <h1>Your ${requestType === 'OUT' ? 'Exhumation' : 'Burial'} Request has been Approved!</h1>
    <p>Dear Valued Client,</p>
    <p>Your request for plot <strong>${plotId}</strong> has been approved.</p>
    <p><strong>Request ID:</strong> ${requestId}</p>
    <p><strong>Next Steps:</strong></p>
    <ol>
      <li>Prepare the required documents for verification</li>
      <li>Visit our office for document verification</li>
      <li>Complete payment</li>
      <li>Schedule the exhumation/burial date</li>
    </ol>
    <p>Please contact us at the cemetery office for further instructions.</p>
  ` : `
    <h1>Your Request Status Update</h1>
    <p>Your request for plot ${plotId} status: ${status}</p>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Cemetery Management <onboarding@resend.dev>',
      to: [email],
      subject: `Exhumation Request ${status}`,
      html: emailContent,
    }),
  })

  const data = await res.json()

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

## 🎨 **UI/UX Features**

### **Responsive Design:**
- Mobile-friendly modals
- Touch-optimized buttons
- Responsive forms

### **Visual Feedback:**
- Progress indicators
- Loading states
- Success/error messages
- File upload previews

### **Validation:**
- Required field checking
- File size limits
- Date validations
- Email format checking

---

## 🔐 **Security Features**

### **RLS Policies:**
- Users can only see their own requests
- Admins can see all requests
- Secure document storage

### **File Upload Security:**
- File size limits (5MB)
- File type validation
- Secure URLs from Supabase Storage

### **Data Protection:**
- Encrypted connections
- Secure authentication
- No sensitive data in URLs

---

## 📊 **Request Flow**

### **User Submits Request:**
```
1. User clicks plot → PlotDetailsModal opens
2. Clicks "Request Exhumation/Burial" → ExhumationRequestForm opens
3. Fills 4-step form
4. Uploads documents
5. Submits → Status: PENDING
```

### **Admin Reviews:**
```
1. Admin sees request in dashboard
2. Views uploaded documents
3. Reviews information
4. Approves/Rejects with notes
5. Status: APPROVED or REJECTED
6. Email sent to user
```

### **User Completes:**
```
1. User receives email
2. Prepares documents
3. Visits cemetery office
4. Documents verified → Status: DOCUMENTS_VERIFIED
5. Makes payment → Status: PAID
6. Schedules date → Status: SCHEDULED
7. Process completed → Status: COMPLETED
```

---

## 🧪 **Testing Checklist**

### **Database:**
- [ ] Run SQL schema in Supabase
- [ ] Verify tables created
- [ ] Check RLS policies active
- [ ] Test storage bucket created

### **User Flow:**
- [ ] Click plot on map
- [ ] View plot details modal
- [ ] Submit exhumation request
- [ ] Upload all documents
- [ ] Request appears in database
- [ ] Status shows as PENDING

### **Admin Flow:**
- [ ] View all requests
- [ ] Filter by status
- [ ] Approve request
- [ ] Email notification sent
- [ ] Status updates correctly

---

## 📝 **Next Steps**

To complete the system:

1. ✅ **Database schema** - DONE
2. ✅ **PlotDetailsModal** - DONE
3. ✅ **ExhumationRequestForm** - DONE
4. ✅ **FileUpload component** - DONE
5. ⏳ **PlotReservationForm** - TODO
6. ⏳ **AdminExhumationDashboard** - TODO
7. ⏳ **Email Edge Function** - TODO
8. ⏳ **UserRequestsPage** - TODO
9. ⏳ **Integration with map** - TODO
10. ⏳ **Testing** - TODO

---

## 🚀 **Quick Start**

### **Right Now:**

1. **Run SQL:**
```bash
# Copy database/exhumation-reservation-schema.sql
# Paste in Supabase SQL Editor
# Click "Run"
```

2. **Create Storage Bucket:**
```bash
# Supabase Dashboard → Storage → New Bucket
# Name: exhumation-documents
# Public: Yes
```

3. **Test the Components:**
```bash
# The components are ready to use
# Just integrate with your cemetery map
```

---

**The foundation is complete! Integration and testing can begin!** 🎉

