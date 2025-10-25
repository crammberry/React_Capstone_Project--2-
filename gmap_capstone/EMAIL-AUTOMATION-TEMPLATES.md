# 📧 Email Automation Templates for Cemetery System

## 🎯 **All Automated Emails Using Resend**

Your Resend subdomain (`eternal-rest.resend.dev`) will handle ALL automated emails:
- Registration verification codes
- Exhumation request notifications
- Payment reminders
- Status updates
- Document requests

---

## 📋 **Email Templates:**

### **1. Exhumation Request Approved ✅**

**Trigger:** Admin approves exhumation request  
**Recipient:** User who requested  
**From:** `Cemetery Management <noreply@eternal-rest.resend.dev>`

```typescript
// supabase/functions/send-exhumation-approval/index.ts
{
  from: 'Cemetery Management <noreply@eternal-rest.resend.dev>',
  to: userEmail,
  subject: '✅ Exhumation Request Approved',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 2rem; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 2rem;">✅ Request Approved</h1>
        <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Exhumation Request #${requestId}</p>
      </div>
      
      <div style="padding: 2rem; background: #f8fafc;">
        <h2 style="color: #374151;">Good News!</h2>
        <p style="color: #6b7280; line-height: 1.6;">
          Your exhumation request for <strong>Plot ${plotId}</strong> has been approved.
        </p>
        
        <div style="background: white; border-left: 4px solid #10b981; padding: 1rem; margin: 1.5rem 0;">
          <h3 style="margin: 0 0 0.5rem 0; color: #374151;">Next Steps:</h3>
          <ol style="margin: 0; padding-left: 1.5rem; color: #6b7280;">
            <li>Visit the cemetery office for payment</li>
            <li>Bring valid ID and this email</li>
            <li>Schedule date: ${scheduledDate}</li>
          </ol>
        </div>
        
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 0.5rem; padding: 1rem; margin-top: 1.5rem;">
          <p style="margin: 0; color: #1e40af; font-size: 0.875rem;">
            <strong>Payment Amount:</strong> ₱${paymentAmount}<br>
            <strong>Due Date:</strong> ${dueDate}
          </p>
        </div>
      </div>
      
      <div style="background: #f9fafb; padding: 1rem; text-align: center; color: #6b7280; font-size: 0.75rem;">
        <p style="margin: 0;">© 2024 Cemetery Management System</p>
      </div>
    </div>
  `
}
```

---

### **2. Exhumation Request Rejected ❌**

**Trigger:** Admin rejects exhumation request  
**Recipient:** User who requested

```typescript
{
  from: 'Cemetery Management <noreply@eternal-rest.resend.dev>',
  to: userEmail,
  subject: '❌ Exhumation Request - Action Required',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 2rem; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 2rem;">❌ Request Update</h1>
        <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Exhumation Request #${requestId}</p>
      </div>
      
      <div style="padding: 2rem; background: #f8fafc;">
        <h2 style="color: #374151;">Request Status Update</h2>
        <p style="color: #6b7280; line-height: 1.6;">
          We regret to inform you that your exhumation request for <strong>Plot ${plotId}</strong> 
          requires additional information or cannot be processed at this time.
        </p>
        
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1rem; margin: 1.5rem 0;">
          <h3 style="margin: 0 0 0.5rem 0; color: #991b1b;">Reason:</h3>
          <p style="margin: 0; color: #7f1d1d;">${rejectionReason}</p>
        </div>
        
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 0.5rem; padding: 1rem; margin-top: 1.5rem;">
          <p style="margin: 0; color: #1e40af; font-size: 0.875rem;">
            <strong>What to do next:</strong><br>
            Please contact our office or submit a new request with the required information.
          </p>
        </div>
      </div>
    </div>
  `
}
```

---

### **3. Payment Reminder 💰**

**Trigger:** Payment due date approaching (automated daily check)  
**Recipient:** Users with pending payments

```typescript
{
  from: 'Cemetery Management <noreply@eternal-rest.resend.dev>',
  to: userEmail,
  subject: '💰 Payment Reminder - Due in ${daysRemaining} days',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 2rem; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 2rem;">💰 Payment Reminder</h1>
        <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Request #${requestId}</p>
      </div>
      
      <div style="padding: 2rem; background: #f8fafc;">
        <h2 style="color: #374151;">Payment Due Soon</h2>
        <p style="color: #6b7280; line-height: 1.6;">
          This is a friendly reminder that your payment for <strong>Plot ${plotId}</strong> 
          is due in <strong>${daysRemaining} days</strong>.
        </p>
        
        <div style="background: white; border: 2px solid #f59e0b; border-radius: 0.75rem; padding: 1.5rem; text-align: center; margin: 1.5rem 0;">
          <div style="font-size: 2rem; font-weight: bold; color: #f59e0b;">
            ₱${paymentAmount}
          </div>
          <p style="margin: 0.5rem 0 0 0; color: #6b7280;">Due: ${dueDate}</p>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 0.5rem; padding: 1rem;">
          <p style="margin: 0; color: #92400e; font-size: 0.875rem;">
            <strong>⚠️ Important:</strong> Please complete payment before the due date to avoid cancellation.
          </p>
        </div>
      </div>
    </div>
  `
}
```

---

### **4. Plot Reservation Confirmed 🎉**

**Trigger:** User successfully reserves a plot  
**Recipient:** User who reserved

```typescript
{
  from: 'Cemetery Management <noreply@eternal-rest.resend.dev>',
  to: userEmail,
  subject: '🎉 Plot Reservation Confirmed',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 2rem; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 2rem;">🎉 Reservation Confirmed</h1>
        <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Plot ${plotId}</p>
      </div>
      
      <div style="padding: 2rem; background: #f8fafc;">
        <h2 style="color: #374151;">Congratulations!</h2>
        <p style="color: #6b7280; line-height: 1.6;">
          Your plot reservation has been confirmed. Here are your details:
        </p>
        
        <div style="background: white; border: 2px solid #3b82f6; border-radius: 0.75rem; padding: 1.5rem; margin: 1.5rem 0;">
          <h3 style="margin: 0 0 1rem 0; color: #1e40af;">Reservation Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 0.5rem 0; color: #6b7280;">Plot ID:</td>
              <td style="padding: 0.5rem 0; color: #374151; font-weight: 600;">${plotId}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; color: #6b7280;">Section:</td>
              <td style="padding: 0.5rem 0; color: #374151; font-weight: 600;">${section}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; color: #6b7280;">Level:</td>
              <td style="padding: 0.5rem 0; color: #374151; font-weight: 600;">Level ${level}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; color: #6b7280;">Reserved Until:</td>
              <td style="padding: 0.5rem 0; color: #374151; font-weight: 600;">${reservedUntil}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 0.5rem; padding: 1rem;">
          <p style="margin: 0; color: #1e3a8a; font-size: 0.875rem;">
            <strong>📋 Next Steps:</strong> Visit our office within 7 days to complete the reservation process.
          </p>
        </div>
      </div>
    </div>
  `
}
```

---

### **5. Document Upload Required 📄**

**Trigger:** Admin requests additional documents  
**Recipient:** User

```typescript
{
  from: 'Cemetery Management <noreply@eternal-rest.resend.dev>',
  to: userEmail,
  subject: '📄 Additional Documents Required',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 2rem; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 2rem;">📄 Action Required</h1>
        <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Request #${requestId}</p>
      </div>
      
      <div style="padding: 2rem; background: #f8fafc;">
        <h2 style="color: #374151;">Additional Documents Needed</h2>
        <p style="color: #6b7280; line-height: 1.6;">
          To process your request for <strong>Plot ${plotId}</strong>, we need the following documents:
        </p>
        
        <div style="background: white; border-left: 4px solid #8b5cf6; padding: 1rem; margin: 1.5rem 0;">
          <h3 style="margin: 0 0 0.5rem 0; color: #374151;">Required Documents:</h3>
          <ul style="margin: 0; padding-left: 1.5rem; color: #6b7280;">
            ${requiredDocuments.map(doc => `<li>${doc}</li>`).join('')}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 2rem 0;">
          <a href="${uploadLink}" style="display: inline-block; background: #8b5cf6; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 0.5rem; font-weight: 600;">
            Upload Documents
          </a>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 0.5rem; padding: 1rem;">
          <p style="margin: 0; color: #92400e; font-size: 0.875rem;">
            <strong>⏰ Deadline:</strong> Please upload within ${deadline} to avoid delays.
          </p>
        </div>
      </div>
    </div>
  `
}
```

---

## 🤖 **How to Implement Automation:**

### **1. Create Edge Functions for Each Email Type:**

```bash
# In your Supabase project
supabase functions new send-exhumation-approval
supabase functions new send-exhumation-rejection
supabase functions new send-payment-reminder
supabase functions new send-reservation-confirmation
supabase functions new send-document-request
```

### **2. Trigger Emails from Your App:**

```javascript
// When admin approves exhumation
const sendApprovalEmail = async (requestId, userEmail) => {
  const { data } = await supabase.functions.invoke('send-exhumation-approval', {
    body: {
      requestId,
      userEmail,
      plotId: request.plot_id,
      scheduledDate: request.scheduled_date,
      paymentAmount: request.payment_amount,
      dueDate: request.payment_due_date
    }
  });
};
```

### **3. Set Up Database Triggers:**

```sql
-- Auto-send email when status changes to 'APPROVED'
CREATE OR REPLACE FUNCTION notify_exhumation_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
    PERFORM net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/send-exhumation-approval',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'requestId', NEW.id,
        'userEmail', (SELECT email FROM profiles WHERE id = NEW.user_id),
        'plotId', NEW.plot_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exhumation_approval_trigger
AFTER UPDATE ON exhumation_requests
FOR EACH ROW
EXECUTE FUNCTION notify_exhumation_approval();
```

---

## 📊 **Email Automation Flow:**

```
User Action → Database Update → Trigger → Edge Function → Resend API → Email Sent
```

**Example:**
```
Admin clicks "Approve" 
  → exhumation_requests.status = 'APPROVED'
  → Database trigger fires
  → Calls send-exhumation-approval function
  → Resend sends email
  → User receives notification
```

---

## 💡 **Benefits of This Setup:**

1. ✅ **Fully Automated** - No manual email sending
2. ✅ **Instant Delivery** - Emails sent in seconds
3. ✅ **Professional** - Beautiful HTML templates
4. ✅ **Reliable** - Resend handles delivery
5. ✅ **Scalable** - Works for 1 user or 10,000 users
6. ✅ **Free** - Within Resend's generous limits

---

## 📈 **Resend Free Tier Limits:**

- **100 emails/day** - Perfect for starting
- **3,000 emails/month** - Plenty for most cemeteries
- **Upgrade available** - If you need more

---

## 🎯 **Summary:**

Your Resend subdomain (`eternal-rest.resend.dev`) will handle:
- ✅ Registration verification codes
- ✅ Exhumation approvals/rejections
- ✅ Payment reminders
- ✅ Reservation confirmations
- ✅ Document requests
- ✅ Any other automated notifications

**This is exactly how professional systems like Airbnb, Uber, etc. work!** 🚀

