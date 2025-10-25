# 🏛️ Complete Exhumation System - Setup & Deployment Guide

## 📋 **Table of Contents**
1. [System Overview](#system-overview)
2. [Setup Instructions](#setup-instructions)
3. [Features Implemented](#features-implemented)
4. [How It Works](#how-it-works)
5. [Testing Guide](#testing-guide)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 **System Overview**

The Exhumation System allows users to request exhumation (removing remains) or burial (placing remains) for cemetery plots. Admins can review requests, view uploaded documents, and approve/reject with automatic email notifications.

### **User Flow:**
```
1. User clicks a plot on the map
   ↓
2. Clicks "Request Exhumation" button
   ↓
3. Fills multi-step form (4 steps):
   - Deceased Information
   - Requestor Information  
   - Exhumation Details
   - Document Uploads
   ↓
4. Submits request → Status: PENDING
   ↓
5. Admin reviews in dashboard
   ↓
6. Admin approves/rejects
   ↓
7. User receives automatic email notification
   ↓
8. User visits cemetery office for payment/verification
```

---

## 🚀 **Setup Instructions**

### **Step 1: Database Setup (5 minutes)**

#### **A. Run Database Schema**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** → **"New Query"**
4. Copy and paste the contents of: `database/exhumation-reservation-schema.sql`
5. Click **"Run"**

**What this creates:**
- ✅ `exhumation_requests` table
- ✅ Row Level Security policies
- ✅ Indexes for performance
- ✅ Triggers and functions

#### **B. Verify Database Setup**

Run this query in SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'exhumation_requests';
```

You should see: `exhumation_requests`

---

### **Step 2: Storage Bucket Setup (2 minutes)**

#### **Create Storage Bucket for Document Uploads**

1. Go to Supabase Dashboard → **Storage**
2. Click **"New Bucket"**
3. Enter these settings:
   - **Name:** `exhumation-documents`
   - **Public bucket:** `Yes` ✅ (so admins can view documents)
   - **File size limit:** 10 MB (optional)
   - **Allowed MIME types:** Leave empty (allow all)
4. Click **"Create Bucket"** ✅

#### **Set Storage Policies**

After creating the bucket, click on it → **Policies** → **New Policy**

**Policy 1: Allow authenticated users to upload**
```sql
-- Policy Name: Authenticated users can upload documents
-- Allowed operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exhumation-documents');
```

**Policy 2: Allow anyone to view documents**
```sql
-- Policy Name: Anyone can view documents
-- Allowed operation: SELECT
-- Target roles: public

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exhumation-documents');
```

---

### **Step 3: Email Notification Setup (10 minutes)**

#### **A. Deploy Edge Function**

1. Open your terminal in the project root
2. Make sure you have Supabase CLI installed:
   ```bash
   npm install -g supabase
   ```

3. Login to Supabase CLI:
   ```bash
   supabase login
   ```

4. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Get your project ref from: Dashboard → Project Settings → API)

5. Deploy the email function:
   ```bash
   supabase functions deploy send-exhumation-notification
   ```

#### **B. Set Resend API Key**

1. Get your Resend API key from: https://resend.com/api-keys
2. Add it to Supabase Secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

   OR via Dashboard:
   - Go to Project Settings → Edge Functions → Secrets
   - Add: `RESEND_API_KEY` = `re_xxxxxxxxxxxxx`

#### **C. Verify Edge Function**

Test the function in Supabase Dashboard:

1. Go to **Edge Functions** → **send-exhumation-notification**
2. Click **"Invoke Function"**
3. Use this test payload:
   ```json
   {
     "email": "test@example.com",
     "plotId": "TEST-001",
     "requestId": "test-123",
     "status": "approved",
     "requestType": "OUT",
     "deceasedName": "Test Person",
     "requestorName": "Test User",
     "adminNotes": "Request approved for testing",
     "scheduledDate": "2025-11-01"
   }
   ```
4. Click **"Run"**
5. Check your email inbox (test@example.com) for the notification

---

## ✅ **Features Implemented**

### **1. User Features:**

#### **A. Request Exhumation from Map**
- ✅ Click any plot on the cemetery map
- ✅ View plot details in modal
- ✅ "Request Exhumation" button for occupied plots
- ✅ "Request Burial" button for available plots

#### **B. Multi-Step Request Form**

**Step 1: Deceased Information**
- Deceased name
- Date of death
- Date of burial
- Relationship to requestor

**Step 2: Requestor Information**
- Full name (pre-filled from profile)
- Email address (pre-filled)
- Phone number (pre-filled)
- Complete address

**Step 3: Exhumation Details**
- Reason for exhumation
- Preferred date
- New location (for OUT requests)

**Step 4: Document Uploads**
- Valid Government ID ✅ Required
- Death Certificate ✅ Required
- Birth Certificate ✅ Required
- Affidavit of Relationship ✅ Required
- Burial Permit (optional)

**Validation:**
- All required fields must be filled
- All required documents must be uploaded
- File size limit: 10 MB per file
- Supported formats: PDF, JPG, PNG

#### **C. Request Tracking**
- View request status (Pending, Approved, Rejected, Completed)
- Track request history
- Receive email notifications on status changes

---

### **2. Admin Features:**

#### **A. Exhumation Management Dashboard**

**Statistics Overview:**
- 📊 Total requests by status
- 📊 Pending requests count
- 📊 Approved requests count
- 📊 Rejected requests count
- 📊 Completed requests count

**Request List:**
- View all exhumation requests
- Filter by status
- Sort by date
- Search by deceased name or plot ID

#### **B. Review & Approve**

**For each request, admins can:**
- ✅ View full request details
- ✅ View deceased information
- ✅ View requestor information
- ✅ View exhumation details
- ✅ Download uploaded documents
- ✅ Approve request
- ✅ Reject request
- ✅ Add admin notes
- ✅ Set exhumation date
- ✅ Assign exhumation team

**Actions:**
- **Approve** → Status: Approved → Email sent ✉️
- **Reject** → Status: Rejected → Email sent ✉️
- **Mark Complete** → Status: Completed → Plot becomes available

#### **C. Email Notifications** ✉️

**Automatically sent when:**
- Request is approved
- Request is rejected

**Email contains:**
- Request details
- Plot information
- Admin notes
- Next steps instructions
- Office hours and contact info
- Payment information (if approved)

---

## 🔄 **How It Works**

### **1. User Submits Request**

```javascript
// In ExhumationRequestForm.jsx
const handleSubmit = async () => {
  // 1. Upload documents to Supabase Storage
  const documentUrls = await uploadDocuments();
  
  // 2. Insert request into database
  const { data, error } = await supabase
    .from('exhumation_requests')
    .insert({
      user_id: user.id,
      plot_id: plot.plot_id,
      request_type: requestType, // 'IN' or 'OUT'
      deceased_name: formData.deceased_name,
      // ... other fields
      valid_id_url: documentUrls.validId,
      death_certificate_url: documentUrls.deathCert,
      status: 'pending'
    });
    
  // 3. Show success message
  alert('Request submitted successfully!');
};
```

### **2. Admin Reviews Request**

```javascript
// In ExhumationManagement.jsx
const handleStatusUpdate = async (requestId, newStatus, adminNotes) => {
  // 1. Update request status in database
  await DataService.updateExhumationRequestStatus(
    requestId, 
    newStatus, 
    adminNotes
  );
  
  // 2. Send email notification
  await supabase.functions.invoke('send-exhumation-notification', {
    body: {
      email: request.requestor_email,
      status: newStatus,
      plotId: request.plotId,
      // ... other details
    }
  });
  
  // 3. Update plot status if approved/completed
  if (newStatus === 'completed') {
    await DataService.updatePlot(plotId, { 
      status: 'available' 
    });
  }
};
```

### **3. User Receives Email**

```html
<!-- Beautiful HTML email template -->
<h1>✅ Request Approved</h1>
<p>Your exhumation request for Plot XXX has been approved.</p>
<h3>Next Steps:</h3>
<ol>
  <li>Prepare required documents</li>
  <li>Visit cemetery office</li>
  <li>Complete payment</li>
  <li>Schedule exhumation date</li>
</ol>
```

---

## 🧪 **Testing Guide**

### **Test Scenario 1: Complete User Flow**

1. **Login as regular user**
2. **Click a plot** on the cemetery map
3. **Click "Request Exhumation"** button
4. **Fill out the form:**
   - Step 1: Enter deceased info
   - Step 2: Verify requestor info
   - Step 3: Enter exhumation details
   - Step 4: Upload 4 required documents
5. **Submit the request**
6. **Verify:**
   - ✅ Success message appears
   - ✅ Request appears in database
   - ✅ Documents uploaded to storage

### **Test Scenario 2: Admin Approval Flow**

1. **Login as admin**
2. **Go to Admin Dashboard**
3. **Click "Exhumation Management"**
4. **Find pending request**
5. **Click "View Details"**
6. **Review all information**
7. **Click "Approve"**
8. **Verify:**
   - ✅ Status changed to "Approved"
   - ✅ Email notification sent
   - ✅ User receives email

### **Test Scenario 3: Email Notification**

1. **Use a real email address** when testing
2. **Admin approves a request**
3. **Check email inbox**
4. **Verify:**
   - ✅ Email received within 1 minute
   - ✅ Email contains all details
   - ✅ Email is beautifully formatted
   - ✅ "Next Steps" are clearly listed

---

## 🐛 **Troubleshooting**

### **Issue 1: Documents Not Uploading**

**Symptoms:**
- Form submission fails at document upload step
- Console error: "Storage bucket not found"

**Solution:**
1. Verify storage bucket exists: Dashboard → Storage → Check for `exhumation-documents`
2. Check bucket is public: Bucket Settings → Public bucket = Yes
3. Verify storage policies are set (see Step 2 above)

---

### **Issue 2: Email Not Sending**

**Symptoms:**
- Request approved but no email received
- Console error: "Edge function error"

**Solution:**

1. **Check Edge Function is deployed:**
   ```bash
   supabase functions list
   ```
   Should show: `send-exhumation-notification`

2. **Verify Resend API key is set:**
   ```bash
   supabase secrets list
   ```
   Should show: `RESEND_API_KEY`

3. **Test Edge Function manually:**
   - Dashboard → Edge Functions → send-exhumation-notification
   - Click "Invoke Function"
   - Use test payload (see Step 3C above)

4. **Check Edge Function logs:**
   - Dashboard → Edge Functions → send-exhumation-notification → Logs
   - Look for error messages

---

### **Issue 3: Request Not Appearing in Admin Dashboard**

**Symptoms:**
- User submits request
- Request doesn't appear in admin dashboard

**Solution:**

1. **Check database:**
   ```sql
   SELECT * FROM exhumation_requests ORDER BY created_at DESC LIMIT 10;
   ```

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'exhumation_requests';
   ```

3. **Verify admin role:**
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'admin@example.com';
   ```
   Role should be: `admin`

---

### **Issue 4: Plot Status Not Updating After Completion**

**Symptoms:**
- Request marked as "Completed"
- Plot still shows as "Occupied"

**Solution:**

1. **Check plot ID format:**
   - Request plot_id must match exactly with plots table plot_id
   - Case-sensitive!

2. **Manually update plot:**
   ```sql
   UPDATE plots 
   SET status = 'available', occupant_name = '' 
   WHERE plot_id = 'YOUR-PLOT-ID';
   ```

3. **Check DataService.updatePlot() function**

---

## 📊 **Database Schema Reference**

### **exhumation_requests Table**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to auth.users |
| `plot_id` | VARCHAR(50) | Plot identifier |
| `request_type` | VARCHAR(10) | 'IN' or 'OUT' |
| `deceased_name` | VARCHAR(255) | Name of deceased |
| `deceased_date_of_death` | DATE | Date of death |
| `deceased_relationship` | VARCHAR(100) | Relationship to requestor |
| `requestor_name` | VARCHAR(255) | Requestor's name |
| `requestor_email` | VARCHAR(255) | Requestor's email |
| `requestor_phone` | VARCHAR(50) | Requestor's phone |
| `reason_for_exhumation` | TEXT | Reason for request |
| `valid_id_url` | TEXT | URL to uploaded ID |
| `death_certificate_url` | TEXT | URL to death cert |
| `birth_certificate_url` | TEXT | URL to birth cert |
| `affidavit_url` | TEXT | URL to affidavit |
| `status` | VARCHAR(20) | pending/approved/rejected/completed |
| `admin_notes` | TEXT | Admin review notes |
| `created_at` | TIMESTAMP | Request creation time |

---

## 🎉 **You're All Set!**

The exhumation system is now fully functional with:
- ✅ User request flow
- ✅ Multi-step form with validation
- ✅ Document uploads
- ✅ Admin review dashboard
- ✅ Automatic email notifications
- ✅ Beautiful email templates
- ✅ Plot status updates
- ✅ Complete audit trail

---

## 📞 **Support**

If you encounter any issues:
1. Check the troubleshooting section above
2. Check Supabase logs (Database → Logs)
3. Check browser console for errors
4. Check Edge Function logs for email issues

---

**Date:** October 25, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

